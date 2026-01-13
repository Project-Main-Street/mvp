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
        const commentId = parseInt(id, 10);

        if (isNaN(commentId)) {
            return NextResponse.json(
                { error: "Invalid comment ID" },
                { status: 400 }
            );
        }

        // Delete the comment (comments are posts with a parent)
        const result = await deletePost(commentId, user.id);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Failed to delete comment" },
                { status: result.error === "Unauthorized" ? 403 : 500 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Comment deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in DELETE /api/comment/[id]:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
