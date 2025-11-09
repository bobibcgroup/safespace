'use client'

import { useDrop } from 'react-dnd'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DroppableColumnProps {
  statusId: string
  statusLabel: string
  children: React.ReactNode
  onDrop: (responseId: string, newStatus: string) => void
}

export function DroppableColumn({ statusId, statusLabel, children, onDrop }: DroppableColumnProps) {
  const [{ isOver }, drop] = useDrop({
    accept: 'response',
    drop: (item: { id: string; status: string }) => {
      if (item.status !== statusId) {
        onDrop(item.id, statusId)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  return (
    <div ref={drop as any} className={`h-full ${isOver ? 'bg-primary/10' : ''}`}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">{statusLabel}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

