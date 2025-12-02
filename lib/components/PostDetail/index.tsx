import { Heading, Text, Box } from "@radix-ui/themes";

interface PostDetailProps {
    id: number;
    title: string;
    content: string;
    authorName: string;
}

export default function PostDetail({ id, title, content, authorName }: PostDetailProps) {
    return (
        <Box maxWidth="576px">
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
    );
}