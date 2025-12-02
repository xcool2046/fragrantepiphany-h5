import React from 'react'
import { motion } from 'framer-motion'

const MoonPhases: React.FC = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
      {/* 背景光晕 - 轻微呼吸效果 */}
      <motion.div
        className="absolute w-96 h-96 rounded-full"
        animate={{
          boxShadow: [
            '0 0 80px 30px rgba(212, 163, 115, 0.15)',
            '0 0 120px 50px rgba(212, 163, 115, 0.25)',
            '0 0 80px 30px rgba(212, 163, 115, 0.15)',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 射线光晕 */}
      <svg
        className="absolute w-80 h-80 opacity-40"
        viewBox="0 0 200 200"
        style={{ filter: 'drop-shadow(0 0 10px rgba(212, 163, 115, 0.3))' }}
      >
        {/* 8条射线 */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1="100"
            y1="20"
            x2="100"
            y2="50"
            stroke="#D4A373"
            strokeWidth="1.5"
            opacity="0.6"
            transform={`rotate(${angle} 100 100)`}
          />
        ))}
      </svg>

      {/* 月亮堆叠 - 中心焦点 */}
      <div className="relative">
        {/* 上方小月亮 */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: '-80px' }}
          animate={{ opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-12 h-12 rounded-full border border-[#D4A373]/60 shadow-[inset_0_0_8px_rgba(212,163,115,0.3),0_0_12px_rgba(212,163,115,0.4)]" />
        </motion.div>

        {/* 中间大月亮 - 主焦点 */}
        <motion.div
          animate={{
            scale: [0.98, 1.05, 0.98],
            boxShadow: [
              '0 0 30px rgba(212, 163, 115, 0.6)',
              '0 0 50px rgba(212, 163, 115, 0.8)',
              '0 0 30px rgba(212, 163, 115, 0.6)',
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-32 h-32 rounded-full border-2 border-[#D4A373] shadow-[inset_0_-8px_16px_rgba(0,0,0,0.1),inset_0_0_12px_rgba(255,255,255,0.3)]"
          style={{
            background: 'radial-gradient(circle at 35% 35%, rgba(255, 250, 240, 0.4), rgba(212, 163, 115, 0.8))',
          }}
        />

        {/* 下方小月亮 */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: '80px' }}
          animate={{ opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-12 h-12 rounded-full border border-[#D4A373]/50 shadow-[inset_0_0_6px_rgba(212,163,115,0.2),0_0_10px_rgba(212,163,115,0.3)]" />
        </motion.div>
      </div>
    </div>
  )
}

export default MoonPhases
