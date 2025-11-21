// app/(protected)/layout.tsx
import { stackServerApp } from "@/stack/server";
import type { ReactNode } from "react";

interface ProtectedLayoutProps {
    children: ReactNode;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
    await stackServerApp.getUser({ or: "redirect" });

    return (
        <>
            {children}
        </>
    );
}
