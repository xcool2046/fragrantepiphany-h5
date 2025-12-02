import React from 'react'
import { motion } from 'framer-motion'

const MysticPlanetDiagram: React.FC = () => {
  const color = '#D4A373' // Gold

  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
      <motion.svg
        viewBox="0 0 600 1400"
        className="w-full h-full max-w-[500px] opacity-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <defs>
          <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- CENTRAL GROUP (y=700) --- */}
        <g transform="translate(300, 700)">
          
          {/* Dense Sunburst Rays - Multiple Layers */}
          <motion.g animate={{ rotate: 360 }} transition={{ duration: 240, repeat: Infinity, ease: "linear" }}>
             {/* Long fine rays */}
             {Array.from({ length: 90 }).map((_, i) => (
               <line
                 key={`long-ray-${i}`}
                 x1="0" y1="140" x2="0" y2={i % 2 === 0 ? "260" : "220"}
                 stroke={color}
                 strokeWidth="0.5"
                 opacity={Math.random() * 0.3 + 0.1}
                 transform={`rotate(${i * 4})`}
               />
             ))}
             {/* Shorter inner rays */}
             {Array.from({ length: 72 }).map((_, i) => (
               <line
                 key={`short-ray-${i}`}
                 x1="0" y1="90" x2="0" y2="130"
                 stroke={color}
                 strokeWidth="0.5"
                 opacity="0.3"
                 transform={`rotate(${i * 5})`}
               />
             ))}
          </motion.g>

          {/* Orbit Rings */}
          <circle r="140" fill="none" stroke={color} strokeWidth="1" strokeDasharray="1 4" opacity="0.6" />
          <motion.circle 
            r="180" fill="none" stroke={color} strokeWidth="0.5" strokeDasharray="4 8" opacity="0.4"
            animate={{ rotate: -360 }} transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
          />
          <circle r="280" fill="none" stroke={color} strokeWidth="0.5" strokeDasharray="1 12" opacity="0.3" />

          {/* Central Main Moon & Circle */}
          <circle r="90" fill="none" stroke={color} strokeWidth="1.5" opacity="0.8" />
          
          {/* Left-facing Crescent Moon */}
          <motion.path
            d="M -30,-50 A 50,50 0 1,1 -30,50 A 40,40 0 1,0 -30,-50 Z"
            fill={color}
            opacity="0.9"
            filter="url(#soft-glow)"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Stippling Texture Inside Moon */}
           <g opacity="0.4">
              {Array.from({ length: 25 }).map((_, i) => (
                  <circle
                      key={`moon-dot-${i}`}
                      cx={Math.random() * 40 - 20}
                      cy={Math.random() * 80 - 40}
                      r={Math.random() * 0.8}
                      fill="#2B1F16"
                  />
              ))}
           </g>
        </g>

        {/* --- VERTICAL AXIS & DECORATIONS --- */}
        
        {/* Top Section */}
        <g transform="translate(300, 350)">
           {/* Top Sun/Star */}
           <g transform="translate(0, -250)">
               <circle r="4" fill={color} />
               {Array.from({ length: 12 }).map((_, i) => (
                   <line key={i} x1="0" y1="6" x2="0" y2="16" stroke={color} strokeWidth="1" transform={`rotate(${i * 30})`} />
               ))}
           </g>

           {/* Connecting Line */}
           <line x1="0" y1="-220" x2="0" y2="-120" stroke={color} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />

           {/* Circle with dot */}
           <g transform="translate(0, -100)">
               <circle r="15" fill="none" stroke={color} strokeWidth="1" />
               <circle r="3" fill={color} />
           </g>
           
           {/* Eye Symbol */}
           <g transform="translate(0, -40)">
              <path d="M -35,0 Q 0,-25 35,0 Q 0,25 -35,0" fill="none" stroke={color} strokeWidth="1.5" />
              <circle r="10" fill="none" stroke={color} strokeWidth="1" />
              <circle r="4" fill={color} />
              {/* Eye lashes/rays */}
              <line x1="0" y1="-28" x2="0" y2="-38" stroke={color} strokeWidth="1" opacity="0.6" />
              <line x1="-15" y1="-24" x2="-22" y2="-34" stroke={color} strokeWidth="1" opacity="0.6" />
              <line x1="15" y1="-24" x2="22" y2="-34" stroke={color} strokeWidth="1" opacity="0.6" />
           </g>

           {/* Upward Crescent Moon (Cup) */}
           <g transform="translate(0, 40)">
               <path d="M -25,-15 A 25,25 0 0,0 25,-15 A 25,25 0 0,1 -25,-15 Z" fill={color} opacity="0.9" />
               <circle cy="-30" r="3" fill={color} opacity="0.7">
                  <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
               </circle>
           </g>
        </g>

        {/* Bottom Section */}
        <g transform="translate(300, 1050)">
           {/* Connecting Line from center */}
           <line x1="0" y1="-200" x2="0" y2="0" stroke={color} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
           
           {/* Intersecting Circles */}
           <circle r="60" fill="none" stroke={color} strokeWidth="0.8" opacity="0.7" />
           <circle cy="-30" r="30" fill="none" stroke={color} strokeWidth="0.5" opacity="0.5" />
           <circle cy="30" r="30" fill="none" stroke={color} strokeWidth="0.5" opacity="0.5" />
           
           {/* Triangle/Pyramid */}
           <path d="M 0,40 L -15,65 L 15,65 Z" fill={color} opacity="0.8" />
           
           {/* Horizontal Orbit at bottom */}
           <ellipse cy="0" rx="90" ry="20" fill="none" stroke={color} strokeWidth="0.5" opacity="0.4" transform="rotate(-5)" />

           {/* Bottom Terminal Star */}
           <g transform="translate(0, 120)">
               <path d="M 0,-20 L 4,-4 L 20,0 L 4,4 L 0,20 L -4,4 L -20,0 L -4,-4 Z" fill={color} />
               <line x1="0" y1="-40" x2="0" y2="0" stroke={color} strokeWidth="0.5" />
           </g>
        </g>
        
        {/* Floating Particles */}
        {Array.from({ length: 40 }).map((_, i) => {
             const x = Math.random() * 600;
             const y = Math.random() * 1400;
             const r = Math.random() * 1.5 + 0.5;
             return (
                 <motion.circle
                    key={`star-${i}`}
                    cx={x}
                    cy={y}
                    r={r}
                    fill={color}
                    opacity={Math.random() * 0.5 + 0.1}
                    animate={{ opacity: [0.1, 0.6, 0.1] }}
                    transition={{ duration: Math.random() * 4 + 2, repeat: Infinity, delay: Math.random() * 5 }}
                 />
             )
        })}

      </motion.svg>
    </div>
  )
}

export default MysticPlanetDiagram