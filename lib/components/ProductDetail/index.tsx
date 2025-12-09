import { Card, Heading, Text, Flex, Badge, Box } from '@radix-ui/themes';

interface ProductDetailProps {
    name: string;
    category: string | null;
    businessCount: number;
}

export default function ProductDetail({ name, category, businessCount }: ProductDetailProps) {
    return (
        <Card size="3">
            <Flex direction="column" gap="4">
                <Box>
                    <Heading as="h1" size="8" mb="2">
                        {name}
                    </Heading>
                    {category && (
                        <Badge color="blue" size="2" variant="soft">
                            {category}
                        </Badge>
                    )}
                </Box>

                <Box>
                    <Flex align="center" gap="2">
                        <Text size="5" weight="bold" color="gray">
                            {businessCount}
                        </Text>
                        <Text size="3" color="gray">
                            {businessCount === 1 ? 'business uses' : 'businesses use'} this product
                        </Text>
                    </Flex>
                </Box>

                {businessCount === 0 && (
                    <Box>
                        <Text size="2" color="gray">
                            No businesses are currently using this product. Be the first to add it to your business profile!
                        </Text>
                    </Box>
                )}
            </Flex>
        </Card>
    );
}
