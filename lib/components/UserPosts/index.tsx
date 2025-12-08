import { Post } from "@/lib/db";
import PostPreviewCard from "../PostsList/PostPreviewCard";

interface UserPostsProps {
    posts: Post[];
}

export default function UserPosts({ posts }: UserPostsProps) {
    if (posts.length === 0) {
        return (
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Posts</h2>
                <p className="text-gray-500">No Posts.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Posts</h2>
            <div className="space-y-3">
                {posts.map((post) => (
                    <PostPreviewCard
                        key={post.id}
                        id={post.id}
                        title={post.title}
                        content={post.content}
                        author={post.author}
                        authorName={post.authorName}
                        authorUsername={post.authorUsername}
                        voteScore={post.voteScore}
                        commentCount={post.commentCount}
                    />
                ))}
            </div>
        </div>
    );
}
