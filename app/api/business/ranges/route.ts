import { NextRequest, NextResponse } from "next/server";
import { getEmployeeCountRanges, getRevenueRanges } from "@/lib/db";

// GET /api/business/ranges - Get employee count and revenue range options
export async function GET(req: NextRequest) {
  try {
    const [employeeCountRanges, revenueRanges] = await Promise.all([
      getEmployeeCountRanges(),
      getRevenueRanges()
    ]);

    return NextResponse.json({
      employeeCountRanges,
      revenueRanges
    });
  } catch (error) {
    console.error("Error fetching ranges:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
