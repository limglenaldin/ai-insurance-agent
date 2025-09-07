import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { UserProfile, Product, DocumentSnippet, Citation, ChatMessage } from "@/lib/types";
import { getVehicleTypeLabel, getCityLabel, getUsageTypeLabel } from "@/lib/utils";
import { dbHelpers } from "@/lib/db";

// No longer using pdfjs-dist - using Python service instead

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, profile, conversationHistory = [] } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Build conversation memory and enhance query
    const conversationMemory = buildConversationMemory(conversationHistory, profile);
    const contextualQuery = enhanceQueryWithContext(message, conversationMemory);

    // Extract document content using Python search service with enhanced query
    const documentSnippets = await extractDocumentSnippetsFromPython(contextualQuery, profile);

    // Compose grounded prompt
    const context = documentSnippets
      .slice(0, 6) // Limit to 3-6 excerpts as per sequence diagram
      .map(
        (snippet) =>
          `[${snippet.docTitle} - ${snippet.section}]\n${snippet.content}\nSource: ${snippet.source}`
      )
      .join("\n\n---\n\n");

    // Build Maya persona with conversation memory
    const recentConversation = formatRecentConversation(conversationHistory);
    
    const systemPrompt = `Saya Maya, konsultan asuransi berpengalaman yang ramah dan dapat dipercaya. Saya berbicara dengan bahasa yang mudah dipahami, memberikan penjelasan yang terstruktur, dan selalu mengutamakan akurasi informasi. Saya senang membantu memahami asuransi dengan pendekatan yang personal dan empati.

KEPRIBADIAN SAYA:
- Ramah dan sabar dalam menjelaskan
- Detail namun mudah dipahami  
- Menggunakan contoh konkret
- Selalu mengutip sumber dokumen
- Menyebutkan nama produk spesifik

ATURAN KETAT:
1. Jawab HANYA berdasarkan DOKUMEN di bawah ini
2. SELALU cantumkan sumber dengan nama dokumen dan bagian yang tepat
3. JANGAN spekulasi atau menambah informasi di luar dokumen
4. Jika informasi tidak ada di dokumen, katakan "Maaf, informasi ini tidak tersedia dalam dokumen resmi yang saya miliki"
5. Gunakan bahasa Indonesia yang natural dan hangat

MEMORI PERCAKAPAN:
${JSON.stringify(conversationMemory, null, 2)}

${recentConversation ? `PERCAKAPAN TERAKHIR:
${recentConversation}` : ""}

PROFIL PENGGUNA (untuk personalisasi):
${
  profile
    ? `- Kendaraan: ${getVehicleTypeLabel(profile.vehicleType)} (${profile.vehicleYear})
- Lokasi: ${getCityLabel(profile.city)}
- Penggunaan: ${getUsageTypeLabel(profile.usageType)}
- Area rawan banjir: ${profile.floodRisk ? "Ya" : "Tidak"}`
    : "Belum ada profil"
}

DOKUMEN SUMBER:
${context}

Berdasarkan HANYA pada dokumen di atas dan memori percakapan, jawab pertanyaan dengan cara Maya yang ramah dan informatif. Sertakan kutipan dokumen yang tepat.`;

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
      return NextResponse.json({
        answer:
          "Maaf, informasi yang Anda cari tidak tersedia dalam dokumen resmi yang ada. Silakan ajukan pertanyaan lain atau hubungi agen asuransi untuk informasi lebih lanjut.",
        citations: [],
      });
    }

    // Extract citations from response
    const citations = extractCitations(aiResponse, documentSnippets);

    return NextResponse.json({
      answer: aiResponse,
      citations: citations,
    });
  } catch (error) {
    console.error("Chat API error:", error);

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

async function getRelevantProducts(profile: UserProfile | null): Promise<Product[]> {
  if (!profile) {
    return await dbHelpers.getProducts();
  }

  // Filter based on vehicle type
  const vehicleKind = ["car", "motorcycle"].includes(profile.vehicleType) 
    ? profile.vehicleType 
    : undefined;

  return await dbHelpers.getProducts({ vehicleKind });
}

async function extractDocumentSnippetsFromPython(
  query: string,
  profile: UserProfile | null
): Promise<DocumentSnippet[]> {
  try {
    const searchRequest = {
      query: query,
      profile: profile ? {
        vehicleType: profile.vehicleType,
        city: profile.city,
        floodRisk: profile.floodRisk,
        usageType: profile.usageType
      } : null,
      top_k: 6
    };

    console.log('🔍 Calling Python search service with:', JSON.stringify(searchRequest));

    const response = await fetch('http://localhost:8001/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchRequest)
    });

    if (!response.ok) {
      throw new Error(`Python search service error: ${response.status} ${response.statusText}`);
    }

    const searchResult = await response.json();
    console.log(`✅ Python search returned ${searchResult.chunks.length} chunks`);

    // Convert Python service response to DocumentSnippet format
    const snippets: DocumentSnippet[] = searchResult.chunks.map((chunk: {content: string, doc_title: string, section: string, source: string}) => ({
      content: chunk.content,
      docTitle: chunk.doc_title,
      section: chunk.section,
      source: chunk.source
    }));

    return snippets;

  } catch (error) {
    console.error('Error calling Python search service:', error);
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
  const uncertaintyWords = [
    "mungkin",
    "kira-kira",
    "kemungkinan",
    "perkiraan",
  ];

  const hasUncertainty = uncertaintyWords.some((word) =>
    response.toLowerCase().includes(word.toLowerCase())
  );

  // Only block if response contains multiple uncertainty words or is very uncertain
  const uncertaintyCount = uncertaintyWords.filter((word) =>
    response.toLowerCase().includes(word.toLowerCase())
  ).length;

  if (uncertaintyCount >= 2) {
    return { isValid: false, reason: "Contains excessive speculation" };
  }

  // Check if response contains insurance-related content (more flexible validation)
  const insuranceTerms = [
    "asuransi", "autocillin", "motopro", "comprehensive", "tlo", 
    "perlindungan", "coverage", "premi", "klaim", "manfaat"
  ];

  const hasInsuranceContent = insuranceTerms.some((term) =>
    response.toLowerCase().includes(term.toLowerCase())
  );

  // Only fail validation if response has no insurance content at all
  if (!hasInsuranceContent && snippets.length > 0) {
    return { isValid: false, reason: "Response not related to insurance content" };
  }

  return { isValid: true };
}

function extractCitations(
  response: string,
  snippets: DocumentSnippet[]
): Citation[] {
  const citations: Citation[] = [];
  const seenCitations = new Set<string>();

  // Extract citations based on document references in response
  snippets.forEach((snippet) => {
    if (response.includes(snippet.docTitle)) {
      // Create a unique key to avoid duplicates
      const citationKey = `${snippet.docTitle}-${snippet.section}`;
      
      // Only add if we haven't seen this citation before
      if (!seenCitations.has(citationKey)) {
        citations.push({
          docTitle: snippet.docTitle,
          section: snippet.section,
          snippet: snippet.content.slice(0, 150) + "...",
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
}

function buildConversationMemory(conversationHistory: ChatMessage[], profile: UserProfile | null): ConversationMemory {
  const memory: ConversationMemory = {
    userProfile: profile,
    topicsDiscussed: [],
    lastProductMentioned: null,
    conversationTone: "friendly_professional",
    keyWords: []
  };

  // Extract topics and products from recent conversation
  const recentMessages = conversationHistory.slice(-6); // Last 3 exchanges
  const allText = recentMessages.map(msg => msg.content).join(' ').toLowerCase();

  // Extract insurance products mentioned
  const products = ['autocillin', 'motopro', 'mobilite', 'motolite', 'comprehensive', 'tlo'];
  products.forEach(product => {
    if (allText.includes(product)) {
      memory.lastProductMentioned = product;
      memory.topicsDiscussed.push(product);
    }
  });

  // Extract key topics
  const topics = ['manfaat', 'premi', 'klaim', 'coverage', 'perlindungan', 'banjir', 'flood', 'kecelakaan', 'pencurian'];
  topics.forEach(topic => {
    if (allText.includes(topic)) {
      memory.topicsDiscussed.push(topic);
    }
  });

  // Extract key words for context
  const keyWords = allText.match(/\b\w{4,}\b/g) || [];
  memory.keyWords = [...new Set(keyWords)].slice(0, 10); // Top 10 unique keywords

  // Remove duplicates
  memory.topicsDiscussed = [...new Set(memory.topicsDiscussed)];

  return memory;
}

function enhanceQueryWithContext(currentMessage: string, memory: ConversationMemory): string {
  let enhancedQuery = currentMessage;

  // Add context from memory
  if (memory.lastProductMentioned) {
    enhancedQuery += ` ${memory.lastProductMentioned}`;
  }

  // Add relevant topics from conversation
  if (memory.topicsDiscussed.length > 0) {
    const relevantTopics = memory.topicsDiscussed.slice(0, 3).join(' ');
    enhancedQuery += ` ${relevantTopics}`;
  }

  return enhancedQuery;
}

function formatRecentConversation(conversationHistory: ChatMessage[]): string {
  if (conversationHistory.length === 0) return "";

  const recentMessages = conversationHistory.slice(-4); // Last 2 exchanges
  return recentMessages
    .map(msg => `${msg.role === 'user' ? 'Pengguna' : 'Maya'}: ${msg.content}`)
    .join('\n');
}

