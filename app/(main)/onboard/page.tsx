import { Box, Container, Heading, Section, Text } from "@radix-ui/themes";
import OnboardingForm from "@/lib/components/OnboardingForm";

export default function OnboardPage() {
    return (
        <Section>
            <Container size="1" style={{ maxWidth: '500px' }}>
                <Box py="6">
                    <Heading as="h1" size="6" mb="2" align="center">
                        Complete Your Profile
                    </Heading>
                    <Text as="p" size="2" color="gray" align="center" mb="6">
                        Let's set up your account so you can start participating in the community
                    </Text>

                    <OnboardingForm />
                </Box>
            </Container>
        </Section>
    );
}
