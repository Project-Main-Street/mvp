import DashboardLayout from "@/lib/components/DashboardLayout";
import { Section } from "@radix-ui/themes";
import { getPosts, getAllProducts } from "@/lib/db";

export default async function DashboardRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Prefetch key data that will be needed by dashboard subroutes
    // Using React cache(), these calls will be memoized and reused by child routes
    // This dramatically speeds up navigation between dashboard pages
    const postsPromise = getPosts();
    const productsPromise = getAllProducts();

    // Start both fetches in parallel
    await Promise.all([postsPromise, productsPromise]);

    return (
        <Section>
            <DashboardLayout>
                {children}
            </DashboardLayout>
        </Section>
    );
}
