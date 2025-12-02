'use client';

import { Form } from "radix-ui";
import { Button, TextArea } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";
import { useRef } from "react";

interface CreateCommentFormProps {
    postId: number;
}

export default function CreateCommentForm({ postId }: CreateCommentFormProps) {
    const user = useUser();
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!user) return;

        const formData = new FormData(e.currentTarget);
        formData.append("postId", postId.toString());

        try {
            const response = await fetch("/api/comment", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("Error creating comment:", error);
                return;
            }

            // Reset form and refresh page to show new comment
            formRef.current?.reset();
            router.refresh();
        } catch (error) {
            console.error("Failed to submit comment:", error);
        }
    };

    return (
        <Form.Root ref={formRef} onSubmit={handleSubmit}>
            <Form.Field name="content" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <Form.Label>
                        Add a comment
                    </Form.Label>
                    <Form.Message match="valueMissing">
                        Please enter a comment
                    </Form.Message>
                </div>
                <Form.Control asChild>
                    <TextArea placeholder="Write your comment..." required rows={3} />
                </Form.Control>
            </Form.Field>

            <Form.Submit asChild>
                <Button type="submit" variant="solid">
                    Submit Comment
                </Button>
            </Form.Submit>
        </Form.Root>
    );
}