'use client';

import { Card, Text, Flex, Button } from "@radix-ui/themes";
import VoteButton from "@/lib/components/VoteButton";
import { useState } from "react";
import CreateCommentForm from "@/lib/components/CreateCommentForm";

interface Comment {
    id: number;
    content: string;
    authorName: string;
    createdAt: Date;
    voteScore?: number;
    userVote?: -1 | 0 | 1;
    replies?: Comment[];
    depth?: number;
}

interface CommentCardProps {
    comment: Comment;
}

export default function CommentCard({ comment }: CommentCardProps) {
    const [showReplyForm, setShowReplyForm] = useState(false);

    const formatDateTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(new Date(date));
    };

    return (
        <Flex direction="column" gap="2">
            <Card>
                <Flex gap="3">
                    <VoteButton
                        targetId={comment.id}
                        voteScore={comment.voteScore}
                        userVote={comment.userVote}
                    />
                    <Flex direction="column" flexGrow="1">
                        <Flex justify="between" align="center" mb="2">
                            <Text size="1" color="gray">
                                {comment.authorName}
                            </Text>
                            <Text size="1" color="gray">
                                {formatDateTime(comment.createdAt)}
                            </Text>
                        </Flex>
                        <Text as="p" size="2" style={{ whiteSpace: 'pre-wrap' }} mb="2">
                            {comment.content}
                        </Text>
                        <Button
                            size="1"
                            variant="soft"
                            style={{ width: 'fit-content' }}
                            onClick={() => setShowReplyForm(!showReplyForm)}
                        >
                            {showReplyForm ? 'Cancel' : 'Reply'}
                        </Button>
                    </Flex>
                </Flex>
            </Card>

            {showReplyForm && (
                <Card style={{ marginLeft: '2rem' }}>
                    <CreateCommentForm
                        parentId={comment.id}
                        onSuccess={() => setShowReplyForm(false)}
                        isReply={true}
                    />
                </Card>
            )}

            {comment.replies && comment.replies.length > 0 && (
                <Flex direction="column" gap="2" style={{ marginLeft: '2rem' }}>
                    {comment.replies.map((reply) => (
                        <CommentCard key={reply.id} comment={reply} />
                    ))}
                </Flex>
            )}
        </Flex>
    );
}
