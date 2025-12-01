'use client';

import { Flex } from "@radix-ui/themes";
import PostPreviewCard from "./PostPreviewCard";
import "./styles.scss";

interface Post {
    id: number;
    title: string;
    content: string;
    authorName: string;
}

interface PostsListProps {
    posts: Post[];
}

export default function PostsList({ posts }: PostsListProps) {
    return (
        <Flex direction="column" gap="4" className="PostsList">
            {posts.map((post) => (
                <PostPreviewCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    content={post.content}
                    authorName={post.authorName}
                />
            ))}
        </Flex>
    );
}
