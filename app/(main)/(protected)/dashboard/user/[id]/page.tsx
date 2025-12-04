import { notFound } from "next/navigation";
import { getUserProfile, getPostsByAuthor, getCommentsByAuthor } from "@/lib/db";
import UserProfile from "@/lib/components/UserProfile";
import UserPosts from "@/lib/components/UserPosts";
import UserComments from "@/lib/components/UserComments";

interface UserPageProps {
    params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: UserPageProps) {
    const { id } = await params;

    // Fetch user profile from database
    const userProfile = await getUserProfile(id);

    if (!userProfile) {
        notFound();
    }

    // Fetch user's posts and comments in parallel
    const [posts, comments] = await Promise.all([
        getPostsByAuthor(id),
        getCommentsByAuthor(id),
    ]);

    // Transform database profile to match Stack User interface expected by UserProfile component
    const user = {
        id: userProfile.id,
        displayName: userProfile.name,
        profileImageUrl: userProfile.profileImageUrl,
        primaryEmail: userProfile.primaryEmail,
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <UserProfile user={user as any} />
            <UserPosts posts={posts} />
            <UserComments comments={comments} />
        </div>
    );
}
