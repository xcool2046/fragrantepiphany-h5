import React, { useEffect, useState } from 'react'

interface Ripple {
  id: number
  x: number
  y: number
  startTime: number
}

const RippleEffect: React.FC = () => {
  const [ripples, setRipples] = useState<Ripple[]>([])

  useEffect(() => {
    const handleInteraction = (e: MouseEvent | TouchEvent) => {
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX
      const y = 'touches' in e ? e.touches[0].clientY : e.clientY

      // Check if click is on interactive elements
      const target = e.target as HTMLElement
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea')
      ) {
        return
      }

      const newRipple: Ripple = {
        id: Date.now(),
        x,
        y,
        startTime: Date.now(),
      }

      setRipples((prev) => {
        // Keep max 3 ripples
        const filtered = prev.filter((r) => Date.now() - r.startTime < 800)
        return [...filtered, newRipple].slice(-3)
      })

      // Auto remove after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
      }, 800)
    }

    document.addEventListener('mousedown', handleInteraction)
    document.addEventListener('touchstart', handleInteraction)

    return () => {
      document.removeEventListener('mousedown', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute rounded-full animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)',
            width: '0px',
            height: '0px',
            background: 'radial-gradient(circle, rgba(212, 163, 115, 0.3) 0%, rgba(212, 163, 115, 0.1) 50%, transparent 100%)',
            border: '2px solid rgba(212, 163, 115, 0.4)',
            filter: 'blur(1px)',
          }}
        />
      ))}
    </div>
  )
}

export default RippleEffect
