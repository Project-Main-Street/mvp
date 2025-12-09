import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET /api/business/products - Get all reference products
export async function GET() {
  try {
    const products = await sql`
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.category_id as "categoryId",
        pc.name as "categoryName"
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      ORDER BY pc.name, p.name
    `;
    
    return NextResponse.json({
      success: true,
      products: products as unknown as Array<{
        id: number;
        name: string;
        slug: string;
        categoryId: number | null;
        categoryName: string | null;
      }>
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
