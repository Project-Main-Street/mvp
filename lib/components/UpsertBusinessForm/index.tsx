'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextField, Text, Box, Card, Flex, Select, Heading } from '@radix-ui/themes';
import { Business } from '@/lib/db';

interface EmployeeCountRange {
    id: number;
    label: string;
}

interface RevenueRange {
    id: number;
    label: string;
}

interface ReferenceProduct {
    id: number;
    name: string;
    slug: string;
    categoryId: number | null;
    categoryName: string | null;
}

interface UpsertBusinessFormProps {
    business?: Business | null;
}

export default function UpsertBusinessForm({ business }: UpsertBusinessFormProps) {
    const router = useRouter();
    const isEditing = !!business;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [employeeCountRanges, setEmployeeCountRanges] = useState<EmployeeCountRange[]>([]);
    const [revenueRanges, setRevenueRanges] = useState<RevenueRange[]>([]);
    const [availableProducts, setAvailableProducts] = useState<ReferenceProduct[]>([]);
    const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());

    const [formData, setFormData] = useState({
        name: business?.name || '',
        location: business?.location || '',
        category: business?.category || '',
        employeeCountRangeId: business?.employeeCountRangeId?.toString() || '',
        revenueRangeId: business?.revenueRangeId?.toString() || ''
    });

    // Load data on mount
    useEffect(() => {
        async function loadData() {
            try {
                const [rangesResponse, productsResponse] = await Promise.all([
                    fetch('/api/business/ranges'),
                    fetch('/api/business/products')
                ]);

                if (rangesResponse.ok) {
                    const data = await rangesResponse.json();
                    setEmployeeCountRanges(data.employeeCountRanges || []);
                    setRevenueRanges(data.revenueRanges || []);
                }

                if (productsResponse.ok) {
                    const data = await productsResponse.json();
                    const refProducts = data.products || [];
                    setAvailableProducts(refProducts);

                    // Initialize selected products from business by matching product names
                    if (business?.products && business.products.length > 0) {
                        const productIds = new Set<number>();
                        business.products.forEach(businessProduct => {
                            const matchingRefProduct = refProducts.find(
                                (refProduct: ReferenceProduct) => refProduct.name === businessProduct.name
                            );
                            if (matchingRefProduct) {
                                productIds.add(matchingRefProduct.id);
                            }
                        });
                        setSelectedProductIds(productIds);
                    }
                }
            } catch (err) {
                console.error('Failed to load data:', err);
            }
        }
        loadData();
    }, [business]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const method = isEditing ? 'PUT' : 'POST';
            const productsList = Array.from(selectedProductIds);

            const response = await fetch('/api/business', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    location: formData.location || undefined,
                    category: formData.category || undefined,
                    employeeCountRangeId: formData.employeeCountRangeId ? parseInt(formData.employeeCountRangeId) : undefined,
                    revenueRangeId: formData.revenueRangeId ? parseInt(formData.revenueRangeId) : undefined,
                    productIds: productsList.length > 0 ? productsList : undefined
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Failed to ${isEditing ? 'update' : 'create'} business`);
            }

            // Redirect to dashboard on success
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleProduct = (productId: number) => {
        setSelectedProductIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    // Group products by category
    const productsByCategory = availableProducts.reduce((acc, product) => {
        const category = product.categoryName || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {} as Record<string, ReferenceProduct[]>);

    return (
        <Card>
            <Box p="4">
                <Heading as="h3" size="4" mb="4">
                    Business Settings
                </Heading>
                <form onSubmit={handleSubmit}>
                    <Flex direction="column" gap="4">
                        <Box>
                            <Text as="label" size="2" weight="bold" mb="2">
                                Business Name *
                            </Text>
                            <TextField.Root
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Enter your business name"
                                disabled={isLoading}
                                required
                            />
                        </Box>

                        <Box>
                            <Text as="label" size="2" weight="bold" mb="2">
                                Location (ZIP Code)
                            </Text>
                            <TextField.Root
                                value={formData.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                                placeholder="e.g., 12345 or 12345-6789"
                                disabled={isLoading}
                            />
                            <Text size="1" color="gray" mt="1">
                                Optional. Provide a 5-digit ZIP code or ZIP+4 format
                            </Text>
                        </Box>

                        <Box>
                            <Text as="label" size="2" weight="bold" mb="2">
                                Category
                            </Text>
                            <TextField.Root
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                placeholder="e.g., Retail, Technology, Healthcare"
                                disabled={isLoading}
                            />
                            <Text size="1" color="gray" mt="1">
                                Optional. Business industry or category
                            </Text>
                        </Box>

                        <Box>
                            <Text as="label" size="2" weight="bold" mb="2">
                                Number of Employees
                            </Text>
                            <Select.Root
                                value={formData.employeeCountRangeId}
                                onValueChange={(value) => handleChange('employeeCountRangeId', value)}
                                disabled={isLoading}
                            >
                                <Select.Trigger placeholder="Select employee count range" style={{ width: '100%' }} />
                                <Select.Content>
                                    {employeeCountRanges.map((range) => (
                                        <Select.Item key={range.id} value={range.id.toString()}>
                                            {range.label}
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Root>
                            <Text size="1" color="gray" mt="1">
                                Optional. Select the range that matches your employee count
                            </Text>
                        </Box>

                        <Box>
                            <Text as="label" size="2" weight="bold" mb="2">
                                Annual Revenue
                            </Text>
                            <Select.Root
                                value={formData.revenueRangeId}
                                onValueChange={(value) => handleChange('revenueRangeId', value)}
                                disabled={isLoading}
                            >
                                <Select.Trigger placeholder="Select revenue range" style={{ width: '100%' }} />
                                <Select.Content>
                                    {revenueRanges.map((range) => (
                                        <Select.Item key={range.id} value={range.id.toString()}>
                                            {range.label}
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Root>
                            <Text size="1" color="gray" mt="1">
                                Optional. Select the range that matches your annual revenue
                            </Text>
                        </Box>

                        <Box>
                            <Text as="label" size="2" weight="bold" mb="2">
                                Products/Services
                            </Text>
                            <Select.Root
                                value=""
                                onValueChange={(value) => toggleProduct(parseInt(value))}
                                disabled={isLoading}
                            >
                                <Select.Trigger placeholder="Select products your business uses" style={{ width: '100%' }} />
                                <Select.Content>
                                    {Object.entries(productsByCategory).map(([category, products]) => (
                                        <Select.Group key={category}>
                                            <Select.Label>{category}</Select.Label>
                                            {products.map((product) => (
                                                <Select.Item
                                                    key={product.id}
                                                    value={product.id.toString()}
                                                    disabled={selectedProductIds.has(product.id)}
                                                >
                                                    {product.name} {selectedProductIds.has(product.id) ? '✓' : ''}
                                                </Select.Item>
                                            ))}
                                        </Select.Group>
                                    ))}
                                </Select.Content>
                            </Select.Root>
                            <Text size="1" color="gray" mt="1">
                                Optional. Select the products or services your business uses
                            </Text>

                            {selectedProductIds.size > 0 && (
                                <Box mt="3">
                                    <Text size="2" weight="bold" mb="2">
                                        Selected Products ({selectedProductIds.size}):
                                    </Text>
                                    <Flex gap="2" wrap="wrap">
                                        {availableProducts
                                            .filter(p => selectedProductIds.has(p.id))
                                            .map(product => (
                                                <Card key={product.id} variant="surface" size="1">
                                                    <Flex align="center" gap="2">
                                                        <Text size="2">{product.name}</Text>
                                                        <Button
                                                            type="button"
                                                            size="1"
                                                            variant="ghost"
                                                            color="red"
                                                            onClick={() => toggleProduct(product.id)}
                                                            disabled={isLoading}
                                                        >
                                                            ×
                                                        </Button>
                                                    </Flex>
                                                </Card>
                                            ))}
                                    </Flex>
                                </Box>
                            )}
                        </Box>

                        {error && (
                            <Text color="red" size="2">
                                {error}
                            </Text>
                        )}

                        <Flex gap="3">
                            <Button
                                type="submit"
                                disabled={isLoading || !formData.name.trim()}
                                size="3"
                                style={{ flex: 1 }}
                            >
                                {isLoading
                                    ? (isEditing ? 'Updating...' : 'Creating...')
                                    : (isEditing ? 'Update Business' : 'Create Business')
                                }
                            </Button>
                            {isEditing && (
                                <Button
                                    type="button"
                                    variant="soft"
                                    color="gray"
                                    size="3"
                                    onClick={() => router.push('/dashboard')}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                            )}
                        </Flex>
                    </Flex>
                </form>
            </Box>
        </Card>
    );
}
