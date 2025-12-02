import React from 'react'
import { motion } from 'framer-motion'

const FlowingTexture: React.FC = () => {
  return (
    <svg
      viewBox="0 0 400 400"
      className="absolute inset-0 w-full h-full"
      style={{ filter: 'drop-shadow(0 0 40px rgba(212, 163, 115, 0.3))' }}
      preserveAspectRatio="none"
    >
      <defs>
        {/* Turbulence filter for organic flow effect */}
        <filter id="flowingNoiseSmall">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.003"
            numOctaves="4"
            result="noise"
            seed="2"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="50"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <filter id="flowingNoiseLarge">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.002"
            numOctaves="3"
            result="noise"
            seed="1"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="80"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Gradient definitions */}
        <radialGradient id="flowGradient1" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#D4A373" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#A87B51" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#6B5344" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="flowGradient2" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#E8DCC5" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#D4A373" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#2B1F16" stopOpacity="0" />
        </radialGradient>

        {/* Animate the flow by morphing these paths */}
        <g id="flowPaths">
          <path
            d="M 200 50 Q 250 100 270 200 Q 250 300 200 350 Q 150 300 130 200 Q 150 100 200 50"
            fill="none"
            stroke="url(#flowGradient1)"
            strokeWidth="40"
            opacity="0.4"
            filter="url(#flowingNoiseSmall)"
          />
          <path
            d="M 200 80 Q 280 150 290 200 Q 280 250 200 320 Q 120 250 110 200 Q 120 150 200 80"
            fill="none"
            stroke="url(#flowGradient2)"
            strokeWidth="35"
            opacity="0.3"
            filter="url(#flowingNoiseLarge)"
          />
          <circle
            cx="200"
            cy="200"
            r="60"
            fill="url(#flowGradient1)"
            opacity="0.25"
            filter="url(#flowingNoiseSmall)"
          />
        </g>
      </defs>

      {/* Animated flowing paths */}
      <motion.g>
        <use href="#flowPaths" opacity="0.5" />
      </motion.g>

      {/* Second layer with phase offset */}
      <motion.g
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <path
          d="M 100 200 Q 150 100 200 80 Q 250 100 300 200 Q 250 300 200 320 Q 150 300 100 200"
          fill="none"
          stroke="url(#flowGradient2)"
          strokeWidth="25"
          opacity="0.2"
          filter="url(#flowingNoiseLarge)"
        />
      </motion.g>

      {/* Radial energy waves */}
      <motion.circle
        cx="200"
        cy="200"
        r="100"
        fill="none"
        stroke="#D4A373"
        strokeWidth="1"
        opacity="0.2"
        animate={{ r: [80, 120, 80] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.circle
        cx="200"
        cy="200"
        r="100"
        fill="none"
        stroke="#D4A373"
        strokeWidth="0.5"
        opacity="0.1"
        animate={{ r: [100, 150, 100] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      />
    </svg>
  )
}

export default FlowingTexture
