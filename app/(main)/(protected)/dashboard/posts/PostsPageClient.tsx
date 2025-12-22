'use client';

import { useState, useCallback } from 'react';
import { Box, Heading, Button, Flex } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import PostsList from '@/lib/components/PostsList';
import PostsSearch from '@/lib/components/PostsSearch';
import type { Post } from '@/lib/db';

interface PostsPageClientProps {
    initialPosts: Post[];
}

export default function PostsPageClient({ initialPosts }: PostsPageClientProps) {
    const [posts, setPosts] = useState<Post[]>(initialPosts);

    const handleSearchResults = useCallback((results: Post[] | null) => {
        // If results is null, show all posts (search cleared)
        if (results === null) {
            setPosts(initialPosts);
        } else {
            setPosts(results);
        }
    }, [initialPosts]);

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

            <PostsSearch onResults={handleSearchResults} />

            <PostsList posts={posts} />
        </Box>
    );
}
