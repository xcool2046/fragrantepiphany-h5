import React from 'react'
import { motion } from 'framer-motion'
import zodiacWheelImage from '../assets/zodiac-wheel.png'

const ZodiacWheel: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10 pointer-events-none overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 0.85,
          scale: 1,
          rotate: 360
        }}
        transition={{
          opacity: { duration: 2, delay: 2.5, ease: "easeOut" },
          scale: { duration: 2, delay: 2.5, ease: "easeOut" },
          rotate: {
            duration: 45,
            repeat: Infinity,
            ease: "linear",
            delay: 4.5
          }
        }}
        className="w-[85vw] h-[85vw] md:w-[700px] md:h-[700px] mix-blend-multiply"
        style={{
          willChange: 'transform'
        }}
      >
        <img
          src={zodiacWheelImage}
          alt=""
          className="w-full h-full object-contain"
          loading="eager"
          decoding="async"
        />
      </motion.div>
    </div>
  )
}

export default ZodiacWheel
