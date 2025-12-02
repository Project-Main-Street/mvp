import { createPost } from "@/lib/db";
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
        const parentId = formData.get("parentId") as string;

        // Validate input
        if (!content || !parentId) {
            return NextResponse.json(
                { error: "Content and parent ID are required" },
                { status: 400 }
            );
        }

        // Create comment (post with parent)
        const comment = await createPost(userId, "", content, parseInt(parentId));

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