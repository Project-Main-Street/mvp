import { CredentialSignUp } from "@stackframe/stack";
import { Box, Section, Container, Heading } from "@radix-ui/themes";

export default function Handler() {
    return (
        <Section>
            <Heading as="h1" size="4" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                Sign Up
            </Heading>
            <Container>
                <Box width="300px" style={{ margin: 'auto' }}>
                    <CredentialSignUp />
                </Box>
            </Container>
            <Box style={{ textAlign: 'center', marginTop: '1rem' }}>
                <p>
                    Already have an account? <a href="/sign-in">Sign In</a>
                </p>
            </Box>
        </Section>

    );
}
