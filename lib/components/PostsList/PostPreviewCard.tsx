import { Card, Heading, Text, Link } from "@radix-ui/themes";

interface PostPreviewCardProps {
    id: number;
    title: string;
    content: string;
}

export default function PostPreviewCard({ id, title, content }: PostPreviewCardProps) {
    const truncatedContent = content.length > 180
        ? content.substring(0, 180) + "..."
        : content;

    return (
        <Card>
            <Heading as="h3" size="4" mb="2">
                <Link href="#" color="blue">
                    {title}
                </Link>
            </Heading>
            <Text as="p" size="2" color="gray">
                {truncatedContent}
            </Text>
        </Card>
    );
}