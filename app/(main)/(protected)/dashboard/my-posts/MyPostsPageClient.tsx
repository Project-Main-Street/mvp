"use client";

import { useState, useCallback } from "react";
import { Box, Heading, Button, Flex } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import MyPostsList from "@/lib/components/MyPostsList";
import PostsSearch from "@/lib/components/PostsSearch";
import type { Post } from "@/lib/db";

interface MyPostsPageClientProps {
  initialPosts: Post[];
  userId: string;
}

export default function MyPostsPageClient({
  initialPosts,
  userId,
}: MyPostsPageClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const handleSearchResults = useCallback(
    (results: Post[] | null) => {
      // If results is null, show all posts (search cleared)
      if (results === null) {
        setPosts(initialPosts);
      } else {
        setPosts(results);
      }
    },
    [initialPosts],
  );

  return (
    <Box>
      <Flex justify="between" align="center" mb="4">
        <Heading as="h2" size="6">
          My Posts
        </Heading>
        <Link href="/dashboard/post/create">
          <Button variant="outline">
            <PlusIcon /> Create
          </Button>
        </Link>
      </Flex>

      <PostsSearch onResults={handleSearchResults} userId={userId} />

      {posts.length === 0 ? (
        <Box mt="6" style={{ textAlign: "center", padding: "48px 24px" }}>
          <Heading as="h3" size="4" mb="2" style={{ color: "var(--gray-11)" }}>
            No posts yet
          </Heading>
          <p style={{ color: "var(--gray-10)", marginBottom: "24px" }}>
            Start sharing your thoughts by creating your first post!
          </p>
          <Link href="/dashboard/post/create">
            <Button>
              <PlusIcon /> Create Your First Post
            </Button>
          </Link>
        </Box>
      ) : (
        <MyPostsList posts={posts} />
      )}
    </Box>
  );
}
