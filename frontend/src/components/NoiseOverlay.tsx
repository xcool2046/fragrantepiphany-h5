import React from 'react'

const NoiseOverlay: React.FC = () => {
  return (
    <>
      <svg className="hidden">
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.6"
            stitchTiles="stitch"
            numOctaves="3"
          />
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 1 0"
          />
        </filter>
      </svg>
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-overlay"
        style={{
          filter: 'url(#noiseFilter)',
          transform: 'translateZ(0)', // Force GPU acceleration
        }}
      />
      {/* Fallback/Alternative technique using a generated noise pattern if filter support is inconsistent, 
          but SVG filter is usually quite performant for this specific look. 
          To make it "alive", we can slightly animate the baseFrequency or position via CSS, 
          but static grain is often enough for the "film" look without distracting motion.
      */}
    </>
  )
}

export default NoiseOverlay