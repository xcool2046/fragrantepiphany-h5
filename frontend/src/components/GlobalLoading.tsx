import React from 'react'
import { motion } from 'framer-motion'

const GlobalLoading: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F7F2ED] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(212,163,115,0.1)_100%)] pointer-events-none" />
      
      <div className="relative flex flex-col items-center gap-8">
        {/* Mystical Orb/Star Animation */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Static Orbit Ring */}
          <div className="absolute inset-0 border border-[#D4A373]/30 rounded-full" />
          
          {/* Inner glowing core */}
          <motion.div 
            animate={{ 
              opacity: [0.6, 1, 0.6],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute w-3 h-3 bg-[#D4A373] rounded-full blur-[2px]"
          />

          {/* Orbiting particle */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#2B1F16] rounded-full" />
          </motion.div>
        </div>
        
        {/* Elegant Text */}
        <motion.span 
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-[#2B1F16]/60 text-[10px] tracking-[0.4em] font-serif uppercase"
        >
          Loading
        </motion.span>
      </div>
    </div>
  )
}

export default GlobalLoading
