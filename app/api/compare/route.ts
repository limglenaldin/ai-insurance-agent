import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

import { UserProfile, Product, ProductComparison, ComparisonResult, DocumentSnippet } from "@/lib/types";
import { getVehicleTypeLabel, getCityLabel, getUsageTypeLabel } from "@/lib/utils";
import { dbHelpers } from "@/lib/db";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { productAId, productBId, profile } = await request.json();

    if (!productAId || !productBId) {
      return NextResponse.json(
        { error: "Both product IDs are required" },
        { status: 400 }
      );
    }

    // Load products from database
    const products = await dbHelpers.getProductsForComparison(
      parseInt(productAId), 
      parseInt(productBId)
    );

    if (products.length !== 2) {
      return NextResponse.json(
        { error: "One or both products not found" },
        { status: 404 }
      );
    }

    const [productA, productB] = products;

    // Extract document snippets for each product using Python search service
    const productASnippets = await getProductDocumentSnippets(productA, profile);
    const productBSnippets = await getProductDocumentSnippets(productB, profile);

    // Generate comparison using AI with real document data
    const comparison = await generateAIComparison(productA, productB, profile, productASnippets, productBSnippets);

    return NextResponse.json(comparison);

  } catch (error) {
    console.error("Compare API error:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getProductDocumentSnippets(
  product: Product,
  profile: UserProfile | null
): Promise<DocumentSnippet[]> {
  try {
    // Create product-specific search queries
    const queries = [
      `${product.name} manfaat fitur`,
      `${product.name} syarat ketentuan`,
      `${product.name} coverage perlindungan`,
      `${product.name} premi tarif`
    ];

    const allSnippets: DocumentSnippet[] = [];

    // Search for each query to get comprehensive product information
    for (const query of queries) {
      const searchRequest = {
        query: query,
        profile: profile ? {
          vehicleType: profile.vehicleType,
          city: profile.city,
          floodRisk: profile.floodRisk,
          usageType: profile.usageType
        } : null,
        top_k: 3 // Get fewer results per query to avoid overloading
      };

      const response = await fetch('http://localhost:8001/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchRequest)
      });

      if (response.ok) {
        const searchResult = await response.json();
        const snippets: DocumentSnippet[] = searchResult.chunks.map((chunk: any) => ({
          content: chunk.content,
          docTitle: chunk.doc_title,
          section: chunk.section,
          source: chunk.source
        }));

        // Filter snippets that are relevant to the specific product
        const relevantSnippets = snippets.filter(snippet => 
          snippet.docTitle.toLowerCase().includes(product.name.toLowerCase()) ||
          snippet.content.toLowerCase().includes(product.name.toLowerCase())
        );

        allSnippets.push(...relevantSnippets);
      }
    }

    // Remove duplicates and limit to top 6 most relevant snippets
    const uniqueSnippets = allSnippets.filter((snippet, index, self) =>
      index === self.findIndex(s => s.content === snippet.content)
    ).slice(0, 6);

    console.log(`✅ Found ${uniqueSnippets.length} relevant snippets for ${product.name}`);
    
    return uniqueSnippets;

  } catch (error) {
    console.error(`Error getting document snippets for ${product.name}:`, error);
    return [];
  }
}

async function generateAIComparison(
  productA: Product, 
  productB: Product, 
  profile: UserProfile | null,
  productASnippets: DocumentSnippet[],
  productBSnippets: DocumentSnippet[]
): Promise<ComparisonResult> {
  try {
    const profileContext = profile ? `
User Profile:
- Vehicle: ${getVehicleTypeLabel(profile.vehicleType)} (${profile.vehicleYear})
- Location: ${getCityLabel(profile.city)}
- Usage: ${getUsageTypeLabel(profile.usageType)}
- Flood Risk Area: ${profile.floodRisk ? 'Yes' : 'No'}
` : 'No user profile provided';

    // Build context from real document snippets
    const productAContext = productASnippets.length > 0 
      ? productASnippets
          .map(snippet => `[${snippet.docTitle} - ${snippet.section}]\n${snippet.content}`)
          .join('\n\n---\n\n')
      : `Basic product info: ${productA.name} (${productA.mainCoverage} coverage for ${productA.vehicleKind})`;

    const productBContext = productBSnippets.length > 0
      ? productBSnippets
          .map(snippet => `[${snippet.docTitle} - ${snippet.section}]\n${snippet.content}`)
          .join('\n\n---\n\n')
      : `Basic product info: ${productB.name} (${productB.mainCoverage} coverage for ${productB.vehicleKind})`;

    const systemPrompt = `You are an Indonesian insurance expert. Compare these two insurance products objectively based ONLY on the provided document excerpts. 

STRICT RULES:
1. Base your comparison ONLY on the provided document context below
2. If information is not available in the documents, state "Informasi tidak tersedia dalam dokumen"
3. Always include document citations when making specific claims
4. Answer in Indonesian language
5. Be accurate and factual

PRODUCT A CONTEXT:
${productAContext}

PRODUCT B CONTEXT:
${productBContext}

${profileContext}

Based ONLY on the document context above, provide a detailed comparison in Indonesian covering:
1. Key features of each product (with citations)
2. Who each product is suitable for (based on document info)
3. Limitations of each product (from documents)
4. Summary recommendation based on user profile and document information

Format your response as JSON with this structure:
{
  "productA": {
    "name": "${productA.name}",
    "coverage": "coverage type from documents",
    "features": ["feature1 (from doc)", "feature2 (from doc)", ...],
    "suitableFor": ["suitable1 (from doc)", "suitable2 (from doc)", ...],
    "limitations": ["limit1 (from doc)", "limit2 (from doc)", ...]
  },
  "productB": {
    "name": "${productB.name}",
    "coverage": "coverage type from documents", 
    "features": ["feature1 (from doc)", "feature2 (from doc)", ...],
    "suitableFor": ["suitable1 (from doc)", "suitable2 (from doc)", ...],
    "limitations": ["limit1 (from doc)", "limit2 (from doc)", ...]
  },
  "summary": "detailed comparison summary and recommendation based on documents and user profile"
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Please provide the comparison analysis." }
      ],
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1500,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    
    if (aiResponse) {
      try {
        // Try to parse AI response as JSON
        const parsed = JSON.parse(aiResponse);
        return parsed;
      } catch (parseError) {
        console.warn("Failed to parse AI response as JSON, using fallback");
      }
    }

    // Fallback to mock comparison if AI fails
    return generateMockComparison(productA, productB);

  } catch (error) {
    console.error("AI comparison failed, using mock:", error);
    return generateMockComparison(productA, productB);
  }
}

function generateMockComparison(productA: Product, productB: Product): ComparisonResult {
  const getProductDetails = (product: Product): ProductComparison => {
    if (product.name.includes("Autocillin")) {
      return {
        name: product.name,
        coverage: product.mainCoverage === "Comprehensive" ? "Comprehensive" : "TLO",
        features: [
          "Perlindungan total kerusakan",
          "Tanggung jawab pihak ketiga",
          "Layanan derek 24 jam",
          "Bengkel rekanan resmi",
          "Ganti rugi pencurian"
        ],
        suitableFor: [
          "Kendaraan baru dan bernilai tinggi",
          "Penggunaan harian intensif",
          "Area perkotaan dengan risiko tinggi"
        ],
        limitations: [
          "Premi relatif tinggi",
          "Persyaratan survey kendaraan",
          "Batasan usia kendaraan"
        ]
      };
    }
    
    if (product.name.includes("Motopro")) {
      return {
        name: product.name,
        coverage: "TLO",
        features: [
          "Ganti rugi pencurian motor",
          "Santunan kecelakaan diri",
          "Layanan ambulans gratis",
          "Bengkel rekanan luas",
          "Proses klaim mudah"
        ],
        suitableFor: [
          "Motor dengan nilai ekonomis tinggi",
          "Penggunaan sehari-hari",
          "Area dengan risiko pencurian tinggi"
        ],
        limitations: [
          "Tidak cover kerusakan ringan",
          "Hanya untuk kerusakan >75%",
          "Batasan wilayah tertentu"
        ]
      };
    }
    
    if (product.name.includes("Mobilite") || product.name.includes("Motolite")) {
      return {
        name: product.name,
        coverage: "TLO",
        features: [
          "Premi sangat terjangkau",
          "Santunan kecelakaan diri",
          "Proses klaim cepat",
          "Tidak perlu survey",
          "Pembayaran fleksibel"
        ],
        suitableFor: [
          "Kendaraan menengah ke bawah",
          "Budget terbatas",
          "Perlindungan dasar"
        ],
        limitations: [
          "Manfaat terbatas",
          "Batasan nilai santunan",
          "Tidak untuk kendaraan mewah"
        ]
      };
    }
    
    return {
      name: product.name,
      coverage: product.mainCoverage,
      features: ["Fitur standar asuransi"],
      suitableFor: ["Berbagai kebutuhan"],
      limitations: ["Lihat syarat dan ketentuan"]
    };
  };

  const detailA = getProductDetails(productA);
  const detailB = getProductDetails(productB);

  return {
    productA: detailA,
    productB: detailB,
    summary: `Perbandingan antara ${productA.name} dan ${productB.name}: ${productA.name} menawarkan ${detailA.coverage} coverage yang ${detailA.coverage === 'Comprehensive' ? 'lebih lengkap' : 'fokus pada perlindungan utama'}, sementara ${productB.name} memberikan ${detailB.coverage} coverage dengan ${detailB.features[0]}. Pilih berdasarkan kebutuhan dan budget Anda.`
  };
}

