import React from 'react';
import { Card } from '@/components/ui/Card';

interface ContributionOverviewProps {
  saved: number;
  target: number;
  contribs: number;
  squads: number;
  streak: number;
}

const ContributionOverview: React.FC<ContributionOverviewProps> = ({ saved, target, contribs, squads, streak }) => (
  <Card className="flex flex-col md:flex-row items-center justify-between p-4 mb-4">
    <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
      <div className="text-2xl font-bold">₦{saved.toLocaleString()}</div>
      <div className="text-sm text-gray-500">₦{saved.toLocaleString()} / ₦{target.toLocaleString()} total goals</div>
    </div>
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <span className="font-semibold text-lg">{contribs}</span>
        <span className="text-xs text-gray-500">Contribs</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="font-semibold text-lg">{squads}</span>
        <span className="text-xs text-gray-500">Squads</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="font-semibold text-lg">{streak}</span>
        <span className="text-xs text-gray-500">Streak 🔥</span>
      </div>
    </div>
  </Card>
);

export default ContributionOverview;
