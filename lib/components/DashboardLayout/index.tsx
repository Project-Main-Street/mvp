'use client';

import { usePathname } from 'next/navigation';
import { Box, Flex, Text, Card, Container } from '@radix-ui/themes';
import { FileTextIcon, HomeIcon, ArchiveIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import './styles.css';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();

    const tabs = [
        { href: '/dashboard/posts', label: 'Posts', icon: FileTextIcon },
        { href: '/dashboard/businesses', label: 'Businesses', icon: HomeIcon },
        { href: '/dashboard/products', label: 'Products', icon: ArchiveIcon },
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard/posts') {
            return pathname === '/dashboard/posts' || pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    return (
        <Container size="4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <Card style={{ minHeight: '80vh' }}>
                <Flex gap="0">
                    {/* Side Panel */}
                    <Box
                        className="dashboard-side-panel"
                        style={{
                            width: '260px',
                            flexShrink: 0,
                            borderRight: '1px solid var(--gray-5)',
                            padding: '16px',
                        }}
                    >
                        <Flex direction="column" gap="1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const active = isActive(tab.href);

                                return (
                                    <Link key={tab.href} href={tab.href} style={{ textDecoration: 'none' }}>
                                        <Box
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                backgroundColor: active ? 'var(--accent-3)' : 'transparent',
                                                transition: 'background-color 0.2s',
                                            }}
                                            className="dashboard-nav-item"
                                        >
                                            <Flex align="center" gap="3">
                                                <Icon width="18" height="18" />
                                                <Text
                                                    size="3"
                                                    weight={active ? 'bold' : 'regular'}
                                                    style={{ color: active ? 'var(--accent-11)' : 'inherit' }}
                                                >
                                                    {tab.label}
                                                </Text>
                                            </Flex>
                                        </Box>
                                    </Link>
                                );
                            })}
                        </Flex>
                    </Box>

                    {/* Main Content Panel */}
                    <Box className="dashboard-main-panel" style={{ flex: 1, minWidth: 0, padding: '24px', display: 'flex', justifyContent: 'flex-start' }}>
                        <Box style={{ width: '100%', maxWidth: '100%' }}>
                            {children}
                        </Box>
                    </Box>
                </Flex>
            </Card>
        </Container>
    );
}
