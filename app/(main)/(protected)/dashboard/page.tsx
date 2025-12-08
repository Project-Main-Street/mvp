
import PostsList from "@/lib/components/PostsList";
import BusinessPreviewCard from "@/lib/components/BusinessPreviewCard";
import { getPosts, getBusinessByUserId } from "@/lib/db";
import { Container, Heading, Section, Box, Button, Flex, Card, Text } from "@radix-ui/themes";
import { stackServerApp } from "@/stack/server";
import Link from "next/link";

export default async function DashboardPage() {
    const user = await stackServerApp.getUser({ or: "redirect" });

    // Fetch posts and user's business in parallel
    const [posts, business] = await Promise.all([
        getPosts(),
        getBusinessByUserId(user.id)
    ]);

    return (
        <Section>
            <Container>
                {/* Business Section */}
                <Box mb="6">
                    <Heading as="h2" size="5" mb="3">
                        Your Business
                    </Heading>
                    {business ? (
                        <BusinessPreviewCard business={business} />
                    ) : (
                        <Card>
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
                </Box>

                {/* Posts Section */}
                <Heading as="h2" size="5" mb="3" style={{ textAlign: 'center' }}>
                    All Posts
                </Heading>
                <PostsList posts={posts} />
            </Container>
        </Section>
    );
}
