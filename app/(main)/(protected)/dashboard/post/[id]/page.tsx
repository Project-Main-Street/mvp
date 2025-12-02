import { getPostById } from "@/lib/db";
import PostDetail from "@/lib/components/PostDetail";
import { notFound } from "next/navigation";
import { Section } from "@radix-ui/themes";

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

    return (
        <Section>
            <PostDetail
                id={post.id}
                title={post.title}
                content={post.content}
                authorName={post.authorName}
            />
        </Section>
    );
}