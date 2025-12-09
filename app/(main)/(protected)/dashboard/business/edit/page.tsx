import { notFound, redirect } from "next/navigation";
import { Container, Heading, Section, Box } from "@radix-ui/themes";
import { stackServerApp } from "@/stack/server";
import { getBusinessByUserId } from "@/lib/db";
import UpsertBusinessForm from "@/lib/components/UpsertBusinessForm";

export default async function EditBusinessPage() {
    const user = await stackServerApp.getUser({ or: "redirect" });

    // Get user's business
    const business = await getBusinessByUserId(user.id);

    if (!business) {
        redirect('/dashboard/business/create');
    }

    return (
        <Section>
            <Container size="2">
                <Box mb="6">
                    <Heading as="h1" size="6" mb="2">
                        Edit Your Business
                    </Heading>
                </Box>
                <UpsertBusinessForm business={business} />
            </Container>
        </Section>
    );
}
