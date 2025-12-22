import CustomAccountSettings from '@/lib/components/CustomAccountSettings';
import { stackServerApp } from "@/stack/server";
import { getBusinessByUserId } from "@/lib/db";
import { Box, Heading, Section } from "@radix-ui/themes";
import UpsertBusinessForm from "@/lib/components/UpsertBusinessForm";

export default async function AccountSettingsPage() {
    const user = await stackServerApp.getUser({ or: "redirect" });

    // Get user's business if they have one
    const business = await getBusinessByUserId(user.id);

    return (
        <Box p="6" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Heading as="h1" size="8" mb="6">
                Account Settings
            </Heading>

            <Section>
                <CustomAccountSettings />
            </Section>

            <Section>
                <UpsertBusinessForm business={business} />
            </Section>
        </Box>
    );
}
