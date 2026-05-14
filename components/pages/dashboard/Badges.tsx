import React, { useEffect, useMemo } from 'react'
import { Card } from '../../ui/Card'
import { Badge, Flame, Medal, Star, Users2, Zap } from 'lucide-react'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useAuthStore } from '@/stores/auth-store'

const fallbackBadgeDetails = [
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

const badgeIconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  [normalizeBadgeLabel('EARLY BIRD')]: Badge,
  [normalizeBadgeLabel('7 DAY STREAK')]: Flame,
  [normalizeBadgeLabel('TEAM PLAYER')]: Users2,
  [normalizeBadgeLabel('CENTURION')]: Medal,
  [normalizeBadgeLabel('TOP SAVER')]: Star,
  [normalizeBadgeLabel('FLASH SAVE')]: Zap,
}

const badgePalette = {
  included: {
    iconBg: '#a855f7',
    iconColor: '#ffffff',
    text: '#a855f7',
  },
excluded: {
  iconBg: '#17171c',
  iconColor: '#3a3a46',
  text: '#4a4a57',
},
}

const Badges = () => {
  const fetchBadges = useDashboardStore((state) => state.fetchBadges)
  const fetchBadgesCatalog = useDashboardStore((state) => state.fetchBadgesCatalog)
  const badges = useDashboardStore((state) => state.badgesData)
  const badgesCatalog = useDashboardStore((state) => state.badgesCatalogData)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    fetchBadgesCatalog();
  }, [fetchBadgesCatalog]);

  useEffect(() => {
    if (!user?.id) return;
    fetchBadges(user.id);
  }, [user?.id, fetchBadges]);

  const includedBadgeTypes = useMemo(() => {
    return new Set(badges.map((badge) => normalizeBadgeLabel(badge.code)))
  }, [badges])

  const displayBadges = useMemo(() => {
    if (badgesCatalog.length > 0) {
      return badgesCatalog.map((catalogBadge) => ({
        code: catalogBadge.code,
        text: catalogBadge.title,
        icon: badgeIconMap[normalizeBadgeLabel(catalogBadge.code)]
          || badgeIconMap[normalizeBadgeLabel(catalogBadge.title)]
          || Badge,
      }))
    }

    return fallbackBadgeDetails.map((badge) => ({
      code: badge.text,
      text: badge.text,
      icon: badge.icon,
    }))
  }, [badgesCatalog])

  return (
    <div>
      <Card className='flex flex-col gap-2 h-full'>
        <div className="text-sm font-medium mb-2">Your Badges</div>
        <div className='grid grid-cols-3 gap-4'>
          {
            displayBadges.map((b, idx) => {
              const Icon = b.icon
              const included = includedBadgeTypes.has(normalizeBadgeLabel(b.code))
              const palette = included ? badgePalette.included : badgePalette.excluded

              return (
                <div key={idx} className='flex flex-col items-center gap-2'>
                  <div
                    className='w-8 h-8 rounded-full flex justify-center items-center transition-colors'
                    style={{ backgroundColor: palette.iconBg, color: palette.iconColor }}
                  >
                    <Icon size={16} />
                  </div>
                  <p
                    className='text-sm font-bold transition-colors text-center'
                    style={{ color: palette.text }}
                  >
                    {b.text}
                  </p>
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