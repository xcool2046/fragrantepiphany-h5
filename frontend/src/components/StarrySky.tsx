import React from 'react'

interface StarSpec {
  id: number
  x: number // percentage 0-100
  y: number // percentage 0-100
  size: number // pixels
  opacity: number
  animationDelay: string
  animationDuration: string
  rotation: number
}

const StarrySky: React.FC = () => {
  // Generate random stars
  const stars = React.useMemo(() => {
    const count = 8 // Extremely minimal count for maximum premium feel
    const newStars: StarSpec[] = []
    
    // Helper to get random number in range
    const random = (min: number, max: number) => Math.random() * (max - min) + min

    for (let i = 0; i < count; i++) {
      newStars.push({
        id: i,
        x: random(0, 100),
        y: random(0, 100),
        size: random(12, 24), // Larger size for flares
        opacity: random(0.5, 0.9),
        animationDelay: `${random(0, 20)}s`, // Larger range for better distribution
        animationDuration: `${random(3, 8)}s`, // Slower animation with wider range
        rotation: random(0, 45),
      })
    }
    return newStars
  }, [])

  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            to bottom,
            #F7F2ED 0%,
            #F5EFE9 40%,
            #EADBC8 100%
          )`,
        }}
      />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <style>
          {`
            @keyframes twinkle {
              0%, 100% { opacity: 0.4; transform: scale(0.8); }
              50% { opacity: 1; transform: scale(1.1); }
            }
            .star-premium {
              animation-name: twinkle;
              animation-timing-function: ease-in-out;
              animation-iteration-count: infinite;
            }
          `}
        </style>
        
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute star-premium"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: star.animationDelay,
              animationDuration: star.animationDuration,
              transform: `rotate(${star.rotation}deg)`,
            }}
          >
            {/* Premium 4-point flare shape */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-full h-full text-[#7A5A3E]"
            >
              <path
                d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
                fill="currentColor"
              />
            </svg>
          </div>
        ))}
      </div>
    </>
  )
}

export default StarrySky
