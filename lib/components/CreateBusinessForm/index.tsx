'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextField, Text, Box, Card, Flex, Select } from '@radix-ui/themes';

interface EmployeeCountRange {
    id: number;
    label: string;
}

interface RevenueRange {
    id: number;
    label: string;
}

export default function CreateBusinessForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [employeeCountRanges, setEmployeeCountRanges] = useState<EmployeeCountRange[]>([]);
    const [revenueRanges, setRevenueRanges] = useState<RevenueRange[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        category: '',
        employeeCountRangeId: '',
        revenueRangeId: '',
        products: ''
    });

    // Load ranges on mount
    useEffect(() => {
        async function loadRanges() {
            try {
                const response = await fetch('/api/business/ranges');
                if (response.ok) {
                    const data = await response.json();
                    setEmployeeCountRanges(data.employeeCountRanges || []);
                    setRevenueRanges(data.revenueRanges || []);
                }
            } catch (err) {
                console.error('Failed to load ranges:', err);
            }
        }
        loadRanges();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch('/api/business', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    location: formData.location || undefined,
                    category: formData.category || undefined,
                    employeeCountRangeId: formData.employeeCountRangeId ? parseInt(formData.employeeCountRangeId) : undefined,
                    revenueRangeId: formData.revenueRangeId ? parseInt(formData.revenueRangeId) : undefined,
                    products: formData.products || undefined
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create business');
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
                        <Text as="label" size="2" weight="bold" mb="2">
                            Products/Services
                        </Text>
                        <TextField.Root
                            value={formData.products}
                            onChange={(e) => handleChange('products', e.target.value)}
                            placeholder="e.g., Software, Consulting, Retail Goods"
                            disabled={isLoading}
                        />
                        <Text size="1" color="gray" mt="1">
                            Optional. Describe your main products or services
                        </Text>
                    </Box>

                    {error && (
                        <Text color="red" size="2">
                            {error}
                        </Text>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading || !formData.name.trim()}
                        size="3"
                    >
                        {isLoading ? 'Creating...' : 'Create Business'}
                    </Button>
                </Flex>
            </form>
        </Card>
    );
}
