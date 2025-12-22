import DashboardLayout from "@/lib/components/DashboardLayout";
import { Section } from "@radix-ui/themes";
import { getPosts } from "@/lib/db";

export default async function DashboardRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Prefetch posts that will be needed by dashboard subroutes
    // Using React cache(), this call will be memoized and reused by child routes
    await getPosts();

    return (
        <Section>
            <DashboardLayout>
                {children}
            </DashboardLayout>
        </Section>
    );
}
