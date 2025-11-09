'use client'

interface SentimentRingProps {
  positive: number
  neutral: number
  negative: number
  size?: number
}

export function SentimentRing({ positive, neutral, negative, size = 60 }: SentimentRingProps) {
  const total = positive + neutral + negative
  if (total === 0) {
    return (
      <div
        className="rounded-full border-4 border-muted"
        style={{ width: size, height: size }}
      />
    )
  }

  const positivePercent = (positive / total) * 100
  const neutralPercent = (neutral / total) * 100
  const negativePercent = (negative / total) * 100

  const radius = size / 2 - 6
  const circumference = 2 * Math.PI * radius
  const strokeWidth = 6

  const positiveDash = (positivePercent / 100) * circumference
  const neutralDash = (neutralPercent / 100) * circumference
  const negativeDash = (negativePercent / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted opacity-20"
        />
        {positivePercent > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={`${positiveDash} ${circumference}`}
            strokeDashoffset={0}
            className="text-green-500"
            strokeLinecap="round"
          />
        )}
        {neutralPercent > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={`${neutralDash} ${circumference}`}
            strokeDashoffset={-positiveDash}
            className="text-gray-400"
            strokeLinecap="round"
          />
        )}
        {negativePercent > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={`${negativeDash} ${circumference}`}
            strokeDashoffset={-(positiveDash + neutralDash)}
            className="text-red-500"
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium">{total}</span>
      </div>
    </div>
  )
}

