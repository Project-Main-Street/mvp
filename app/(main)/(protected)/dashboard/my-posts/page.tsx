import { getPostsByAuthor } from "@/lib/db";
import { stackServerApp } from "@/stack/server";
import MyPostsPageClient from "./MyPostsPageClient";

export default async function MyPostsPage() {
    const user = await stackServerApp.getUser({ or: "redirect" });
    const posts = await getPostsByAuthor(user.id);

    return (
        <MyPostsPageClient initialPosts={posts} userId={user.id} />
    );
}
