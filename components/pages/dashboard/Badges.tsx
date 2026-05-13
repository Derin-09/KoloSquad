import React, { useEffect, useMemo } from 'react'
import { Card } from '../../ui/Card'
import { Badge, Flame, Medal, Star, Users2, Zap } from 'lucide-react'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useAuthStore } from '@/stores/auth-store'

const badgeDetails = [
  {
    text: 'EARLY BIRD',
    icon: Badge
  },
  {
    text: `7 DAY STREAK`,
    icon: Flame
  },
  {
    text: 'TEAM PLAYER',
    icon: Users2
  },
  {
    text: 'CENTURION',
    icon: Medal
  },
  {
    text: 'TOP SAVER',
    icon: Star
  },
  {
    text: 'FLASH SAVE',
    icon: Zap
  },
]

const normalizeBadgeLabel = (value: string) =>
  value.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ')

const Badges = () => {
  const fetchBadges = useDashboardStore((state) => state.fetchBadges)
  const badges = useDashboardStore((state) => state.badgesData)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (!user?.id) return;
    fetchBadges(user.id);
  }, [user?.id, fetchBadges]);

  const includedBadgeTypes = useMemo(() => {
    return new Set(badges.map((badge) => normalizeBadgeLabel(badge.type)))
  }, [badges])

  return (
    <div>
      <Card className='flex flex-col gap-2 h-full'>
        <div className="text-sm font-medium mb-2">Your Badges</div>
        <div className='grid grid-cols-3 gap-4'>
          {
            badgeDetails.map((b, idx) => {
              const Icon = b.icon
              const included = includedBadgeTypes.has(normalizeBadgeLabel(b.text))

              return (
                <div key={idx} className='flex flex-col items-center gap-2'>
                  <div className={`w-8 h-8 rounded-full flex justify-center items-center transition-colors ${included ? 'bg-purple-400 text-white' : 'bg-gray-100 text-purple-300'}`}>
                    <Icon size={16} />
                  </div>
                  <p className={`text-sm font-bold transition-colors ${included ? 'text-purple-400' : 'text-purple-300'}`}>{b.text}</p>
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