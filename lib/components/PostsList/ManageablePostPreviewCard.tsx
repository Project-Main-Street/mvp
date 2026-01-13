'use client';

import { useState } from "react";
import { Card, Heading, Text, Link, IconButton, DropdownMenu, Dialog, Flex, Button } from "@radix-ui/themes";
import { DotsVerticalIcon, TrashIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

interface ManageablePostPreviewCardProps {
    id: number;
    title: string;
    content: string;
    author: string;
    authorName: string;
    authorUsername?: string;
    voteScore?: number;
    commentCount?: number;
    onDelete?: (id: number) => void;
}

export default function ManageablePostPreviewCard({
    id,
    title,
    content,
    author,
    authorName,
    authorUsername,
    voteScore = 0,
    commentCount = 0,
    onDelete
}: ManageablePostPreviewCardProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const truncatedContent = content.length > 180
        ? content.substring(0, 180) + "..."
        : content;

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/post/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete post');
            }

            // Close dialog
            setIsDeleteDialogOpen(false);

            // Call the onDelete callback if provided
            if (onDelete) {
                onDelete(id);
            }

            // Refresh the page to update the list
            router.refresh();
        } catch (error) {
            console.error('Error deleting post:', error);
            alert(error instanceof Error ? error.message : 'Failed to delete post');
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

                <Text as="p" size="1" color="gray" mb="1">
                    {voteScore} {voteScore === 1 ? 'point' : 'points'} | <Link href={authorUsername ? `/dashboard/user/${authorUsername}` : '#'} color="blue">{authorName}</Link> | {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                </Text>
                <Heading as="h3" size="4" mb="2" style={{ paddingRight: '32px' }}>
                    <Link href={`/dashboard/post/${id}`} color="blue">
                        {title}
                    </Link>
                </Heading>
                <Text as="p" size="2" color="gray">
                    {truncatedContent}
                </Text>
            </Card>

            <Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <Dialog.Content style={{ maxWidth: 450 }}>
                    <Dialog.Title>Delete Post</Dialog.Title>
                    <Dialog.Description size="2" mb="4">
                        Are you sure you want to delete this post? This action cannot be undone.
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
