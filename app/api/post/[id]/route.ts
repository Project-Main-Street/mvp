import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import { deletePost } from "@/lib/db";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Get authenticated user
        const user = await stackServerApp.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const postId = parseInt(id, 10);

        if (isNaN(postId)) {
            return NextResponse.json(
                { error: "Invalid post ID" },
                { status: 400 }
            );
        }

        // Delete the post
        const result = await deletePost(postId, user.id);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Failed to delete post" },
                { status: result.error === "Unauthorized" ? 403 : 500 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Post deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in DELETE /api/post/[id]:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
