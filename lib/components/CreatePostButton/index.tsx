'use client';

import { Button } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export default function CreatePostButton() {
    return (
        <Link href="/dashboard/post/create">
            <Button variant="outline" size="2">
                <PlusIcon width="16" height="16" />
                Create
            </Button>
        </Link>
    );
}