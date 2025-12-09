import { Card, Heading, Text, Flex, Badge, Button } from "@radix-ui/themes";
import { Business } from "@/lib/db";
import Link from "next/link";

interface BusinessPreviewCardProps {
    business: Business;
    isOwner?: boolean;
}

export default function BusinessPreviewCard({ business, isOwner = false }: BusinessPreviewCardProps) {
    return (
        <Card>
            <Flex direction="column" gap="3">
                <Flex justify="between" align="center">
                    <Heading as="h3" size="4">
                        {business.name}
                    </Heading>
                    {isOwner && (
                        <Link href="/dashboard/business/edit">
                            <Button size="2" variant="soft">
                                Edit
                            </Button>
                        </Link>
                    )}
                </Flex>

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

                {(business.employeeCountRangeLabel || business.revenueRangeLabel || business.products.length > 0) && (
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
                        {business.products.length > 0 && (
                            <div>
                                <Text size="2" color="gray" weight="bold">
                                    Products/Services:
                                </Text>
                                <Flex gap="2" wrap="wrap" mt="1">
                                    {business.products.map((product) => (
                                        <Badge key={product.id} color="green" variant="soft">
                                            {product.name}
                                            {product.categoryName && ` • ${product.categoryName}`}
                                        </Badge>
                                    ))}
                                </Flex>
                            </div>
                        )}
                    </Flex>
                )}
            </Flex>
        </Card>
    );
}
