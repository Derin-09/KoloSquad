import React from 'react';
import { Card } from '@/components/ui/Card';
import Image from 'next/image';

interface MemberProfile {
    id: string;
    avatar_url?: string;
    full_name?: string;
}

interface SquadCardProps {
    full_name: string;
    due: string;
    saved: number;
    target: number;
    members: MemberProfile[];
    percent: number;
    active?: boolean;
}

const SquadCard: React.FC<SquadCardProps> = ({ full_name, due, saved, target, members, percent, active }) => {
    return (
        <Card className="mb-4 p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-lg">{full_name}</div>
                {active && <span className="text-xs bg-green-700 text-white px-2 py-1 rounded">ACTIVE</span>}
            </div>
            <div className="flex items-center justify-between text-xs mb-2">
                <span className="bg-gray-900 px-2 py-1 rounded">Due {due}</span>
                <span>{percent}% Saved</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded mb-2">
                <div className="h-2 bg-[color:var(--accent)] rounded" style={{ width: `${percent}%` }} />
            </div>
                <div className="flex items-center text-xs">
                    {members.map((m, i) =>
                        m?.avatar_url ? (
                            <span
                                key={m.id}
                                style={{ marginRight: i === 0 ? 0 : -12, zIndex: members.length - i }}
                                className="inline-block"
                            >
                                <Image
                                    src={m.avatar_url}
                                    alt={m.full_name || 'User'}
                                    width={28}
                                    height={28}
                                    className="rounded-full object-cover border-2 border-white shadow"
                                    title={m.full_name}
                                />
                            </span>
                        ) : (
                            <span
                                key={m?.id || i}
                                style={{ marginLeft: i === 0 ? 0 : -12, zIndex: members.length - i }}
                                className="inline-block bg-gray-300 rounded-full px-2 py-1 border-2 border-white shadow"
                            >
                                {m?.full_name?.[0] || 'U'}
                            </span>
                        )
                    )}
                </div>
            <div className="flex justify-between text-xs mt-2">
                <span>₦{saved.toLocaleString()} / ₦{target.toLocaleString()}</span>
            </div>
        </Card>
    );
};

export default SquadCard;
