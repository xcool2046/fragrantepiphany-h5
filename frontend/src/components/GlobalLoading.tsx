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
          {/* Outer pulsating ring */}
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.1, 0.3],
              rotate: 180
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute inset-0 border border-[#D4A373]/40 rounded-full"
          />
          
          {/* Inner glowing core */}
          <motion.div 
            animate={{ 
              scale: [0.8, 1.2, 0.8],
              opacity: [0.8, 1, 0.8],
              filter: ['blur(4px)', 'blur(8px)', 'blur(4px)']
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute w-4 h-4 bg-[#D4A373] rounded-full shadow-[0_0_20px_#D4A373]"
          />

          {/* Orbiting particles */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#2B1F16] rounded-full opacity-60" />
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
