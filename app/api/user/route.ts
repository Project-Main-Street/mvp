import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import { checkUsernameAvailable, getProfile, sql } from "@/lib/db";

// PATCH /api/user - Update user display name (username)
export async function PATCH(req: NextRequest) {
  try {
    // Authenticate user
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { displayName } = body;

    // Validate displayName
    if (!displayName || typeof displayName !== 'string') {
      return NextResponse.json(
        { error: "Display name is required" },
        { status: 400 }
      );
    }

    // Validate username format (3-20 characters, alphanumeric, underscore, hyphen)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(displayName)) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens" },
        { status: 400 }
      );
    }

    // Get user's current profile
    const profile = await getProfile(user.id);
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Check if username is the same as current
    if (profile.username === displayName) {
      return NextResponse.json({
        success: true,
        message: "Username unchanged",
        username: displayName
      });
    }

    // Check if new username is available
    const isAvailable = await checkUsernameAvailable(displayName);
    if (!isAvailable) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    // Update profile username in database
    await sql`
      UPDATE profiles
      SET username = ${displayName}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${user.id}
    `;

    // Update Stack Auth user displayName
    await user.update({
      displayName: displayName,
    });

    return NextResponse.json({
      success: true,
      message: "Username updated successfully",
      username: displayName
    });
  } catch (error) {
    console.error("Error updating username:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
