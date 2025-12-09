import { NextResponse } from "next/server";
import { getProductCategories } from "@/lib/db";

// GET /api/business/product-categories - Get all product categories
export async function GET() {
  try {
    const categories = await getProductCategories();
    
    return NextResponse.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error("Error fetching product categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
