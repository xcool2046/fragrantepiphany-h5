import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type ClickBubble = {
  id: number
  x: number
  y: number
  color: string
}

const COLORS = [
  'rgba(212, 163, 115, 0.4)', // Gold (Lower opacity)
  'rgba(196, 155, 163, 0.4)', // Pink (Lower opacity)
  'rgba(232, 220, 196, 0.4)', // Champagne (New)
]

export default function ClickBubbles() {
  const [bubbles, setBubbles] = useState<ClickBubble[]>([])

  const handleClick = useCallback((e: MouseEvent) => {
    // Ignore clicks on interactive elements
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a') || target.closest('input')) {
      return
    }

    const newBubble = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    }

    setBubbles(prev => [...prev, newBubble])

    // Cleanup
    setTimeout(() => {
      setBubbles(prev => prev.filter(b => b.id !== newBubble.id))
    }, 2000)
  }, [])

  useEffect(() => {
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [handleClick])

  return (
    <div className="fixed inset-0 pointer-events-none z-[50] overflow-hidden">
      <AnimatePresence>
        {bubbles.map(bubble => (
          <motion.div
            key={bubble.id}
            initial={{ 
              opacity: 0, 
              scale: 0.5, 
              x: bubble.x - 40, // Center the 80px bubble
              y: bubble.y - 40 
            }}
            animate={{ 
              opacity: [0, 0.6, 0],
              scale: [0.5, 1.5, 2], // Max size ~160px
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 1.2, // Slightly faster
              ease: "easeOut"
            }}
            className="absolute w-[80px] h-[80px] rounded-full blur-[20px]"
            style={{
              background: bubble.color,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
