import { Card, Text, Flex } from "@radix-ui/themes";
import VoteButton from "@/lib/components/VoteButton";

interface CommentCardProps {
    comment: {
        id: number;
        content: string;
        authorName: string;
        createdAt: Date;
        voteScore?: number;
        userVote?: -1 | 0 | 1;
    };
}

export default function CommentCard({ comment }: CommentCardProps) {
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
        <Card>
            <Flex gap="3">
                <VoteButton
                    type="comment"
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
                    <Text as="p" size="2" style={{ whiteSpace: 'pre-wrap' }}>
                        {comment.content}
                    </Text>
                </Flex>
            </Flex>
        </Card>
    );
}
