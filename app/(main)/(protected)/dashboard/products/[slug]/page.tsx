import { notFound } from 'next/navigation';
import { Box, Button, Flex } from '@radix-ui/themes';
import Link from 'next/link';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { getProductBySlug, getProductUsageCount } from '@/lib/db';
import ProductDetail from '@/lib/components/ProductDetail';

interface ProductPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;

    // Fetch product by slug
    const product = await getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    // Get count of businesses using this product
    const businessCount = await getProductUsageCount(slug);

    return (
        <Box>
            <Box mb="4">
                <Button variant="ghost" asChild>
                    <Link href="/dashboard/products">
                        <Flex align="center" gap="2">
                            <ArrowLeftIcon />
                            Back to Products
                        </Flex>
                    </Link>
                </Button>
            </Box>

            <ProductDetail
                name={product.name}
                category={product.categoryName}
                businessCount={businessCount}
            />
        </Box>
    );
}
