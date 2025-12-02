import { getPostById } from "@/lib/db";
import PostDetail from "@/lib/components/PostDetail";
import CreateCommentForm from "@/lib/components/CreateCommentForm";
import CommentsList from "@/lib/components/CommentsList";
import { notFound } from "next/navigation";
import { Section, Box, Heading } from "@radix-ui/themes";

interface PostPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function PostPage({ params }: PostPageProps) {
    const { id } = await params;
    const post = await getPostById(id);

    if (!post) {
        notFound();
    }

    const comments = post.comments || [];

    return (
        <Section>
            <PostDetail
                id={post.id}
                title={post.title}
                content={post.content}
                authorName={post.authorName}
            />

            <Box mt="6" maxWidth="576px">
                <Heading as="h2" size="5" mb="4">
                    Comments
                </Heading>

                <Box mb="4">
                    <CreateCommentForm postId={post.id} />
                </Box>

                <CommentsList comments={comments} />
            </Box>
        </Section>
    );
}