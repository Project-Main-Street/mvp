import PostsList from "@/lib/components/PostsList";
import { getPosts } from "@/lib/db";
import { Heading, Box, Button, Flex } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import PostsPageClient from "./PostsPageClient";

export default async function PostsPage() {
    const posts = await getPosts();

    return (
        <PostsPageClient initialPosts={posts} />
    );
}
