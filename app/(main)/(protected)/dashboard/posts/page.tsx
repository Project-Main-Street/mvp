import PostsList from "@/lib/components/PostsList";
import { getPosts } from "@/lib/db";
import { Heading, Box, Button, Flex } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export default async function PostsPage() {
    const posts = await getPosts();

    return (
        <Box>
            <Flex justify="between" align="center" mb="4">
                <Heading as="h2" size="6">
                    All Posts
                </Heading>
                <Link href="/dashboard/post/create">
                    <Button variant="outline">
                        <PlusIcon /> Create
                    </Button>
                </Link>
            </Flex>
            <PostsList posts={posts} />
        </Box>
    );
}
