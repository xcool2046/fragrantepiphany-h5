import React, { useMemo } from 'react'

const Sparkles: React.FC = () => {
  const stars = useMemo(() => (
    Array.from({ length: 10 }).map((_, idx) => ({
      id: idx,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 10 + 8}px`,
      delay: `${Math.random() * 3}s`,
      duration: `${Math.random() * 3 + 3}s`,
    }))
  ), [])

  return (
    <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute block text-primary/40 hero-star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </span>
      ))}
    </div>
  )
}

export default Sparkles
