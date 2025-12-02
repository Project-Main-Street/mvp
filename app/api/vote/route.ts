import { upsertVote } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";

export async function PUT(request: NextRequest) {
    try {
        // Get authenticated user
        const user = await stackServerApp.getUser();
        
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        
        const userId = user.id;

        // Parse request body
        const body = await request.json();
        const { valence, postId, commentId } = body;

        // Validate input
        if (valence !== -1 && valence !== 1) {
            return NextResponse.json(
                { error: "Valence must be -1 or 1" },
                { status: 400 }
            );
        }

        if (!postId && !commentId) {
            return NextResponse.json(
                { error: "Either postId or commentId is required" },
                { status: 400 }
            );
        }

        if (postId && commentId) {
            return NextResponse.json(
                { error: "Cannot vote on both post and comment" },
                { status: 400 }
            );
        }

        // Upsert vote
        await upsertVote(userId, valence, postId, commentId);

        return NextResponse.json(
            { success: true },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error processing vote:", error);
        return NextResponse.json(
            { error: "Failed to process vote" },
            { status: 500 }
        );
    }
}
