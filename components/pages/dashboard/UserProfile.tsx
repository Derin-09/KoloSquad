'use client'
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase/client';

interface UserProfileProps {
    username: string;
    level: string;
    progress: number;
}

const UserProfile: React.FC<UserProfileProps> = ({ username, level, progress }) => {
      const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    useEffect(() => {
        const getUserAvatar = async () => {
          const { data } = await supabase.auth.getUser();
          const user = data.user;
          if (user?.user_metadata?.avatar_url) {
            setAvatarUrl(user.user_metadata.avatar_url);
          }
        };
    
        getUserAvatar();
    
        const { data: listener } = supabase.auth.onAuthStateChange(() => {
          getUserAvatar();
        });
    
        return () => {
          listener?.subscription.unsubscribe();
        };
      }, []);
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
                <div className="w-full h-full bg-[color:var(--accent)]" />
              )}
        </div>
        <div className="flex-1">
            <div className="flex items-center justify-between">
                <div className="font-semibold text-lg">{username}</div>
                <span className="text-xs font-medium">{level}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-full bg-gray-300 rounded h-2 overflow-hidden">
                    <div className="bg-[color:var(--accent)] h-2 rounded" style={{ width: `${progress}%` }} />
                </div>
            </div>
        </div>
    </Card>
)};

export default UserProfile;
