'use client'

import { useDrag } from 'react-dnd'
import { Card, CardContent } from '@/components/ui/card'

interface DraggableResponseProps {
  response: any
  children: React.ReactNode
  onClick?: () => void
}

export function DraggableResponse({ response, children, onClick }: DraggableResponseProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'response',
    item: { id: response.id, status: response.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  return (
    <div
      ref={drag as any}
      onClick={onClick}
      className={`cursor-move ${isDragging ? 'opacity-50' : ''}`}
    >
      {children}
    </div>
  )
}

