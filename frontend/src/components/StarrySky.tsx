import React, { useMemo } from 'react'

interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
  isGold: boolean
}

const StarrySky: React.FC = () => {
  const stars = useMemo(() => {
    const starCount = 28
    const generated: Star[] = []

    for (let i = 0; i < starCount; i++) {
      generated.push({
        id: i,
        x: Math.random() * 100, // percentage
        y: 65 + Math.random() * 35, // only in bottom 35% (65-100%)
        size: 1 + Math.random() * 2, // 1-3px
        delay: Math.random() * 6, // 0-6s
        duration: 3 + Math.random() * 3, // 3-6s
        isGold: Math.random() > 0.2, // 80% gold, 20% white
      })
    }

    return generated
  }, [])

  return (
    <>
      {/* Gradient Background - Warm Golden Depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            to bottom,
            #F7F2ED 0%,
            #F7F2ED 45%,
            #EFE4D8 58%,
            #E8D5C9 68%,
            #D4B591 76%,
            #C4A583 82%,
            #8B6F47 88%,
            #5A4A35 93%,
            #3A2F23 97%,
            #1F1812 100%
          )`,
        }}
      />

      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className={`star-point ${star.isGold ? 'star-gold' : 'star-white'}`}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `starTwinkle ${star.duration}s ease-in-out ${star.delay}s infinite, starFloat ${star.duration + 2}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}

      {/* Bottom Planet */}
      <div
        className="absolute bottom-0 left-1/2 pointer-events-none"
        style={{
          width: 'min(70vw, 450px)',
          height: 'min(35vw, 225px)',
          transform: 'translate(-50%, 0)',
          animation: 'planetBreathe 12s ease-in-out infinite',
        }}
      >
        {/* Planet Circle - Amber/Bronze Tone */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            width: '100%',
            height: '200%',
            borderRadius: '50%',
            background: `radial-gradient(
              circle at center top,
              rgba(139, 111, 71, 0.85) 0%,
              rgba(90, 74, 53, 0.7) 30%,
              rgba(58, 47, 35, 0.5) 60%,
              transparent 100%
            )`,
          }}
        />

        {/* Warm Gold Glow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            width: '110%',
            height: '220%',
            borderRadius: '50%',
            background: `radial-gradient(
              circle at center top,
              rgba(212, 163, 115, 0.35) 0%,
              rgba(212, 163, 115, 0.15) 40%,
              transparent 70%
            )`,
            filter: 'blur(20px)',
          }}
        />

        {/* Noise Texture */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.15,
            mixBlendMode: 'overlay',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
    </>
  )
}

export default StarrySky
