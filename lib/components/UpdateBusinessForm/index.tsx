'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextField, Text, Box, Card, Flex, Select, IconButton } from '@radix-ui/themes';
import { PlusIcon, Cross2Icon } from '@radix-ui/react-icons';
import { Business } from '@/lib/db';

interface EmployeeCountRange {
    id: number;
    label: string;
}

interface RevenueRange {
    id: number;
    label: string;
}

interface ProductCategory {
    id: number;
    name: string;
}

interface ProductInput {
    id?: number;
    name: string;
    categoryId: string;
}

interface UpdateBusinessFormProps {
    business: Business;
}

export default function UpdateBusinessForm({ business }: UpdateBusinessFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [employeeCountRanges, setEmployeeCountRanges] = useState<EmployeeCountRange[]>([]);
    const [revenueRanges, setRevenueRanges] = useState<RevenueRange[]>([]);
    const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
    const [products, setProducts] = useState<ProductInput[]>([]);

    const [formData, setFormData] = useState({
        name: business.name,
        location: business.location || '',
        category: business.category || '',
        employeeCountRangeId: business.employeeCountRangeId?.toString() || '',
        revenueRangeId: business.revenueRangeId?.toString() || ''
    });

    // Load ranges and product categories on mount
    useEffect(() => {
        async function loadData() {
            try {
                const [rangesResponse, categoriesResponse] = await Promise.all([
                    fetch('/api/business/ranges'),
                    fetch('/api/business/product-categories')
                ]);

                if (rangesResponse.ok) {
                    const data = await rangesResponse.json();
                    setEmployeeCountRanges(data.employeeCountRanges || []);
                    setRevenueRanges(data.revenueRanges || []);
                }

                if (categoriesResponse.ok) {
                    const data = await categoriesResponse.json();
                    setProductCategories(data.categories || []);
                }
            } catch (err) {
                console.error('Failed to load data:', err);
            }
        }
        loadData();

        // Initialize products from business
        if (business.products && business.products.length > 0) {
            setProducts(business.products.map(p => ({
                id: p.id,
                name: p.name,
                categoryId: p.categoryId?.toString() || ''
            })));
        } else {
            setProducts([{ name: '', categoryId: '' }]);
        }
    }, [business]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Filter out empty products
            const validProducts = products.filter(p => p.name.trim() && p.categoryId);

            const response = await fetch('/api/business', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    location: formData.location || undefined,
                    category: formData.category || undefined,
                    employeeCountRangeId: formData.employeeCountRangeId ? parseInt(formData.employeeCountRangeId) : undefined,
                    revenueRangeId: formData.revenueRangeId ? parseInt(formData.revenueRangeId) : undefined,
                    products: validProducts.length > 0 ? validProducts.map(p => ({
                        id: p.id,
                        name: p.name,
                        categoryId: parseInt(p.categoryId)
                    })) : []
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update business');
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

    const addProduct = () => {
        setProducts(prev => [...prev, { name: '', categoryId: '' }]);
    };

    const removeProduct = (index: number) => {
        setProducts(prev => prev.filter((_, i) => i !== index));
    };

    const updateProduct = (index: number, field: 'name' | 'categoryId', value: string) => {
        setProducts(prev => prev.map((product, i) =>
            i === index ? { ...product, [field]: value } : product
        ));
    };

    return (
        <Card>
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
                        <Flex justify="between" align="center" mb="2">
                            <Text as="label" size="2" weight="bold">
                                Products/Services
                            </Text>
                            <Button
                                type="button"
                                size="1"
                                variant="soft"
                                onClick={addProduct}
                                disabled={isLoading}
                            >
                                <PlusIcon /> Add Product
                            </Button>
                        </Flex>
                        <Flex direction="column" gap="3">
                            {products.map((product, index) => (
                                <Card key={index} variant="surface">
                                    <Flex gap="2" align="start">
                                        <Box style={{ flex: 1 }}>
                                            <TextField.Root
                                                value={product.name}
                                                onChange={(e) => updateProduct(index, 'name', e.target.value)}
                                                placeholder="Product/Service name"
                                                disabled={isLoading}
                                            />
                                        </Box>
                                        <Box style={{ width: '200px' }}>
                                            <Select.Root
                                                value={product.categoryId}
                                                onValueChange={(value) => updateProduct(index, 'categoryId', value)}
                                                disabled={isLoading}
                                            >
                                                <Select.Trigger placeholder="Category" style={{ width: '100%' }} />
                                                <Select.Content>
                                                    {productCategories.map((category) => (
                                                        <Select.Item key={category.id} value={category.id.toString()}>
                                                            {category.name}
                                                        </Select.Item>
                                                    ))}
                                                </Select.Content>
                                            </Select.Root>
                                        </Box>
                                        {products.length > 1 && (
                                            <IconButton
                                                type="button"
                                                size="2"
                                                variant="ghost"
                                                color="red"
                                                onClick={() => removeProduct(index)}
                                                disabled={isLoading}
                                            >
                                                <Cross2Icon />
                                            </IconButton>
                                        )}
                                    </Flex>
                                </Card>
                            ))}
                        </Flex>
                        <Text size="1" color="gray" mt="1">
                            Optional. Add the products or services your business offers
                        </Text>
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
                            {isLoading ? 'Updating...' : 'Update Business'}
                        </Button>
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
                    </Flex>
                </Flex>
            </form>
        </Card>
    );
}
