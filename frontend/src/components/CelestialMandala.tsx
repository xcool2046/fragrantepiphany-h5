import React from 'react'
import { motion } from 'framer-motion'

const CelestialMandala: React.FC = () => {
  const goldColor = '#D4A373'

  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
      {/* Main Mandala */}
      <motion.svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <defs>
          <filter id="celestial-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={goldColor} stopOpacity="1" />
            <stop offset="100%" stopColor={goldColor} stopOpacity="0.3" />
          </radialGradient>
        </defs>

        {/* Central Sun with Rays */}
        <g transform="translate(200, 200)">
          {/* Sun Circle */}
          <circle r="35" fill="url(#sunGradient)" filter="url(#celestial-glow)" />
          <circle r="35" fill="none" stroke={goldColor} strokeWidth="1.5" opacity="0.6" />

          {/* Sun Rays - Rotating */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            {Array.from({ length: 32 }).map((_, i) => (
              <line
                key={`sun-ray-${i}`}
                x1="0"
                y1="45"
                x2="0"
                y2={i % 2 === 0 ? "70" : "60"}
                stroke={goldColor}
                strokeWidth={i % 4 === 0 ? "2" : "1"}
                opacity={i % 4 === 0 ? "0.8" : "0.4"}
                transform={`rotate(${(i * 360) / 32})`}
              />
            ))}
          </motion.g>

          {/* Orbit Circles */}
          <circle r="90" fill="none" stroke={goldColor} strokeWidth="0.8" opacity="0.5" strokeDasharray="4 2" />
          <circle r="140" fill="none" stroke={goldColor} strokeWidth="0.5" opacity="0.3" strokeDasharray="2 4" />

          {/* Top Star */}
          <g transform="translate(0, -160)">
            <motion.g
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <circle r="4" fill={goldColor} />
              {Array.from({ length: 8 }).map((_, i) => (
                <line
                  key={`top-star-ray-${i}`}
                  x1="0"
                  y1="8"
                  x2="0"
                  y2="16"
                  stroke={goldColor}
                  strokeWidth="1"
                  transform={`rotate(${(i * 360) / 8})`}
                />
              ))}
            </motion.g>
          </g>

          {/* Right Planet */}
          <g transform="translate(130, -40)">
            <circle r="8" fill="none" stroke={goldColor} strokeWidth="1" opacity="0.7" />
            <circle r="12" fill="none" stroke={goldColor} strokeWidth="0.5" opacity="0.4" />
          </g>

          {/* Left Moon - Crescent */}
          <motion.g
            transform="translate(-130, -40)"
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <path
              d="M -8,-12 A 12,12 0 1,1 -8,12 A 10,10 0 1,0 -8,-12 Z"
              fill={goldColor}
              opacity="0.8"
            />
          </motion.g>

          {/* Bottom-Right Star */}
          <g transform="translate(120, 120)">
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <path
                d="M 0,-6 L 1.5,-2 L 6,-1 L 2,2 L 3,7 L 0,4 L -3,7 L -2,2 L -6,-1 L -1.5,-2 Z"
                fill={goldColor}
                opacity="0.7"
              />
            </motion.g>
          </g>

          {/* Bottom-Left Star */}
          <g transform="translate(-120, 120)">
            <circle r="2.5" fill={goldColor} opacity="0.6" />
            {Array.from({ length: 6 }).map((_, i) => (
              <line
                key={`bottom-left-ray-${i}`}
                x1="0"
                y1="4"
                x2="0"
                y2="8"
                stroke={goldColor}
                strokeWidth="0.8"
                opacity="0.5"
                transform={`rotate(${(i * 360) / 6})`}
              />
            ))}
          </g>

          {/* Small Decorative Dots */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.circle
              key={`dot-${i}`}
              cx={110 * Math.cos((i * Math.PI) / 4)}
              cy={110 * Math.sin((i * Math.PI) / 4)}
              r="1.5"
              fill={goldColor}
              opacity="0.4"
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Connecting Lines */}
          <line x1="0" y1="-35" x2="0" y2="-160" stroke={goldColor} strokeWidth="0.5" opacity="0.3" strokeDasharray="2 2" />
          <line x1="35" y1="0" x2="140" y2="0" stroke={goldColor} strokeWidth="0.5" opacity="0.3" strokeDasharray="2 2" />
          <line x1="-35" y1="0" x2="-140" y2="0" stroke={goldColor} strokeWidth="0.5" opacity="0.3" strokeDasharray="2 2" />
        </g>
      </motion.svg>
    </div>
  )
}

export default CelestialMandala
