import { Card } from '@/components/ui/Card'
import React from 'react'

const leaderboardDetails = [
    {
        name: 'Derin',
        amount: 50000,
    },
    {
        name: `Sam`,
        amount: 30000,
    },
    {
        name: 'Susan',
        amount: 20000,
    },
]

const Leaderboard = () => {
    return (
        <div className='flex flex-col gap-4'>
            <p className='text-lg font-semibold'>Leaderboard</p>

            <Card className='flex flex-col gap-2'>
                {
                    leaderboardDetails.map((l, idx) => (
                        <div key={idx} className=' py-4 border-b  flex justify-between items-center'>
                            <div className='flex items-center gap-4'>
                                <p>{idx + 1}</p>
                                <div className='flex items-center gap-2'>
                                    <div className='w-8 h-8 rounded-full flex justify-center items-center bg-gray-400'>
                                        {l.name[0]}
                                    </div>
                                    <p className='text-sm text-gray-400'>{l.name}</p>
                                </div>
                            </div>
                            <p>₦{l.amount.toLocaleString()}</p>
                        </div>
                    ))
                }
            </Card>
        </div>
    )
}

export default Leaderboard