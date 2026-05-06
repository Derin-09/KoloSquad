import React, { useMemo } from 'react';
import SquadCard from './SquadCard';
import { useUserProfiles } from '@/lib/useUserProfiles';

interface SquadListProps {
    squads: Array<{
        full_name: string;
        due: string;
        saved: number;
        target: number;
        members: string[]; // user ids
        percent: number;
        active?: boolean;
    }>;
}

const SquadList: React.FC<SquadListProps> = ({ squads }) => {
    // Collect all unique member IDs from all squads, memoized to avoid infinite fetches
    const allMemberIds = useMemo(
        () => Array.from(new Set(squads.flatMap(s => s.members))),
        [squads]
    );
    const profiles = useUserProfiles(allMemberIds);

    // Map member IDs to profile objects

    const getMemberProfiles = (ids: string[]) =>
        ids
            .map(id => profiles.find(p => p.id === id))
            .filter((p): p is NonNullable<typeof p> => !!p);


    return (
            <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-[color:var(--accent)] scrollbar-track-transparent">
                {squads.slice(0, 5).map((squad, idx) => (
                    <SquadCard key={idx} {...squad} members={getMemberProfiles(squad.members)} />
                ))}
            </div>
)};

export default SquadList;
