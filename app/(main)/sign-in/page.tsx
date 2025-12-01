import { CredentialSignIn } from "@stackframe/stack";
import { Box, Section, Container, Heading } from "@radix-ui/themes";

export default function Handler() {
    return (
        <Section>
            <Heading as="h1" size="4" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                Sign In
            </Heading>
            <Container>
                <Box width="300px" style={{ margin: 'auto' }}>
                    <CredentialSignIn />
                </Box>
            </Container>
            <Box style={{ textAlign: 'center', marginTop: '1rem' }}>
                <p>
                    Don't have an account? <a href="/sign-up">Sign Up</a>
                </p>
            </Box>
        </Section>

    );
}
