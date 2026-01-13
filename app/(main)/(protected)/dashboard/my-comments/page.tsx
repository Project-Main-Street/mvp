import { getCommentsWithParentPostInfo } from "@/lib/db";
import { stackServerApp } from "@/stack/server";
import MyCommentsPageClient from "./MyCommentsPageClient";

export default async function MyCommentsPage() {
    const user = await stackServerApp.getUser({ or: "redirect" });
    const comments = await getCommentsWithParentPostInfo(user.id);

    return (
        <MyCommentsPageClient initialComments={comments} userId={user.id} />
    );
}
