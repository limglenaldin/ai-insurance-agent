import { NextRequest, NextResponse } from "next/server";
import { dbHelpers } from "@/lib/db";
import { createLogger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const log = createLogger("products-api");

  log.info({ url: "/api/products" }, "Started request");

  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters for filtering
    const vehicleKind = searchParams.get("vehicleKind") || undefined;
    const mainCoverage = searchParams.get("mainCoverage") || undefined;
    const category = searchParams.get("category") || undefined;

    const products = await dbHelpers.getProducts({
      vehicleKind,
      mainCoverage,
      category,
    });

    log.info({ url: "/api/products" }, "Finsihed request");

    return NextResponse.json(products);
  } catch (error) {
    log.error(
      { err: error, url: "/api/products" },
      "Failed to load products from database"
    );
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 }
    );
  }
}
