'use client';

import { useUser } from '@stackframe/stack';
import { Button, TextField, Text, Box, Card, Flex, Heading } from '@radix-ui/themes';
import { useState, useEffect } from 'react';

export default function CustomAccountSettings() {
    const user = useUser({ or: 'redirect' });
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);

    useEffect(() => {
        if (user?.displayName) {
            setDisplayName(user.displayName);
        }
    }, [user?.displayName]);

    // Debounced username availability check
    useEffect(() => {
        if (!displayName || displayName === user?.displayName) {
            setAvailabilityMessage(null);
            return;
        }

        const timer = setTimeout(async () => {
            setIsChecking(true);
            try {
                const response = await fetch(`/api/onboard?username=${encodeURIComponent(displayName)}`);
                const data = await response.json();

                if (data.available) {
                    setAvailabilityMessage('✓ Username available');
                } else {
                    setAvailabilityMessage('✗ Username taken');
                }
            } catch (err) {
                console.error('Error checking availability:', err);
            } finally {
                setIsChecking(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [displayName, user?.displayName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        try {
            const response = await fetch('/api/user', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ displayName }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update username');
            }

            setSuccess('Username updated successfully!');

            // Refresh the user data
            window.location.reload();
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box p="6" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Heading as="h1" size="6" mb="6">
                Account Settings
            </Heading>

            <Card>
                <form onSubmit={handleSubmit}>
                    <Flex direction="column" gap="4">
                        <Box>
                            <Text as="label" size="2" weight="bold" mb="2">
                                Username
                            </Text>
                            <TextField.Root
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Enter your username"
                                disabled={isLoading}
                            />
                            {isChecking && (
                                <Text size="1" color="gray" mt="1">
                                    Checking availability...
                                </Text>
                            )}
                            {availabilityMessage && !isChecking && (
                                <Text
                                    size="1"
                                    color={availabilityMessage.startsWith('✓') ? 'green' : 'red'}
                                    mt="1"
                                >
                                    {availabilityMessage}
                                </Text>
                            )}
                            <Text size="1" color="gray" mt="1">
                                3-20 characters. Letters, numbers, underscores, and hyphens only.
                            </Text>
                        </Box>

                        <Box>
                            <Text as="label" size="2" weight="bold" mb="2">
                                Email
                            </Text>
                            <TextField.Root
                                value={user?.primaryEmail || ''}
                                disabled
                            />
                            <Text size="1" color="gray" mt="1">
                                Email cannot be changed at this time
                            </Text>
                        </Box>

                        {error && (
                            <Text color="red" size="2">
                                {error}
                            </Text>
                        )}

                        {success && (
                            <Text color="green" size="2">
                                {success}
                            </Text>
                        )}

                        <Button
                            type="submit"
                            disabled={
                                isLoading ||
                                !displayName ||
                                displayName === user?.displayName ||
                                (availabilityMessage !== null && !availabilityMessage.startsWith('✓'))
                            }
                        >
                            {isLoading ? 'Updating...' : 'Save Changes'}
                        </Button>
                    </Flex>
                </form>
            </Card>
        </Box>
    );
}
