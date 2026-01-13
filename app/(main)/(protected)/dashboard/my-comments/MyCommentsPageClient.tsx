"use client";

import { useState } from "react";
import { Box, Heading, Flex, Button, Link } from "@radix-ui/themes";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import type { CommentWithParentPost } from "@/lib/db";
import ManageableCommentCard from "@/lib/components/MyPostsList/ManageableCommentCard";

interface MyCommentsPageClientProps {
  initialComments: CommentWithParentPost[];
  userId: string;
}

export default function MyCommentsPageClient({
  initialComments,
  userId,
}: MyCommentsPageClientProps) {
  const [comments, setComments] =
    useState<CommentWithParentPost[]>(initialComments);

  const handleDelete = (id: number) => {
    // Optimistically remove the comment from the local state
    setComments((prevComments) =>
      prevComments.filter((comment) => comment.id !== id),
    );
  };

  return (
    <Box>
      <Flex justify="between" align="center" mb="4">
        <Heading as="h2" size="6">
          My Comments
        </Heading>
      </Flex>

      {comments.length === 0 ? (
        <Box mt="6" style={{ textAlign: "center", padding: "48px 24px" }}>
          <Heading as="h3" size="4" mb="2" style={{ color: "var(--gray-11)" }}>
            No comments yet
          </Heading>
          <p style={{ color: "var(--gray-10)", marginBottom: "24px" }}>
            Start engaging with the community by commenting on posts!
          </p>
          <Link href="/dashboard/posts">
            <Button>
              <ChatBubbleIcon /> Browse Posts
            </Button>
          </Link>
        </Box>
      ) : (
        <Flex direction="column" gap="4">
          {comments.map((comment) => (
            <ManageableCommentCard
              key={comment.id}
              comment={comment}
              onDelete={handleDelete}
            />
          ))}
        </Flex>
      )}
    </Box>
  );
}
