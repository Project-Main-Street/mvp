import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import {
  createProfile,
  updateProfile,
  getProfile,
  checkUsernameAvailable,
} from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username, location, businessId } = await req.json();

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 },
      );
    }

    // Validate username format (alphanumeric, underscore, hyphen, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens",
        },
        { status: 400 },
      );
    }

    // Validate ZIP code if provided
    if (location) {
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(location)) {
        return NextResponse.json(
          {
            error:
              "Location must be a valid ZIP code (e.g., 12345 or 12345-6789)",
          },
          { status: 400 },
        );
      }
    }

    // Check if profile already exists
    const existingProfile = await getProfile(user.id);

    let result;
    if (existingProfile) {
      // Profile exists, update it
      result = await updateProfile({
        userId: user.id,
        username,
        location: location || undefined,
      });
    } else {
      // Profile doesn't exist, create it
      result = await createProfile({
        userId: user.id,
        username,
        location: location || undefined,
        businessId: businessId || undefined,
      });
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    // Update Stack Auth user with username as display name and onboarded metadata
    await user.update({
      displayName: username,
      serverMetadata: {
        onboarded: true,
      },
    });

    return NextResponse.json({ success: true, profile: result.profile });
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username parameter is required" },
        { status: 400 },
      );
    }

    const available = await checkUsernameAvailable(username);

    return NextResponse.json({ available });
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
