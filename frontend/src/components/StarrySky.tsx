import React from 'react'

type StarVariant = 'flare' | 'dot'

interface StarSpec {
  x: number
  y: number
  size: number
  variant: StarVariant
  rotate?: number
  opacity?: number
}

// Coordinates approximated from the reference image "arch" of stars
const STARS: StarSpec[] = [
  // Center top flare
  { x: 200, y: 140, size: 14, variant: 'flare', opacity: 0.9 },
  
  // Left side arch
  { x: 160, y: 145, size: 8, variant: 'flare', rotate: -10, opacity: 0.85 },
  { x: 125, y: 155, size: 7, variant: 'flare', rotate: -20, opacity: 0.8 },
  { x: 95, y: 175, size: 6, variant: 'flare', rotate: -30, opacity: 0.75 },
  { x: 70, y: 200, size: 5, variant: 'flare', rotate: -40, opacity: 0.7 },
  
  // Right side arch
  { x: 240, y: 145, size: 8, variant: 'flare', rotate: 10, opacity: 0.85 },
  { x: 275, y: 155, size: 7, variant: 'flare', rotate: 20, opacity: 0.8 },
  { x: 305, y: 175, size: 6, variant: 'flare', rotate: 30, opacity: 0.75 },
  { x: 330, y: 200, size: 5, variant: 'flare', rotate: 40, opacity: 0.7 },

  // Scattered dots/smaller stars to fill the sky
  { x: 180, y: 130, size: 2, variant: 'dot', opacity: 0.6 },
  { x: 220, y: 130, size: 2, variant: 'dot', opacity: 0.6 },
  { x: 140, y: 140, size: 2, variant: 'dot', opacity: 0.5 },
  { x: 260, y: 140, size: 2, variant: 'dot', opacity: 0.5 },
  
  { x: 50, y: 180, size: 3, variant: 'dot', opacity: 0.4 },
  { x: 350, y: 180, size: 3, variant: 'dot', opacity: 0.4 },
  
  { x: 100, y: 120, size: 4, variant: 'flare', opacity: 0.3 }, // Faint background flare
  { x: 300, y: 120, size: 4, variant: 'flare', opacity: 0.3 }, // Faint background flare
]

const PlanetScene: React.FC = () => {
  return (
    <svg
      viewBox="0 0 400 340"
      className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 pointer-events-none w-[300vw] md:w-[min(150vw,1400px)] h-[140vw] md:h-[min(110vw,800px)]"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden
      role="presentation"
    >
      <defs>
        {/*
          Engraving Filter:
          1. Generate high-frequency noise (turbulence)
          2. Use color matrix to threshold it into black/white dots (stipple effect)
          3. Composite with the base shape
        */}
        <filter id="engraving" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.2"
            numOctaves="3"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 18 -9"
            result="contrastNoise"
          />
          <feComposite in="SourceGraphic" in2="contrastNoise" operator="in" />
        </filter>

        {/* Paper texture for the planet body */}
        <filter id="paperTexture" x="0%" y="0%" width="100%" height="100%">
           <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
           <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.4 0" in="noise" result="coloredNoise" />
           <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite" />
           <feBlend mode="multiply" in="composite" in2="SourceGraphic" />
        </filter>

        {/* Gradient for the planet sphere (Sepia tones) */}
        <radialGradient id="planetGradient" cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#E8DCC8" /> {/* Highlight */}
          <stop offset="40%" stopColor="#C8B090" /> {/* Midtone */}
          <stop offset="100%" stopColor="#8A6A4B" /> {/* Shadow */}
        </radialGradient>
        
        {/* Shadow overlay to give volume */}
        <radialGradient id="planetShadow" cx="50%" cy="0%" r="90%">
             <stop offset="50%" stopColor="transparent" stopOpacity="0" />
             <stop offset="100%" stopColor="#4A3B2A" stopOpacity="0.6" />
        </radialGradient>

        {/* Edge fade gradient for transparency effect */}
        <radialGradient id="planetEdgeFade" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="60%" stopColor="white" stopOpacity="0.8" />
          <stop offset="85%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>

        {/* Mask to apply the fade effect */}
        <mask id="planetFadeMask">
          <path
            d="M 60 280 A 160 140 0 0 1 340 280 L 340 340 L 60 340 Z"
            fill="url(#planetEdgeFade)"
          />
        </mask>

      </defs>

      {/* --- Planet Group --- */}
      <g transform="translate(0, 0)">
        {/* Main Planet Body */}
        <path
          d="M 60 280 A 160 140 0 0 1 340 280 L 340 340 L 60 340 Z"
          fill="url(#planetGradient)"
          mask="url(#planetFadeMask)"
          opacity="0.75"
        />
        
        {/* Texture Overlay (Stippling/Engraving) */}
        <path
          d="M 60 280 A 160 140 0 0 1 340 280 L 340 340 L 60 340 Z"
          fill="#5C4033"
          filter="url(#engraving)"
          opacity="0.3"
          mask="url(#planetFadeMask)"
        />

        {/* Inner Shadow for Volume */}
         <path
          d="M 60 280 A 160 140 0 0 1 340 280 L 340 340 L 60 340 Z"
          fill="url(#planetShadow)"
          style={{ mixBlendMode: 'multiply' }}
          mask="url(#planetFadeMask)"
        />
        
        {/* Outline/Stroke */}
        <path
          d="M 60 280 A 160 140 0 0 1 340 280"
          fill="none"
          stroke="#5C4033"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="6 3"
          opacity="0.3"
          mask="url(#planetFadeMask)"
        />
      </g>

      {/* --- Stars Layer --- */}
      <g id="stars-layer" fill="none" stroke="#7A5A3E" strokeLinecap="round">
        {STARS.map((star, idx) => {
          const opacity = star.opacity ?? 0.8
          if (star.variant === 'dot') {
            return (
              <circle
                key={idx}
                cx={star.x}
                cy={star.y}
                r={star.size / 2}
                fill="#7A5A3E"
                fillOpacity={opacity}
                className="star-dot-animate"
                style={{ animationDelay: `${idx * 0.1}s` }}
              />
            )
          }

          const scale = star.size / 8
          const rotate = star.rotate ?? 0
          return (
            <g
              key={idx}
              transform={`translate(${star.x} ${star.y}) rotate(${rotate}) scale(${scale})`}
              strokeOpacity={opacity}
              strokeWidth={1.5}
              className="star-flare-animate"
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              {/* 4-point star shape */}
              <path d="M0 -10 Q 0 0 10 0 Q 0 0 0 10 Q 0 0 -10 0 Q 0 0 0 -10" fill="#7A5A3E" fillOpacity={opacity} stroke="none" />
            </g>
          )
        })}
      </g>
    </svg>
  )
}

const StarrySky: React.FC = () => {
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
      <PlanetScene />
    </>
  )
}

export default StarrySky
