'use client';

import { ChevronUpIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import { Button, Flex, Text } from '@radix-ui/themes';

interface VoteButtonProps {
    type: 'post' | 'comment';
    targetId: number;
    initialScore?: number;
    userVote?: -1 | 0 | 1;
}

export function VoteUpButton({ onClick, isActive }: { onClick: () => void; isActive: boolean }) {
    return (
        <Button
            size="1"
            variant={isActive ? "solid" : "soft"}
            color={isActive ? "green" : "gray"}
            onClick={onClick}
            style={{ cursor: 'pointer' }}
        >
            <ChevronUpIcon />
        </Button>
    );
}

export function VoteDownButton({ onClick, isActive }: { onClick: () => void; isActive: boolean }) {
    return (
        <Button
            size="1"
            variant={isActive ? "solid" : "soft"}
            color={isActive ? "red" : "gray"}
            onClick={onClick}
            style={{ cursor: 'pointer' }}
        >
            <ChevronDownIcon />
        </Button>
    );
}

export default function VoteButton({ type, targetId, initialScore = 0, userVote = 0 }: VoteButtonProps) {
    // TODO: Implement voting functionality
    const handleUpvote = () => {
        console.log('Upvote', type, targetId);
    };

    const handleDownvote = () => {
        console.log('Downvote', type, targetId);
    };

    return (
        <Flex direction="column" align="center" gap="1">
            <VoteUpButton onClick={handleUpvote} isActive={userVote === 1} />
            <Text size="2" weight="bold">
                {initialScore}
            </Text>
            <VoteDownButton onClick={handleDownvote} isActive={userVote === -1} />
        </Flex>
    );
}
