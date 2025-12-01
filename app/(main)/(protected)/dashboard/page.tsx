
import PostsList from "@/lib/components/PostsList";
import { getPosts } from "@/lib/db";
import { Container, Heading, Section } from "@radix-ui/themes";

export default async function DashboardPage() {

    // fetch all posts from the database
    const posts = await getPosts();
    return (
        <Section>
            <Container>
                <Heading style={{ textAlign: 'center', marginBottom: '1rem' }}>All Posts</Heading>
                <PostsList posts={posts} />
            </Container>
        </Section>
    );
}
