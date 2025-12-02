import React from 'react'
import { motion } from 'framer-motion'

interface WipeTransitionProps {
  children: React.ReactNode
}

const WipeTransition: React.FC<WipeTransitionProps> = ({ children }) => {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* The content of the new page */}
      {children}

      {/* The Wipe Overlay */}
      {/* 
         We want the wipe to:
         1. Start covering the screen (if we want a "reveal" effect) OR
         2. Slide in to cover the old page, then slide out to reveal the new page.
         
         Let's go with a "Curtain" effect:
         - Exit: Curtain slides IN from right to left (covering the old page).
         - Enter: Curtain slides OUT from right to left (revealing the new page).
      */}
      
      <motion.div
        className="fixed inset-0 z-[9999] bg-[#2B1F16] pointer-events-none"
        initial={{ scaleX: 1, originX: 1 }}
        animate={{ scaleX: 0, originX: 1 }}
        exit={{ scaleX: 1, originX: 0 }}
        transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}

export default WipeTransition
