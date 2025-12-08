// app/(protected)/layout.tsx
import { stackServerApp } from "@/stack/server";
import { getProfile } from "@/lib/db";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

interface ProtectedLayoutProps {
    children: ReactNode;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
    const user = await stackServerApp.getUser({ or: "redirect" });

    // Check if user has completed onboarding using Stack Auth metadata
    const isOnboarded = user.serverMetadata?.onboarded === true;

    // If user hasn't completed onboarding, redirect to onboarding page
    if (!isOnboarded) {
        redirect("/onboard");
    }

    return (
        <>
            {children}
        </>
    );
}
