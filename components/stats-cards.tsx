'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, MessageSquare, CheckCircle2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface StatsCardsProps {
  totalCampaigns: number
  totalResponses: number
  resolvedCount: number
  needsAttention: number
}

interface StatItem {
  title: string
  value: number
  icon: any
  color: string
  bgColor: string
  href?: string
}

export function StatsCards({ totalCampaigns, totalResponses, resolvedCount, needsAttention }: StatsCardsProps) {
  const resolutionRate = totalResponses > 0 ? Math.round((resolvedCount / totalResponses) * 100) : 0

  const stats: StatItem[] = [
    {
      title: 'Total Campaigns',
      value: totalCampaigns,
      icon: MessageSquare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Responses',
      value: totalResponses,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Resolved',
      value: resolvedCount,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Needs Attention',
      value: needsAttention,
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      href: needsAttention > 0 ? '/issues' : undefined,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon
        const cardContent = (
          <Card className={`hover:shadow-lg transition-all duration-300 dark:hover:border-primary/40 ${stat.href ? 'cursor-pointer' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.title === 'Resolved' && totalResponses > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {resolutionRate}% resolution rate
                </p>
              )}
              {stat.title === 'Needs Attention' && stat.value > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Click to review →
                </p>
              )}
            </CardContent>
          </Card>
        )
        
        return stat.href ? (
          <Link key={stat.title} href={stat.href}>
            {cardContent}
          </Link>
        ) : (
          <div key={stat.title}>
            {cardContent}
          </div>
        )
      })}
    </div>
  )
}

