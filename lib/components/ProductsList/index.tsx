import { Card, Heading, Text, Grid, Box, Badge, Flex } from '@radix-ui/themes';
import Link from 'next/link';

interface Product {
    id: number;
    name: string;
    slug: string;
    categoryName: string | null;
}

interface ProductsListProps {
    products: Product[];
    usageCounts?: Record<number, number>;
}

export default function ProductsList({ products, usageCounts = {} }: ProductsListProps) {
    if (products.length === 0) {
        return (
            <Card>
                <Flex direction="column" gap="3" align="center" py="6">
                    <Text size="3" color="gray">
                        No products available
                    </Text>
                </Flex>
            </Card>
        );
    }

    // Group products by category
    const productsByCategory = products.reduce((acc, product) => {
        const category = product.categoryName || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {} as Record<string, Product[]>);

    return (
        <Box>
            {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                <Box key={category} mb="6">
                    <Heading as="h3" size="4" mb="3">
                        {category}
                    </Heading>
                    <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="3">
                        {categoryProducts.map((product) => (
                            <Link
                                key={product.id}
                                href={`/dashboard/products/${product.slug}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <Card style={{ cursor: 'pointer', height: '100%' }}>
                                    <Flex direction="column" gap="2">
                                        <Text size="3" weight="bold">
                                            {product.name}
                                        </Text>
                                        {usageCounts[product.id] !== undefined && (
                                            <Badge color="gray" variant="soft">
                                                {usageCounts[product.id]} {usageCounts[product.id] === 1 ? 'business' : 'businesses'}
                                            </Badge>
                                        )}
                                    </Flex>
                                </Card>
                            </Link>
                        ))}
                    </Grid>
                </Box>
            ))}
        </Box>
    );
}
