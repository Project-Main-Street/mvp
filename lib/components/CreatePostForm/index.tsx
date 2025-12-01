// A Create Post Form with inputs
// for title and content, and a submit button.

'use client';

import { Form } from "radix-ui";
import { Button, TextArea, TextField } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";

export default function CreatePostForm() {
    // get the user from stack auth, and the id from the user
    const user = useUser();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!user) return;

        const formData = new FormData(e.currentTarget);

        try {
            const response = await fetch("/api/post", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("Error creating post:", error);
                return;
            }

            router.push("/dashboard");
        } catch (error) {
            console.error("Failed to submit form:", error);
        }
    };

    return (
        <Form.Root onSubmit={handleSubmit}>
            <Form.Field name="title" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <Form.Label>
                        Title
                    </Form.Label>
                    <Form.Message match="valueMissing">
                        Please enter a title
                    </Form.Message>
                </div>
                <Form.Control asChild>
                    <TextField.Root placeholder="Title" required />
                </Form.Control>
            </Form.Field>

            <Form.Field name="content" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <Form.Label>
                        Content
                    </Form.Label>
                    <Form.Message match="valueMissing">
                        Please enter content
                    </Form.Message>
                </div>
                <Form.Control asChild>
                    <TextArea placeholder="Content" required rows={6} />
                </Form.Control>
            </Form.Field>

            <Form.Submit asChild>
                <Button type="submit" variant="solid">
                    Submit
                </Button>
            </Form.Submit>
        </Form.Root>
    );
}