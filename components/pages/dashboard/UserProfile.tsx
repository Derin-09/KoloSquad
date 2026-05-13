'use client'
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/auth-store';

interface UserProfileProps {
    username: string;
    level: string;
    progress: number;
}

const UserProfile: React.FC<UserProfileProps> = ({ username, level, progress }) => {
      const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
      const user = useAuthStore((state) => state.user);
    //   const fetchUser = useAuthStore((state) => state.fetchUser);

    // useEffect(() => {
    //     void fetchUser();
    //   }, [fetchUser]);

      useEffect(() => {
        setAvatarUrl(user?.user_metadata?.avatar_url ?? null);
      }, [user]);
    return (
    <Card className="flex items-center gap-4 p-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold overflow-hidden">
            {/* Avatar placeholder */}
            {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="User avatar"
                  // fill
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-accent" />
              )}
        </div>
        <div className="flex-1">
            <div className="flex items-center justify-between">
                <div className="font-semibold text-lg">{username}</div>
                <span className="text-xs font-medium">{level}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-full bg-gray-300 rounded h-2 overflow-hidden">
                    <div className="bg-accent h-2 rounded" style={{ width: `${progress}%` }} />
                </div>
            </div>
        </div>
    </Card>
)};

export default UserProfile;
