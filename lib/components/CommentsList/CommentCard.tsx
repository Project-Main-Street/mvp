import { Card, Text, Flex } from "@radix-ui/themes";

interface CommentCardProps {
    comment: {
        id: number;
        content: string;
        authorName: string;
        createdAt: Date;
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
        </Card>
    );
}
