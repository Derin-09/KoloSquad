import { Card } from '@/components/ui/Card'
import { ChevronLeftCircle, ChevronRightCircle } from 'lucide-react'
import React from 'react'

const challengesDetails = [
  {
    text: 'Save 3 weeks in a row',
    xp: 300,
  },
  {
    text: `Contribute before Friday`,
    xp: 200,
  },
  {
    text: 'Hit monthly goal',
    xp: 1000,
  },
]

const WeeklyChallenges = () => {
  return (
    <div className='flex flex-col gap-4'>
        <p className='text-lg font-semibold'>Weekly Challenges</p>

        <div className='flex flex-col gap-2'>
            {
                challengesDetails.map((c, idx) => (
                    <Card className='rounded-2xl p-6 border border-gray-400 flex justify-between items-center'>
                        <div className='flex flex-col '>
                            <p>{c.text}</p>
                            <p className='text-sm text-gray-400'>{c.xp}XP</p>
                        </div>
                        <ChevronRightCircle/>
                    </Card>
                ))
            }
        </div>
    </div>
  )
}

export default WeeklyChallenges