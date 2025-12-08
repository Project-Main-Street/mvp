import { Box, Container, Heading, Section, Text } from "@radix-ui/themes";
import CreateBusinessForm from "@/lib/components/CreateBusinessForm";

export default function CreateBusinessPage() {
    return (
        <Section style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '2rem' }}>
            <Container size="2" style={{ maxWidth: '700px' }}>
                <Box py="6">
                    <Heading as="h1" size="6" mb="2" align="center">
                        Create Your Business Profile
                    </Heading>
                    <Text as="p" size="2" color="gray" align="center" mb="6">
                        Set up your business profile to connect with the Main Street community
                    </Text>

                    <CreateBusinessForm />
                </Box>
            </Container>
        </Section>
    );
}
