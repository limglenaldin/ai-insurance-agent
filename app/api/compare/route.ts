import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

import {
  UserProfile,
  Product,
  ComparisonResult,
  DocumentSnippet,
} from "@/lib/types";
import {
  getVehicleTypeLabel,
  getCityLabel,
  getUsageTypeLabel,
} from "@/lib/utils";
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
    const productASnippets = await getProductDocumentSnippets(
      productA,
      profile
    );
    const productBSnippets = await getProductDocumentSnippets(
      productB,
      profile
    );

    // Generate comparison using AI with real document data
    try {
      const comparison = await generateAIComparison(
        productA,
        productB,
        profile,
        productASnippets,
        productBSnippets
      );
      return NextResponse.json(comparison);
    } catch (aiError) {
      console.error("AI comparison failed:", aiError);

      // Return error response that frontend can handle
      return NextResponse.json(
        {
          error:
            "Failed to generate comparison. Please ensure both services are running and try again.",
        },
        { status: 500 }
      );
    }
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
      `${product.name} premi tarif`,
    ];

    const allSnippets: DocumentSnippet[] = [];

    // Search for each query to get comprehensive product information
    for (const query of queries) {
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
        top_k: 3, // Get fewer results per query to avoid overloading
      };

      const response = await fetch(`${process.env.VECTOR_SERVICE_URL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchRequest),
      });

      if (response.ok) {
        const searchResult = await response.json();
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

        // Filter snippets that are relevant to the specific product
        const relevantSnippets = snippets.filter(
          (snippet) =>
            snippet.docTitle
              .toLowerCase()
              .includes(product.name.toLowerCase()) ||
            snippet.docTitle.toLowerCase().includes("autocillin") ||
            snippet.docTitle.toLowerCase().includes("motopro") ||
            snippet.content.toLowerCase().includes("autocillin") ||
            snippet.content.toLowerCase().includes("motopro") ||
            snippet.content
              .toLowerCase()
              .includes(product.mainCoverage?.toLowerCase() || "")
        );

        allSnippets.push(...relevantSnippets);
      }
    }

    // Remove duplicates and limit to top 6 most relevant snippets
    const uniqueSnippets = allSnippets
      .filter(
        (snippet, index, self) =>
          index === self.findIndex((s) => s.content === snippet.content)
      )
      .slice(0, 6);

    console.log(
      `✅ Found ${uniqueSnippets.length} relevant snippets for ${product.name}`
    );

    return uniqueSnippets;
  } catch (error) {
    console.error(
      `Error getting document snippets for ${product.name}:`,
      error
    );
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
    const profileContext = profile
      ? `
User Profile:
- Vehicle: ${getVehicleTypeLabel(profile.vehicleType)} (${profile.vehicleYear})
- Location: ${getCityLabel(profile.city)}
- Usage: ${getUsageTypeLabel(profile.usageType)}
- Flood Risk Area: ${profile.floodRisk ? "Yes" : "No"}
`
      : "No user profile provided";

    // Build context from real document snippets
    const productAContext =
      productASnippets.length > 0
        ? productASnippets
            .map(
              (snippet) =>
                `[${snippet.docTitle} - ${snippet.section}]\n${snippet.content}`
            )
            .join("\n\n---\n\n")
        : `Basic product info: ${productA.name} (${productA.mainCoverage} coverage for ${productA.vehicleKind})`;

    const productBContext =
      productBSnippets.length > 0
        ? productBSnippets
            .map(
              (snippet) =>
                `[${snippet.docTitle} - ${snippet.section}]\n${snippet.content}`
            )
            .join("\n\n---\n\n")
        : `Basic product info: ${productB.name} (${productB.mainCoverage} coverage for ${productB.vehicleKind})`;

    const systemPrompt = `You are an Indonesian insurance expert. Compare these two insurance products based on the provided document excerpts and known insurance principles.

INSTRUCTIONS:
1. PRIMARY: Use information from the provided document excerpts when available
2. SECONDARY: Apply general insurance knowledge to fill gaps logically  
3. FOCUS: Highlight key differences between products, especially coverage types
4. LANGUAGE: Respond in Indonesian language
5. ACCURACY: Be factual and helpful

PRODUCT A: ${productA.name} (Coverage: ${productA.mainCoverage})
DOCUMENT EXCERPTS:
${productAContext}

PRODUCT B: ${productB.name} (Coverage: ${productB.mainCoverage})
DOCUMENT EXCERPTS:
${productBContext}

${profileContext}

COMPARISON FOCUS:
- If comparing Comprehensive vs TLO: Emphasize coverage scope differences, premium implications, and suitable use cases
- If comparing same coverage types: Focus on feature differences, service quality, and specific benefits
- Consider user profile for personalized recommendations

Provide a detailed comparison in Indonesian with this JSON structure:
{
  "productA": {
    "name": "${productA.name}",
    "coverage": "${productA.mainCoverage || "Unknown"}",
    "features": ["feature1", "feature2", "feature3", "feature4"],
    "suitableFor": ["suitable1", "suitable2", "suitable3"],
    "limitations": ["limitation1", "limitation2", "limitation3"]
  },
  "productB": {
    "name": "${productB.name}",
    "coverage": "${productB.mainCoverage || "Unknown"}",
    "features": ["feature1", "feature2", "feature3", "feature4"],
    "suitableFor": ["suitable1", "suitable2", "suitable3"],
    "limitations": ["limitation1", "limitation2", "limitation3"]
  },
  "summary": "Detailed comparison summary explaining key differences and providing recommendation based on coverage types and user profile"
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Please provide the comparison analysis." },
      ],
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1500,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (aiResponse) {
      console.log("Raw AI Response:", aiResponse.substring(0, 500) + "...");

      try {
        // Try to extract JSON from the response (sometimes AI wraps it in markdown)
        let jsonStr = aiResponse;

        // Remove markdown code blocks if present
        const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonStr = jsonMatch[1];
        } else {
          // Look for the first { and last }
          const firstBrace = aiResponse.indexOf("{");
          const lastBrace = aiResponse.lastIndexOf("}");
          if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
            jsonStr = aiResponse.substring(firstBrace, lastBrace + 1);
          }
        }

        const parsed = JSON.parse(jsonStr);
        console.log("Successfully parsed AI response");
        return parsed;
      } catch (parseError) {
        console.warn("Failed to parse AI response as JSON:", parseError);
        console.log("AI response was:", aiResponse);
      }
    }

    // Return error if AI fails - but don't throw, let the outer catch handle it
    throw new Error("AI processing failed to generate valid comparison");
  } catch (error) {
    console.error("AI comparison failed:", error);
    throw error; // Re-throw to be handled by outer catch
  }
}
