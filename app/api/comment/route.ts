import { createComment } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";

export async function POST(request: NextRequest) {
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

        // Parse form data
        const formData = await request.formData();
        const content = formData.get("content") as string;
        const postId = formData.get("postId") as string;

        // Validate input
        if (!content || !postId) {
            return NextResponse.json(
                { error: "Content and post ID are required" },
                { status: 400 }
            );
        }

        // Create comment
        const comment = await createComment(userId, parseInt(postId), content);

        return NextResponse.json(
            { success: true, comment },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating comment:", error);
        return NextResponse.json(
            { error: "Failed to create comment" },
            { status: 500 }
        );
    }
}