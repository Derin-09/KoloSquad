import React from 'react'
import { Card } from '../../ui/Card'
import { Badge, Flame, Medal, Star, Users2, Zap } from 'lucide-react'
import { SiFlashforge } from 'react-icons/si'

const badgeDetails = [
  {
    text: 'EARLY BIRD',
    icon: Badge,
    included: true
  },
  {
    text: `7 DAY STREAK`,
    icon: Flame,
    included: true
  },
  {
    text: 'TEAM PLAYER',
    icon: Users2,
    included: true
  },
  {
    text: 'CENTURION',
    icon: Medal,
    included: false
  },
  {
    text: 'TOP SAVER',
    icon: Star,
    included: false
  },
  {
    text: 'FLASH SAVE',
    icon: Zap,
    included: false
  },
]
const Badges = () => {
  return (
    <div>
      <Card className='flex flex-col gap-2 h-full'>
        <div className="text-sm font-medium mb-2">Your Badges</div>
        <div className='grid grid-cols-3 gap-4'>
          {
            badgeDetails.map((b, idx) => {
              const Icon = b.icon
              return (
                <div key={idx} className='flex flex-col items-center gap-2'>
                  <div className={`w-8 h-8 rounded-full flex justify-center items-center ${b.included ? 'bg-purple-400' : 'bg-gray-400'}`}>
                    <Icon />
                  </div>
                  <p className={`text-sm font-bold ${b.included ? 'text-purple-400' : 'text-gray-400'}`}>{b.text}</p>
                </div>
              )
            })
          }
        </div>
      </Card>
    </div>
  )
}

export default Badges