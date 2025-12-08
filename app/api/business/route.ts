import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import { createBusiness, updateProfileBusinessId, getBusinessByUserId, getEmployeeCountRanges, getRevenueRanges } from "@/lib/db";

// POST /api/business - Create a new business
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user already has a business
    const existingBusiness = await getBusinessByUserId(user.id);
    if (existingBusiness) {
      return NextResponse.json(
        { error: "You already have a business. Each user can only create one business." },
        { status: 409 }
      );
    }

    // Parse request body
    const body = await req.json();
    const {
      name,
      location,
      category,
      employeeCountRangeId,
      revenueRangeId,
      products
    } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Business name is required" },
        { status: 400 }
      );
    }

    // Validate location (ZIP code) if provided
    if (location && !/^\d{5}(-\d{4})?$/.test(location)) {
      return NextResponse.json(
        { error: "Location must be a valid ZIP code (e.g., 12345 or 12345-6789)" },
        { status: 400 }
      );
    }

    // Create business
    const result = await createBusiness({
      name: name.trim(),
      location,
      category,
      employeeCountRangeId,
      revenueRangeId,
      products
    });

    if (!result.success || !result.business) {
      return NextResponse.json(
        { error: result.error || "Failed to create business" },
        { status: 500 }
      );
    }

    // Update user's profile to link to this business
    await updateProfileBusinessId(user.id, result.business.id);

    return NextResponse.json({
      success: true,
      message: "Business created successfully",
      business: result.business
    });
  } catch (error) {
    console.error("Error creating business:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/business - Get current user's business
export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's business
    const business = await getBusinessByUserId(user.id);

    if (!business) {
      return NextResponse.json(
        { business: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      business
    });
  } catch (error) {
    console.error("Error fetching business:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
