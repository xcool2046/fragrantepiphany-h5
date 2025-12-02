import React, { useMemo } from 'react'

const Sparkles: React.FC = () => {
  // 1. Background Dust (Random, subtle)
  const dust = useMemo(() => (
    Array.from({ length: 20 }).map((_, idx) => ({
      id: `dust-${idx}`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 10 + 10}s`,
      opacity: Math.random() * 0.3 + 0.1,
    }))
  ), [])

  // 2. The Galaxy (Radial Distribution)
  // Surrounding the center content
  const galaxyStars = useMemo(() => (
    Array.from({ length: 15 }).map((_, idx) => {
      // Create a radial distribution
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 40 + 30; // 30% to 70% from center
      
      const left = 50 + Math.cos(angle) * distance;
      const top = 50 + Math.sin(angle) * distance;

      return {
        id: `galaxy-${idx}`,
        top: `${Math.max(0, Math.min(100, top))}%`,
        left: `${Math.max(0, Math.min(100, left))}%`,
        size: Math.random() > 0.8 ? `${Math.random() * 12 + 10}px` : `${Math.random() * 4 + 2}px`,
        type: Math.random() > 0.7 ? 'cross' : 'dot',
        delay: `${Math.random() * 3}s`,
        duration: `${Math.random() * 4 + 3}s`,
      }
    })
  ), [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Background Dust */}
      {dust.map((p) => (
        <div
          key={p.id}
          className="absolute stardust-particle bg-[#D4A373] animate-float-slow"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}

      {/* The Galaxy */}
      {galaxyStars.map((star) => (
        <div
          key={star.id}
          className={`absolute text-[#D4A373] ${star.type === 'cross' ? 'animate-pulse-slow' : 'animate-float-slow stardust-particle'}`}
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            opacity: star.type === 'cross' ? 0.9 : 0.7,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        >
          {star.type === 'cross' ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-[0_0_10px_rgba(212,163,115,0.8)]">
              <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" />
            </svg>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export default Sparkles
