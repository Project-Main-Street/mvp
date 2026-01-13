'use client';

import { useState } from "react";
import { Card, Flex, Text, Link, IconButton, DropdownMenu, Dialog, Button, Box } from "@radix-ui/themes";
import { DotsVerticalIcon, TrashIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import type { CommentWithParentPost } from "@/lib/db";

interface ManageableCommentCardProps {
    comment: CommentWithParentPost;
    onDelete?: (id: number) => void;
}

export default function ManageableCommentCard({ comment, onDelete }: ManageableCommentCardProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/comment/${comment.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete comment');
            }

            // Close dialog
            setIsDeleteDialogOpen(false);

            // Call the onDelete callback if provided
            if (onDelete) {
                onDelete(comment.id);
            }

            // Refresh the page to update the list
            router.refresh();
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert(error instanceof Error ? error.message : 'Failed to delete comment');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Card style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                            <IconButton
                                variant="ghost"
                                size="1"
                                style={{ cursor: 'pointer' }}
                            >
                                <DotsVerticalIcon />
                            </IconButton>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content>
                            <DropdownMenu.Item
                                color="red"
                                onSelect={() => setIsDeleteDialogOpen(true)}
                            >
                                <TrashIcon /> Delete
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                </div>

                <Flex direction="column" gap="2" style={{ paddingRight: '32px' }}>
                    <Text as="p" size="1" color="gray">
                        {comment.voteScore} {comment.voteScore === 1 ? 'point' : 'points'} |
                        {' '}{new Date(comment.createdAt).toLocaleDateString()}
                    </Text>

                    {comment.parentPostTitle && (
                        <Box mb="2">
                            <Text size="2" color="gray" mb="1">
                                Comment on:
                            </Text>
                            <Link href={`/dashboard/post/${comment.parentPostId}`} size="3" weight="bold">
                                {comment.parentPostTitle}
                            </Link>
                            {comment.parentPostAuthorName && (
                                <Text size="1" color="gray" ml="2">
                                    by {comment.parentPostAuthorName}
                                </Text>
                            )}
                        </Box>
                    )}

                    <Box
                        p="3"
                        style={{
                            backgroundColor: 'var(--gray-2)',
                            borderRadius: '6px',
                            borderLeft: '3px solid var(--accent-9)'
                        }}
                    >
                        <Text as="p" size="2">
                            {comment.content.length > 300
                                ? comment.content.substring(0, 300) + "..."
                                : comment.content}
                        </Text>
                    </Box>

                    <Flex justify="end" mt="1">
                        <Link href={`/dashboard/post/${comment.parentPostId}`} size="2">
                            View in context →
                        </Link>
                    </Flex>
                </Flex>
            </Card>

            <Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <Dialog.Content style={{ maxWidth: 450 }}>
                    <Dialog.Title>Delete Comment</Dialog.Title>
                    <Dialog.Description size="2" mb="4">
                        Are you sure you want to delete this comment? This action cannot be undone.
                        Any replies to this comment will also be deleted.
                    </Dialog.Description>

                    <Flex gap="3" mt="4" justify="end">
                        <Dialog.Close>
                            <Button variant="soft" color="gray" disabled={isDeleting}>
                                Cancel
                            </Button>
                        </Dialog.Close>
                        <Button
                            color="red"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>
        </>
    );
}
