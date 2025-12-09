import DashboardLayout from "@/lib/components/DashboardLayout";
import { Section } from "@radix-ui/themes";

export default function DashboardRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Section>
            <DashboardLayout>
                {children}
            </DashboardLayout>
        </Section>
    );
}
