'use client';

import { ChevronUpIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import { Button, Flex, Text } from '@radix-ui/themes';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface VoteButtonProps {
    targetId: number;
    totalVotes?: number;
    voteScore?: number;
    upvotes?: number;
    downvotes?: number;
    userVote?: -1 | 0 | 1;
}

export function VoteUpButton({ onClick, isActive, disabled }: { onClick: () => void; isActive: boolean; disabled?: boolean }) {
    return (
        <Button
            size="1"
            variant={isActive ? "solid" : "soft"}
            color={isActive ? "green" : "gray"}
            onClick={onClick}
            disabled={disabled}
            style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
            <ChevronUpIcon />
        </Button>
    );
}

export function VoteDownButton({ onClick, isActive, disabled }: { onClick: () => void; isActive: boolean; disabled?: boolean }) {
    return (
        <Button
            size="1"
            variant={isActive ? "solid" : "soft"}
            color={isActive ? "red" : "gray"}
            onClick={onClick}
            disabled={disabled}
            style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
            <ChevronDownIcon />
        </Button>
    );
}

export default function VoteButton({
    targetId,
    totalVotes = 0,
    voteScore = 0,
    upvotes = 0,
    downvotes = 0,
    userVote = 0
}: VoteButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleVote = async (valence: -1 | 1) => {
        setIsLoading(true);

        try {
            const response = await fetch('/api/vote', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ valence, postId: targetId }),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Error voting:', error);
                return;
            }

            // Refresh the page to show updated vote counts
            router.refresh();
        } catch (error) {
            console.error('Failed to submit vote:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpvote = () => handleVote(1);
    const handleDownvote = () => handleVote(-1);

    return (
        <Flex direction="column" align="center" gap="1">
            <VoteUpButton
                onClick={handleUpvote}
                isActive={userVote === 1}
                disabled={isLoading || userVote === 1}
            />
            <Text size="2" weight="bold">
                {voteScore}
            </Text>
            <VoteDownButton
                onClick={handleDownvote}
                isActive={userVote === -1}
                disabled={isLoading || userVote === -1}
            />
        </Flex>
    );
}
