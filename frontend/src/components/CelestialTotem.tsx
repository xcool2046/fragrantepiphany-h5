import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

const CelestialTotem: React.FC = () => {
  // Colors - Refined for Ethereal/Transparent look
  // Using rgba for transparency directly in the color definitions
  const planetBase = "rgba(43, 31, 22, 0.2)" // Very transparent dark brown
  const planetDark = "rgba(13, 9, 7, 0.3)" // Slightly darker bands, still transparent
  const gold = "#D4A373" // Gold for rings/details
  const ringColor = "#C29B7F" // Muted gold/bronze for rings

  // Satellites
  const satellites = useMemo(() => {
    return [
      { id: 1, r: 180, size: 3, speed: 25, delay: 0, color: "#E8D5C4" },
      { id: 2, r: 240, size: 5, speed: 40, delay: 5, color: "#D4A373" }
    ]
  }, [])

  return (
    <div className="relative w-full h-full flex justify-center items-end pointer-events-none select-none overflow-visible">
      <motion.svg
        viewBox="0 0 500 500"
        className="w-full h-full max-w-[800px]"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <defs>
          {/* Gas Giant Banding Gradient - Lighter and Transparent */}
          <linearGradient id="planetBanding" x1="0" x2="1" y1="1" y2="0">
            <stop offset="0%" stopColor={planetBase} />
            <stop offset="20%" stopColor={planetDark} />
            <stop offset="40%" stopColor={planetBase} />
            <stop offset="50%" stopColor="rgba(60, 45, 35, 0.2)" /> {/* Subtle lighter band */}
            <stop offset="60%" stopColor={planetBase} />
            <stop offset="80%" stopColor={planetDark} />
            <stop offset="100%" stopColor={planetBase} />
          </linearGradient>

          {/* Ring Gradient - Fainter */}
          <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={ringColor} stopOpacity="0.05" />
            <stop offset="50%" stopColor={gold} stopOpacity="0.3" />
            <stop offset="100%" stopColor={ringColor} stopOpacity="0.05" />
          </linearGradient>

          {/* Soft Glow */}
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform="translate(250, 350)"> {/* Centered horizontally, pushed down */}
          
          {/* --- Back Rings (Behind Planet) --- */}
          <g transform="rotate(-15)"> {/* Tilt the whole system */}
             <path
               d="M -280 0 A 280 80 0 0 1 280 0"
               fill="none"
               stroke="url(#ringGradient)"
               strokeWidth="20"
               opacity="0.3"
             />
             <path
               d="M -260 0 A 260 70 0 0 1 260 0"
               fill="none"
               stroke="url(#ringGradient)"
               strokeWidth="1.5"
               opacity="0.2"
             />
              <path
               d="M -300 0 A 300 90 0 0 1 300 0"
               fill="none"
               stroke="url(#ringGradient)"
               strokeWidth="0.5"
               opacity="0.1"
             />
          </g>

          {/* --- The Planet (Smaller & Transparent) --- */}
          {/* Radius reduced from 160 to 120 */}
          <circle cx="0" cy="0" r="120" fill="url(#planetBanding)" />
          
          {/* Inner Shadow/Atmosphere - Lighter */}
          <circle cx="0" cy="0" r="120" fill="url(#planetBanding)" opacity="0.3">
             <animate attributeName="opacity" values="0.3;0.4;0.3" dur="8s" repeatCount="indefinite" />
          </circle>
          
          {/* Rim Light (Top Edge) - Thinner */}
          <path
            d="M -110 -40 A 120 120 0 0 1 110 -40"
            fill="none"
            stroke={gold}
            strokeWidth="1"
            filter="url(#softGlow)"
            opacity="0.5"
            strokeLinecap="round"
          />

          {/* --- Front Rings (In Front of Planet) --- */}
          <g transform="rotate(-15)">
             <path
               d="M -280 0 A 280 80 0 0 0 280 0"
               fill="none"
               stroke="url(#ringGradient)"
               strokeWidth="20"
               opacity="0.6"
             />
             <path
               d="M -260 0 A 260 70 0 0 0 260 0"
               fill="none"
               stroke={gold}
               strokeWidth="0.8"
               opacity="0.3"
             />
             {/* Detail lines on the rings */}
             <path
               d="M -290 0 A 290 85 0 0 0 290 0"
               fill="none"
               stroke={gold}
               strokeWidth="0.5"
               opacity="0.2"
               strokeDasharray="10 5"
             />
          </g>

          {/* --- Satellites --- */}
          {satellites.map((sat) => (
            <motion.g
              key={sat.id}
              animate={{ rotate: 360 }}
              transition={{ duration: sat.speed, repeat: Infinity, ease: "linear" }}
            >
              <circle
                cx={sat.r}
                cy="0"
                r={sat.size}
                fill={sat.color}
                filter="url(#softGlow)"
                opacity="0.8"
              />
            </motion.g>
          ))}

        </g>
      </motion.svg>
    </div>
  )
}

export default CelestialTotem
