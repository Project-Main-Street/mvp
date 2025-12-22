'use client';

import { useState, useCallback, useEffect } from 'react';
import { TextField, Box, Text } from '@radix-ui/themes';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useDebounce } from '@/lib/hooks/useDebounce';
import type { Post } from '@/lib/db';

interface PostsSearchProps {
    onResults: (posts: Post[] | null) => void;
    userId?: string;
}

export default function PostsSearch({ onResults, userId }: PostsSearchProps) {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        const performSearch = async () => {
            // If search is empty, return null to show all posts
            if (!debouncedQuery.trim()) {
                onResults(null);
                return;
            }

            setIsSearching(true);
            try {
                const params = new URLSearchParams({ q: debouncedQuery });
                if (userId) params.append('userId', userId);

                const response = await fetch(`/api/posts/search?${params}`);
                if (!response.ok) throw new Error('Search failed');

                const data = await response.json();
                onResults(data.posts);
            } catch (error) {
                console.error('Search error:', error);
                onResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        performSearch();
    }, [debouncedQuery, userId]);

    return (
        <Box mb="4">
            <TextField.Root
                size="3"
                placeholder="Search posts by title or content..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            >
                <TextField.Slot>
                    <MagnifyingGlassIcon height="16" width="16" />
                </TextField.Slot>
            </TextField.Root>
            {isSearching && (
                <Text size="2" color="gray" mt="2">
                    Searching...
                </Text>
            )}
            {query && !isSearching && (
                <Text size="2" color="gray" mt="2">
                    {debouncedQuery ? `Showing results for "${debouncedQuery}"` : ''}
                </Text>
            )}
        </Box>
    );
}
