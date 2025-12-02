import { Box, Text, Flex } from "@radix-ui/themes";
import CommentCard from "./CommentCard";

interface Comment {
    id: number;
    content: string;
    authorName: string;
    createdAt: Date;
}

interface CommentsListProps {
    comments: Comment[];
}

export default function CommentsList({ comments }: CommentsListProps) {
    if (comments.length === 0) {
        return (
            <Text size="2" color="gray">
                No comments yet. Be the first to comment!
            </Text>
        );
    }

    return (
        <Flex direction="column" gap="3">
            {comments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
            ))}
        </Flex>
    );
}