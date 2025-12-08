import { User } from "@stackframe/stack";
import Image from "next/image";

interface UserProfileProps {
    user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
    return (
        <div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            {user.profileImageUrl && (
                <Image
                    src={user.profileImageUrl}
                    alt={user.displayName || "User"}
                    width={80}
                    height={80}
                    className="rounded-full"
                />
            )}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    {user.displayName || "Anonymous User"}
                </h1>
                {user.primaryEmail && (
                    <p className="text-gray-600 mt-1">{user.primaryEmail}</p>
                )}
            </div>
        </div>
    );
}
