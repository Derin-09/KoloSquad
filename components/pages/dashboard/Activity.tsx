import { Card } from '@/components/ui/Card'
import { Flame, UserPlus } from 'lucide-react'
import React from 'react'
import { SiMoneygram } from 'react-icons/si'

const activityDetails = [
    {
        activity: 'Sarah contributed ₦100k',
        time: '5 hours ago',
        icon: SiMoneygram
    },
    {
        activity: `David joined Tech squad`,
        time: '7 hours ago',
        icon: UserPlus
    },
    {
        activity: 'Badge unlocked: 7 Day streak',
        time: '12 hours ago',
        icon: Flame
    },
]

const Activity = () => {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-semibold">Activity</div>
            </div>
            <Card>

                {
                    activityDetails.map((a, idx) => {
                        const Icon = a.icon
                        return (
                            <div key={idx} className='flex items-center gap-3 py-4 border-b'>
                                <div className={`w-8 h-8 rounded-full flex justify-center items-center ${a.activity.includes('Badges') ? 'bg-purple-400' : 'bg-gray-400'}`}>
                                    <Icon size={15}/>
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <p className=''>{a.activity}</p>
                                    <p className='text-sm text-gray-400'>{a.time}</p>
                                </div>
                            </div>
                        )
                    })
                }
            </Card>
        </div>
    )
}

export default Activity