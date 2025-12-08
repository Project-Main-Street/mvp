'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, TextField, Text, Heading, Callout } from "@radix-ui/themes";

export default function OnboardingForm() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [location, setLocation] = useState("");
    const [error, setError] = useState("");
    const [isChecking, setIsChecking] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const checkAvailability = async (value: string) => {
        if (value.length < 3) return;

        setIsChecking(true);
        try {
            const response = await fetch(`/api/onboard?username=${encodeURIComponent(value)}`);
            const data = await response.json();

            if (!data.available) {
                setError("Username is already taken");
            } else {
                setError("");
            }
        } catch (err) {
            console.error("Error checking username:", err);
        } finally {
            setIsChecking(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (username.length < 3) {
            setError("Username must be at least 3 characters");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const response = await fetch("/api/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    location: location || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to create profile");
                setIsSubmitting(false);
                return;
            }

            // Redirect to dashboard after successful profile creation
            router.push("/dashboard");
            router.refresh();
        } catch (err) {
            setError("An error occurred. Please try again.");
            setIsSubmitting(false);
        }
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUsername(value);
        setError("");

        // Debounce the availability check
        if (value.length >= 3) {
            const timeoutId = setTimeout(() => checkAvailability(value), 500);
            return () => clearTimeout(timeoutId);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Box mb="4">
                <Text as="label" size="2" weight="bold" mb="1">
                    Username *
                </Text>
                <TextField.Root
                    size="3"
                    placeholder="username"
                    value={username}
                    onChange={handleUsernameChange}
                    disabled={isSubmitting}
                />
                <Text as="p" size="1" color="gray" mt="1">
                    3-20 characters, letters, numbers, underscores, and hyphens only
                </Text>
            </Box>

            <Box mb="4">
                <Text as="label" size="2" weight="bold" mb="1">
                    Location (ZIP Code)
                </Text>
                <TextField.Root
                    size="3"
                    placeholder="12345"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={isSubmitting}
                />
                <Text as="p" size="1" color="gray" mt="1">
                    Optional - Your ZIP code for local content
                </Text>
            </Box>

            {error && (
                <Callout.Root color="red" mb="4">
                    <Callout.Text>{error}</Callout.Text>
                </Callout.Root>
            )}

            {isChecking && (
                <Text as="p" size="2" color="gray" mb="4">
                    Checking availability...
                </Text>
            )}

            <Button
                type="submit"
                size="3"
                style={{ width: '100%' }}
                disabled={isSubmitting || isChecking || !!error || username.length < 3}
            >
                {isSubmitting ? "Creating Profile..." : "Complete Setup"}
            </Button>
        </form>
    );
}
