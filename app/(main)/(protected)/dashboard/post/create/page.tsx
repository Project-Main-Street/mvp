import CreatePostForm from "@/lib/components/CreatePostForm";
import { Container, Heading, Section } from "@radix-ui/themes";

export default function CreatePostPage() {
    return (
        <Section>
            <Container>
                <Heading as="h1" size="8" mb="4">
                    Create Post
                </Heading>
                <CreatePostForm />
            </Container>
        </Section>
    );
}