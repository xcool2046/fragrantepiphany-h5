import React from 'react'
import { motion } from 'framer-motion'

interface WipeTransitionProps {
  children: React.ReactNode
}

const WipeTransition: React.FC<WipeTransitionProps> = ({ children }) => {
  return (
    <div className="relative w-full min-h-screen bg-[var(--color-bg-main)]">
      <motion.div
        className="w-full min-h-screen"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export default WipeTransition
