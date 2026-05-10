import { Donut } from '@/components/charts/Donut'
import { Card } from '@/components/ui/Card'
import React from 'react'

// type Totals = {
//     totals: {
//         totalContribs: number
//     }
//     contribs: number
//     squads: number
//     streak: number
// }

interface ContributionOverviewProps {
  saved: number;
  target: number;
  contribs: number;
  squads: number;
  streak: number;
  className?: string
}
const ContributionsSection = ({ saved, target, contribs, squads, streak, className  }: ContributionOverviewProps) => {
    const details = [
        {
            text: "Contributions",
            number: contribs
        },
         {
            text: "Squads",
            number: squads
        },
         {
            text: "Streaks",
            number: streak
        }
    ]
    return (
            <Card>
                <div className="text-sm font-medium mb-2">Success rate</div>
                <div className='flex h-full items-center'>
                <Donut
                    value={saved}
                    total={Math.max(target, 150)}
                    label="Successful contributions"
                />
                <div className='space-y-2 w-full h-full'>
                    <p className="text-xl font-semibold">₦{saved.toLocaleString()}/ ₦{target.toLocaleString()} total goals</p>
                    <div className='flex justify-between items-stretch w-full gap-4'>
                        {
                            details.map((d, idx) => (
                                <div key={idx} className='flex flex-col flex-1 justify-center items-center border rounded-lg w-full h-full py-7'>
                                    <p className='font-bold'>{d.number}</p>
                                    <p>{d.text}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>
                </div>
            </Card>
    )
}

export default ContributionsSection