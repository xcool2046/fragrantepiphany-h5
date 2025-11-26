import React from 'react'
import { motion } from 'framer-motion'

interface PerfumePyramidProps {
  top: string
  heart: string
  base: string
}

const PerfumePyramid: React.FC<PerfumePyramidProps> = ({ top, heart, base }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <motion.div
      className="flex flex-col items-center gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Pyramid SVG */}
      <svg viewBox="0 0 200 180" className="w-32 h-32 drop-shadow-lg">
        {/* Top Triangle */}
        <motion.polygon
          points="100,20 140,80 60,80"
          fill="#E8D5C4"
          stroke="#A87B51"
          strokeWidth="1.5"
          variants={itemVariants}
        />

        {/* Middle Triangle */}
        <motion.polygon
          points="140,80 180,140 20,140"
          fill="#F5E6D3"
          stroke="#A87B51"
          strokeWidth="1.5"
          variants={itemVariants}
        />

        {/* Base Triangle */}
        <motion.polygon
          points="180,140 200,170 0,170"
          fill="#F9EEE4"
          stroke="#A87B51"
          strokeWidth="1.5"
          variants={itemVariants}
        />

        {/* Top Notes Label */}
        <motion.text
          x="100"
          y="55"
          textAnchor="middle"
          className="text-xs font-serif fill-[#2B1F16]"
          variants={itemVariants}
        >
          Top
        </motion.text>

        {/* Heart Notes Label */}
        <motion.text
          x="100"
          y="110"
          textAnchor="middle"
          className="text-xs font-serif fill-[#2B1F16]"
          variants={itemVariants}
        >
          Heart
        </motion.text>

        {/* Base Notes Label */}
        <motion.text
          x="100"
          y="155"
          textAnchor="middle"
          className="text-xs font-serif fill-[#2B1F16]"
          variants={itemVariants}
        >
          Base
        </motion.text>
      </svg>

      {/* Notes Description */}
      <motion.div className="text-center space-y-4 w-full" variants={itemVariants}>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-[#A87B51] font-medium">Top Notes</p>
          <p className="text-sm font-serif text-[#2B1F16]">{top}</p>
        </div>

        <div className="h-px bg-[#D4A373]/20 w-full" />

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-[#A87B51] font-medium">Heart Notes</p>
          <p className="text-sm font-serif text-[#2B1F16]">{heart}</p>
        </div>

        <div className="h-px bg-[#D4A373]/20 w-full" />

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-[#A87B51] font-medium">Base Notes</p>
          <p className="text-sm font-serif text-[#2B1F16]">{base}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default PerfumePyramid
