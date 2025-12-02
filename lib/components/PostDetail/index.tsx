import { Heading, Text, Box, Flex } from "@radix-ui/themes";
import VoteButton from "@/lib/components/VoteButton";

interface PostDetailProps {
    id: number;
    title: string;
    content: string;
    authorName: string;
    totalVotes?: number;
    voteScore?: number;
    upvotes?: number;
    downvotes?: number;
    userVote?: -1 | 0 | 1;
}

export default function PostDetail({
    id,
    title,
    content,
    authorName,
    totalVotes,
    voteScore,
    upvotes,
    downvotes,
    userVote
}: PostDetailProps) {
    return (
        <Flex gap="4" maxWidth="576px">
            <VoteButton
                type="post"
                targetId={id}
                totalVotes={totalVotes}
                voteScore={voteScore}
                upvotes={upvotes}
                downvotes={downvotes}
                userVote={userVote}
            />
            <Box>
                <Text as="p" size="2" color="gray" mb="2">
                    {authorName}
                </Text>
                <Heading as="h1" size="8" mb="4">
                    {title}
                </Heading>
                <Text as="div" size="3" style={{ whiteSpace: 'pre-wrap' }}>
                    {content}
                </Text>
            </Box>
        </Flex>
    );
}