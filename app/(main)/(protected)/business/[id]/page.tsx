import { getBusinessById } from "@/lib/db";
import { Container, DataList, Heading, Section } from "@radix-ui/themes";

export default async function BusinessesDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const business = await getBusinessById(id);
    return (
        <Container>
            <Section>
                <Heading>{business.name}</Heading>
                <DataList.Root>
                    <DataList.Item>
                        <DataList.Label>Owner</DataList.Label>
                        <DataList.Value>{business.owner.name}</DataList.Value>
                    </DataList.Item>
                </DataList.Root>
            </Section>
        </Container>
    );
}