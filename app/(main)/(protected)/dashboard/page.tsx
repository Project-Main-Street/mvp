import BusinessesList from "@/lib/components/BusinessesList";
import ProfilesList from "@/lib/components/ProfilesList";
import { getBusinesses, getProfiles } from "@/lib/db";
import { Container, Grid, Heading, Section } from "@radix-ui/themes";

export default async function DashboardPage() {
    // fetch the profiles
    // from the database
    const profiles = await getProfiles();
    const businesses = await getBusinesses();
    return (
        <>
            <Section>
                <Container>
                    <Heading>Dashboard</Heading>
                </Container>
            </Section>
            <Section>
                <Container>
                    <Grid columns="2">
                        <Container>
                            <Heading>Profiles</Heading>
                            <ProfilesList profiles={profiles} />
                        </Container>
                        <Container>
                            <Heading>Businesses</Heading>
                            <BusinessesList businesses={businesses} />
                        </Container>
                    </Grid>
                </Container>
            </Section>
        </>
    );
}
