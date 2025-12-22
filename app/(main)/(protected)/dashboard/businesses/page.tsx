import BusinessPreviewCard from "@/lib/components/BusinessPreviewCard";
import BusinessesList from "@/lib/components/BusinessesList";
import { getBusinessByUserId, getAllBusinesses } from "@/lib/db";
import { Heading, Box, Button, Flex, Card, Text } from "@radix-ui/themes";
import { stackServerApp } from "@/stack/server";
import Link from "next/link";

export default async function BusinessesPage() {
    const user = await stackServerApp.getUser({ or: "redirect" });

    const [business, allBusinesses] = await Promise.all([
        getBusinessByUserId(user.id),
        getAllBusinesses()
    ]);

    return (
        <Box>
            <Flex justify="between" align="center" mb="4">
                <Heading as="h2" size="6">
                    Your Business
                </Heading>
                {!business && (
                    <Link href="/dashboard/business/create">
                        <Button>Create Business</Button>
                    </Link>
                )}
            </Flex>

            {business ? (
                <Box mb="6">
                    <BusinessPreviewCard business={business} isOwner={true} />
                </Box>
            ) : (
                <Card mb="6">
                    <Flex direction="column" gap="3" align="center" py="4">
                        <Text size="3" color="gray" align="center">
                            You haven't created a business profile yet
                        </Text>
                        <Link href="/dashboard/business/create">
                            <Button size="3">
                                Create Business
                            </Button>
                        </Link>
                    </Flex>
                </Card>
            )}

            <Heading as="h3" size="5" mb="4" mt="6">
                All Businesses
            </Heading>
            <BusinessesList businesses={allBusinesses} />
        </Box>
    );
}
