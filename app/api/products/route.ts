import { NextRequest, NextResponse } from "next/server";
import { dbHelpers } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters for filtering
    const vehicleKind = searchParams.get('vehicleKind') || undefined;
    const mainCoverage = searchParams.get('mainCoverage') || undefined;
    const category = searchParams.get('category') || undefined;
    
    const products = await dbHelpers.getProducts({
      vehicleKind,
      mainCoverage,
      category
    });
    
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to load products from database:", error);
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 }
    );
  }
}