import { Post } from "@/lib/db";
import { Card, Text, Link } from "@radix-ui/themes";

interface UserCommentsProps {
    comments: Post[];
}

export default function UserComments({ comments }: UserCommentsProps) {
    if (comments.length === 0) {
        return (
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Comments</h2>
                <p className="text-gray-500">No Comments.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Recent Comments</h2>
            <div className="space-y-3">
                {comments.map((comment) => (
                    <Card key={comment.id}>
                        <Text as="p" size="1" color="gray" mb="1">
                            {comment.voteScore} {comment.voteScore === 1 ? 'point' : 'points'} |
                            {' '}{new Date(comment.createdAt).toLocaleDateString()}
                        </Text>
                        <Text as="p" size="2" mb="2">
                            {comment.content.length > 200
                                ? comment.content.substring(0, 200) + "..."
                                : comment.content}
                        </Text>
                        {comment.parent && (
                            <Link href={`/dashboard/post/${comment.parent}`} color="blue" size="2">
                                View in context →
                            </Link>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}
