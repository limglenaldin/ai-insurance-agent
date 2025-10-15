import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import {
  UserProfile,
  DocumentSnippet,
  Citation,
  ChatMessage,
} from "@/lib/types";
import {
  getVehicleTypeLabel,
  getCityLabel,
  getUsageTypeLabel,
} from "@/lib/utils";
import { createLogger } from "@/lib/logger";

// No longer using pdfjs-dist - using Python service instead

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  const log = createLogger("chat-api");

  log.info({ url: "/api/chat" }, "Started request");
  try {
    const { message, profile, conversationHistory = [] } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Build conversation memory and enhance query
    const conversationMemory = buildConversationMemory(
      conversationHistory,
      profile
    );
    const contextualQuery = enhanceQueryWithContext(
      message,
      conversationMemory
    );

    // Extract document content using Python search service with enhanced query
    const documentSnippets = await extractDocumentSnippetsFromPython(
      contextualQuery,
      profile
    );

    // Compose grounded prompt
    const context = documentSnippets
      .slice(0, 6) // Limit to 3-6 excerpts as per sequence diagram
      .map((snippet) => `**${snippet.docTitle}**\n${snippet.content}`)
      .join("\n\n---\n\n");

    // Build Miria persona with conversation memory
    const recentConversation = formatRecentConversation(conversationHistory);

    const systemPrompt = `Aku Miria, konsultan asuransi berpengalaman yang ramah dan dapat dipercaya. Aku berbicara dengan bahasa yang mudah dipahami dan natural, seperti berbincang dengan teman. Aku selalu mengutamakan akurasi informasi dan memberikan penjelasan yang jelas.

KEPRIBADIAN AKU:
- Ramah dan sabar dalam menjelaskan
- Bicara natural dan mudah dipahami seperti teman dekat
- Menggunakan contoh konkret dari kehidupan sehari-hari
- Menyebutkan nama produk spesifik
- Menghindari pengulangan yang tidak perlu

ATURAN BAHASA PENTING:
- SELALU gunakan "aku" untuk diri sendiri, JANGAN "saya"
- SELALU gunakan "kamu" untuk pengguna, JANGAN "Anda" atau "anda"
- Gunakan gaya bahasa santai dan akrab seperti berbicara dengan teman
- Contoh: "Aku bisa bantu kamu", "kamu bisa pilih", "mobil kamu"

ATURAN PENTING:
1. Jawab HANYA berdasarkan DOKUMEN di bawah ini
2. Jangan menyebutkan nama dokumen dalam teks jawaban - nama dokumen sudah ditampilkan sebagai **bold text**
3. Gunakan referensi natural seperti "menurut dokumen resmi", "berdasarkan informasi yang aku miliki"
4. JANGAN spekulasi atau menambah informasi di luar dokumen
5. Jika informasi tidak ada di dokumen, katakan "Maaf, informasi ini tidak tersedia dalam dokumen resmi yang aku miliki"
6. Gunakan bahasa Indonesia yang natural dan hangat seperti percakapan biasa

MEMORI PERCAKAPAN:
${JSON.stringify(conversationMemory, null, 2)}

PANDUAN ANTI-REPETISI:
${
  conversationMemory.explainedConcepts.length > 0
    ? `- JANGAN ULANGI topik ini: ${conversationMemory.explainedConcepts.join(
        ", "
      )}
- Berikan informasi BARU dan detail yang BELUM dijelaskan
- Hindari menyebutkan hal yang sama lagi`
    : "- Percakapan baru - mulai dengan ramah"
}
${
  conversationMemory.keyPhrases.length > 0
    ? `- JANGAN GUNAKAN kalimat serupa dengan ini lagi:
${conversationMemory.keyPhrases
  .map((phrase) => `  * "${phrase.substring(0, 80)}..."`)
  .join("\n")}
- Cari cara BERBEDA untuk menjelaskan informasi yang sama
- Gunakan sudut pandang atau detail yang BERBEDA`
    : ""
}
${
  conversationMemory.disclaimerShown
    ? "- Disclaimer sudah pernah disebutkan - JANGAN ulangi"
    : "- Tambahkan disclaimer jika relevan"
}

FOKUS RESPONS:
- Jawab pertanyaan spesifik user dengan bahasa "aku-kamu"
- Berikan detail baru yang belum disebutkan
- Jangan mengulang paragraf yang sama
- HINDARI kalimat seperti "Selain itu, Asuransi Mobil Autocillin juga menawarkan..." jika sudah pernah disebutkan
- JANGAN ulangi informasi tentang bengkel ATMP dan layanan darurat jika sudah dijelaskan
- Variasikan cara menjelaskan manfaat produk - jangan gunakan struktur kalimat yang sama
- KONSISTEN pakai "aku" dan "kamu" - jangan campur dengan "saya" atau "Anda"

${
  recentConversation
    ? `PERCAKAPAN TERAKHIR:
${recentConversation}`
    : ""
}

PROFIL PENGGUNA:
${
  profile
    ? `- Kendaraan: ${getVehicleTypeLabel(profile.vehicleType)} (${
        profile.vehicleYear
      })
- Lokasi: ${getCityLabel(profile.city)}
- Penggunaan: ${getUsageTypeLabel(profile.usageType)}
- Area rawan banjir: ${profile.floodRisk ? "Ya" : "Tidak"}

Berikan saran yang relevan dengan profil ini, terutama ${
        profile.floodRisk ? "perlindungan banjir" : "perlindungan umum"
      } untuk daerah ${profile.city}.`
    : "Belum ada profil - berikan informasi umum"
}

DOKUMEN SUMBER:
${context}

Berdasarkan HANYA pada dokumen di atas dan memori percakapan, jawab pertanyaan dengan cara Miria yang ramah dan natural. Berbicara seperti konsultan asuransi yang berpengalaman tapi santai dan mudah dipahami. INGAT: Selalu gunakan "aku" dan "kamu" secara konsisten!`;

    // Send to Groq/Llama
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.1, // Low temperature for factual responses
      max_tokens: 1024,
    });

    const aiResponse =
      completion.choices[0]?.message?.content ||
      "Maaf, tidak dapat memproses pertanyaan Anda saat ini.";

    // Server-side validation (anti-hallucination)
    const validationResult = validateResponse(aiResponse, documentSnippets);

    if (!validationResult.isValid) {
      log.warn(
        { url: "/api/chat", antiHallucinationValidation: validationResult },
        "Finished request"
      );
      return NextResponse.json({
        answer:
          "Maaf, informasi yang Anda cari tidak tersedia dalam dokumen resmi yang ada. Silakan ajukan pertanyaan lain atau hubungi agen asuransi untuk informasi lebih lanjut.",
        citations: [],
      });
    }

    // Extract citations from response
    const citations = extractCitations(aiResponse, documentSnippets);

    log.info({ url: "/api/chat" }, "Finished request");

    return NextResponse.json({
      answer: aiResponse,
      citations: citations,
    });
  } catch (error) {
    log.error({ url: "api/chat", err: error }, "Chat API error");

    return NextResponse.json(
      {
        error: "Internal server error",
        answer: "Maaf, terjadi kesalahan sistem. Silakan coba lagi.",
        citations: [],
      },
      { status: 500 }
    );
  }
}

async function extractDocumentSnippetsFromPython(
  query: string,
  profile: UserProfile | null
): Promise<DocumentSnippet[]> {
  const log = createLogger("python-search");

  try {
    const searchRequest = {
      query: query,
      profile: profile
        ? {
            vehicleType: profile.vehicleType,
            city: profile.city,
            floodRisk: profile.floodRisk,
            usageType: profile.usageType,
          }
        : null,
      top_k: 6,
    };

    log.info({ searchRequest }, "Calling Python search service");

    const response = await fetch(`${process.env.VECTOR_SERVICE_URL}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchRequest),
    });

    if (!response.ok) {
      throw new Error(
        `Python search service error: ${response.status} ${response.statusText}`
      );
    }

    const searchResult = await response.json();
    log.info(
      { chunksCount: searchResult.chunks.length },
      "Python search returned chunks"
    );

    // Convert Python service response to DocumentSnippet format
    const snippets: DocumentSnippet[] = searchResult.chunks.map(
      (chunk: {
        content: string;
        doc_title: string;
        section: string;
        source: string;
      }) => ({
        content: chunk.content,
        docTitle: chunk.doc_title,
        section: chunk.section,
        source: chunk.source,
      })
    );

    return snippets;
  } catch (error) {
    log.error({ err: error }, "Error calling Python search service");
    // Return empty array if service fails
    return [];
  }
}

// Removed unused PDF processing functions - now using Python search service

function validateResponse(
  response: string,
  snippets: DocumentSnippet[]
): { isValid: boolean; reason?: string } {
  // Basic validation checks

  // Check if response is too generic
  if (response.length < 50) {
    return { isValid: false, reason: "Response too short" };
  }

  // Check for excessive speculation (only block truly uncertain responses)
  const uncertaintyWords = ["mungkin", "kira-kira", "kemungkinan", "perkiraan"];

  // Only block if response contains multiple uncertainty words or is very uncertain
  const uncertaintyCount = uncertaintyWords.filter((word) =>
    response.toLowerCase().includes(word.toLowerCase())
  ).length;

  if (uncertaintyCount >= 2) {
    return { isValid: false, reason: "Contains excessive speculation" };
  }

  // Check if response contains insurance-related content (more flexible validation)
  const insuranceTerms = [
    "asuransi",
    "autocillin",
    "motopro",
    "comprehensive",
    "tlo",
    "perlindungan",
    "coverage",
    "premi",
    "klaim",
    "manfaat",
  ];

  const hasInsuranceContent = insuranceTerms.some((term) =>
    response.toLowerCase().includes(term.toLowerCase())
  );

  // Only fail validation if response has no insurance content at all
  if (!hasInsuranceContent && snippets.length > 0) {
    return {
      isValid: false,
      reason: "Response not related to insurance content",
    };
  }

  return { isValid: true };
}

function extractCitations(
  response: string,
  snippets: DocumentSnippet[]
): Citation[] {
  const citations: Citation[] = [];
  const seenCitations = new Set<string>();

  snippets.forEach((snippet) => {
    const docWords = snippet.docTitle.toLowerCase().split(/\s+/);
    const responseText = response.toLowerCase();
    const docTitle = snippet.docTitle.toLowerCase();

    // Filter out irrelevant vehicle types
    const isCarInsurance =
      responseText.includes("mobil") ||
      responseText.includes("autocillin") ||
      responseText.includes("car");
    const isMotorcycleDoc =
      docTitle.includes("motor") || docTitle.includes("motopro");

    const isMotorcycleInsurance =
      responseText.includes("motor") && !responseText.includes("mobil");
    const isCarDoc =
      docTitle.includes("autocillin") || docTitle.includes("mobil");

    // Skip irrelevant documents
    if (
      (isCarInsurance && isMotorcycleDoc) ||
      (isMotorcycleInsurance && isCarDoc)
    ) {
      return; // Skip this document
    }

    // More selective citation logic
    const hasDocReference =
      response.includes(snippet.docTitle) || // Exact document name mentioned
      docWords.some((word) => word.length > 4 && responseText.includes(word)) || // Key words from doc title
      snippet.content
        .toLowerCase()
        .split(/\s+/)
        .some(
          (word) => word.length > 6 && responseText.includes(word) // Specific content words mentioned
        );

    if (hasDocReference) {
      // Create a unique key to avoid duplicates
      const citationKey = `${snippet.docTitle}-${snippet.section}`;

      // Only add if we haven't seen this citation before
      if (!seenCitations.has(citationKey)) {
        // Clean up snippet content for display only
        const cleanSnippet =
          snippet.content
            .replace(/\s+/g, " ") // Replace multiple spaces with single space
            .replace(/([a-zA-Z])\s+([a-zA-Z])/g, "$1$2") // Remove spaces between letters
            .trim()
            .slice(0, 150) + "...";

        citations.push({
          docTitle: snippet.docTitle,
          section: snippet.section,
          snippet: cleanSnippet,
          source: snippet.source,
        });
        seenCitations.add(citationKey);
      }
    }
  });

  return citations;
}

// Conversation memory management
interface ConversationMemory {
  userProfile: UserProfile | null;
  topicsDiscussed: string[];
  lastProductMentioned: string | null;
  conversationTone: string;
  keyWords: string[];
  explainedConcepts: string[];
  previousResponses: string[]; // Track actual response content to prevent exact duplicates
  keyPhrases: string[]; // Track specific phrases that were already mentioned
  currentFocus: string | null;
  disclaimerShown: boolean;
}

function buildConversationMemory(
  conversationHistory: ChatMessage[],
  profile: UserProfile | null
): ConversationMemory {
  const memory: ConversationMemory = {
    userProfile: profile,
    topicsDiscussed: [],
    lastProductMentioned: null,
    conversationTone: "friendly_professional",
    keyWords: [],
    explainedConcepts: [],
    previousResponses: [],
    keyPhrases: [],
    currentFocus: null,
    disclaimerShown: false,
  };

  // Extract topics and products from recent conversation
  const recentMessages = conversationHistory.slice(-6); // Last 3 exchanges
  const allText = recentMessages
    .map((msg) => msg.content)
    .join(" ")
    .toLowerCase();

  // Extract insurance products mentioned
  const products = [
    "autocillin",
    "motopro",
    "mobilite",
    "motolite",
    "comprehensive",
    "tlo",
  ];
  products.forEach((product) => {
    if (allText.includes(product)) {
      memory.lastProductMentioned = product;
      memory.topicsDiscussed.push(product);
    }
  });

  // Extract key topics
  const topics = [
    "manfaat",
    "premi",
    "klaim",
    "coverage",
    "perlindungan",
    "banjir",
    "flood",
    "kecelakaan",
    "pencurian",
  ];
  topics.forEach((topic) => {
    if (allText.includes(topic)) {
      memory.topicsDiscussed.push(topic);
    }
  });

  // Track explained concepts to avoid repetition
  const concepts = [
    "autocillin",
    "comprehensive",
    "perluasan perlindungan",
    "zurich care",
    "premi calculation",
    "banjir protection",
    "bengkel atpm",
    "fasilitas bengkel",
    "perlindungan dari banjir",
    "angin topan",
    "gempa bumi",
  ];
  const assistantMessages = recentMessages.filter(
    (msg) => msg.role === "assistant"
  );
  const assistantTexts = assistantMessages.map((msg) =>
    msg.content.toLowerCase()
  );

  concepts.forEach((concept) => {
    if (assistantTexts.some((msg) => msg.includes(concept.toLowerCase()))) {
      memory.explainedConcepts.push(concept);
    }
  });

  // Track previous assistant responses to prevent exact duplicates
  memory.previousResponses = assistantMessages.map((msg) => msg.content);

  // Extract key phrases that were already mentioned to avoid repetition
  const keyPhrasePatterns = [
    /fasilitas bengkel ATPM[\s\S]*?layanan darurat 24 jam/gi,
    /perlindungan[\s\S]*?bencana alam[\s\S]*?banjir/gi,
    /kerusakan akibat[\s\S]*?kecelakaan/gi,
    /penggantian kerugian[\s\S]*?100%/gi,
    /syarat dan ketentuan[\s\S]*?berlaku/gi,
  ];

  assistantTexts.forEach((text) => {
    keyPhrasePatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          if (match.length > 20) {
            // Only track substantial phrases
            memory.keyPhrases.push(match.trim());
          }
        });
      }
    });
  });

  // Check if disclaimer was already shown
  memory.disclaimerShown = assistantMessages.some(
    (msg) =>
      msg.content.includes("informasi umum") && msg.content.includes("kontrak")
  );

  // Determine current focus based on recent user questions
  const lastUserMessage = conversationHistory
    .filter((msg) => msg.role === "user")
    .slice(-1)[0]
    ?.content.toLowerCase();
  if (lastUserMessage) {
    if (lastUserMessage.includes("premi")) memory.currentFocus = "premium";
    else if (
      lastUserMessage.includes("manfaat") ||
      lastUserMessage.includes("coverage")
    )
      memory.currentFocus = "benefits";
    else if (lastUserMessage.includes("klaim")) memory.currentFocus = "claims";
  }

  // Extract key words for context
  const keyWords = allText.match(/\b\w{4,}\b/g) || [];
  memory.keyWords = [...new Set(keyWords)].slice(0, 10); // Top 10 unique keywords

  // Remove duplicates
  memory.topicsDiscussed = [...new Set(memory.topicsDiscussed)];

  return memory;
}

function enhanceQueryWithContext(
  currentMessage: string,
  memory: ConversationMemory
): string {
  let enhancedQuery = currentMessage;
  const messageLower = currentMessage.toLowerCase();

  // Detect vehicle type from message and enhance accordingly
  if (messageLower.includes("mobil") || messageLower.includes("car")) {
    enhancedQuery +=
      " asuransi mobil autocillin car automotive kendaraan bermotor roda empat";
    // Exclude motorcycle terms
    enhancedQuery += " -motor -motorcycle -sepeda -roda dua";
  } else if (
    messageLower.includes("motor") ||
    messageLower.includes("motorcycle") ||
    messageLower.includes("sepeda motor")
  ) {
    enhancedQuery += " asuransi motor motopro motorcycle sepeda motor roda dua";
    // Exclude car terms
    enhancedQuery += " -mobil -car -automotive -autocillin";
  }

  // Add user profile context if available
  if (memory.userProfile) {
    const profile = memory.userProfile;
    if (profile.vehicleType === "car") {
      enhancedQuery += " mobil car autocillin automotive";
    } else if (profile.vehicleType === "motorcycle") {
      enhancedQuery += " motor motorcycle motopro sepeda motor";
    }

    if (profile.floodRisk) {
      enhancedQuery += " banjir flood perluasan perlindungan alam";
    }

    if (profile.city) {
      enhancedQuery += ` ${profile.city}`;
    }
  }

  // Add context from memory
  if (memory.lastProductMentioned) {
    enhancedQuery += ` ${memory.lastProductMentioned}`;
  }

  // Add relevant topics from conversation
  if (memory.topicsDiscussed.length > 0) {
    const relevantTopics = memory.topicsDiscussed.slice(0, 3).join(" ");
    enhancedQuery += ` ${relevantTopics}`;
  }

  return enhancedQuery;
}

function formatRecentConversation(conversationHistory: ChatMessage[]): string {
  if (conversationHistory.length === 0) return "";

  const recentMessages = conversationHistory.slice(-4); // Last 2 exchanges
  return recentMessages
    .map(
      (msg) => `${msg.role === "user" ? "Pengguna" : "Miria"}: ${msg.content}`
    )
    .join("\n");
}
