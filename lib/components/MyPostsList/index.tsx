'use client';

import { useState } from 'react';
import { Flex } from "@radix-ui/themes";
import ManageablePostPreviewCard from "../PostsList/ManageablePostPreviewCard";

interface Post {
    id: number;
    title: string;
    content: string;
    author: string;
    authorName: string;
    authorUsername?: string;
    voteScore?: number;
    commentCount?: number;
}

interface MyPostsListProps {
    posts: Post[];
}

export default function MyPostsList({ posts }: MyPostsListProps) {
    const [localPosts, setLocalPosts] = useState(posts);

    const handleDelete = (id: number) => {
        // Optimistically remove the post from the local state
        setLocalPosts(prevPosts => prevPosts.filter(post => post.id !== id));
    };

    return (
        <Flex direction="column" gap="4" className="MyPostsList">
            {localPosts.map((post) => (
                <ManageablePostPreviewCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    content={post.content}
                    author={post.author}
                    authorName={post.authorName}
                    authorUsername={post.authorUsername}
                    voteScore={post.voteScore}
                    commentCount={post.commentCount}
                    onDelete={handleDelete}
                />
            ))}
        </Flex>
    );
}
