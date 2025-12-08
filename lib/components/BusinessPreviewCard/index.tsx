import { Card, Heading, Text, Flex, Badge } from "@radix-ui/themes";
import { Business } from "@/lib/db";

interface BusinessPreviewCardProps {
    business: Business;
}

export default function BusinessPreviewCard({ business }: BusinessPreviewCardProps) {
    return (
        <Card>
            <Flex direction="column" gap="3">
                <Heading as="h3" size="4">
                    {business.name}
                </Heading>

                <Flex gap="2" wrap="wrap">
                    {business.category && (
                        <Badge color="blue" variant="soft">
                            {business.category}
                        </Badge>
                    )}
                    {business.location && (
                        <Badge color="gray" variant="soft">
                            📍 {business.location}
                        </Badge>
                    )}
                </Flex>

                {(business.employeeCountRangeLabel || business.revenueRangeLabel || business.products) && (
                    <Flex direction="column" gap="1">
                        {business.employeeCountRangeLabel && (
                            <Text size="2" color="gray">
                                <strong>Employees:</strong> {business.employeeCountRangeLabel}
                            </Text>
                        )}
                        {business.revenueRangeLabel && (
                            <Text size="2" color="gray">
                                <strong>Annual Revenue:</strong> {business.revenueRangeLabel}
                            </Text>
                        )}
                        {business.products && (
                            <Text size="2" color="gray">
                                <strong>Products/Services:</strong> {business.products}
                            </Text>
                        )}
                    </Flex>
                )}
            </Flex>
        </Card>
    );
}
