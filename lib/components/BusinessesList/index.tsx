import { Card, Heading, Text, Grid, Box, Badge, Flex } from '@radix-ui/themes';
import Link from 'next/link';
import { Business } from '@/lib/db';

interface BusinessesListProps {
    businesses: Business[];
}

export default function BusinessesList({ businesses }: BusinessesListProps) {
    if (businesses.length === 0) {
        return (
            <Card>
                <Flex direction="column" gap="3" align="center" py="6">
                    <Text size="3" color="gray">
                        No businesses found
                    </Text>
                </Flex>
            </Card>
        );
    }

    return (
        <Grid columns={{ initial: '1', md: '2' }} gap="4">
            {businesses.map((business) => (
                <Card key={business.id}>
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

                        {business.products.length > 0 && (
                            <Box>
                                <Text size="2" color="gray" weight="bold" mb="1">
                                    Products ({business.products.length}):
                                </Text>
                                <Flex gap="2" wrap="wrap">
                                    {business.products.slice(0, 3).map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/dashboard/products/${product.slug}`}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <Badge color="green" variant="soft" style={{ cursor: 'pointer' }}>
                                                {product.name}
                                            </Badge>
                                        </Link>
                                    ))}
                                    {business.products.length > 3 && (
                                        <Badge color="gray" variant="soft">
                                            +{business.products.length - 3} more
                                        </Badge>
                                    )}
                                </Flex>
                            </Box>
                        )}
                    </Flex>
                </Card>
            ))}
        </Grid>
    );
}
