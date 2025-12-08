import { notFound } from "next/navigation";
import { getUserProfileByUsername, getPostsByAuthor, getCommentsByAuthor, getBusinessByUserId } from "@/lib/db";
import UserProfile from "@/lib/components/UserProfile";
import UserPosts from "@/lib/components/UserPosts";
import UserComments from "@/lib/components/UserComments";
import BusinessPreviewCard from "@/lib/components/BusinessPreviewCard";

interface UserPageProps {
    params: Promise<{ username: string }>;
}

export default async function UserPage({ params }: UserPageProps) {
    const { username } = await params;

    // Fetch user profile from database by username
    const userProfile = await getUserProfileByUsername(username);

    if (!userProfile) {
        notFound();
    }

    // Fetch user's posts, comments, and business in parallel using the user ID
    const [posts, comments, business] = await Promise.all([
        getPostsByAuthor(userProfile.id),
        getCommentsByAuthor(userProfile.id),
        getBusinessByUserId(userProfile.id),
    ]);

    // Transform database profile to match Stack User interface expected by UserProfile component
    const user = {
        id: userProfile.id,
        displayName: userProfile.name,
        profileImageUrl: userProfile.profileImageUrl,
        primaryEmail: userProfile.primaryEmail,
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
            <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <UserProfile user={user as any} />
                {business && (
                    <div>
                        <h2 className="text-xl font-semibold mb-3">Business</h2>
                        <BusinessPreviewCard business={business} />
                    </div>
                )}
                <UserPosts posts={posts} />
                <UserComments comments={comments} />
            </div>
        </div>
    );
}
