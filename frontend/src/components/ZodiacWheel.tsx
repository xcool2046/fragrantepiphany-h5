import React from 'react'
import { motion } from 'framer-motion'
import zodiacWheelImage from '../assets/zodiac-wheel.png'

const ZodiacWheel: React.FC = () => {
  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10 pointer-events-none overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 0.85,
          scale: 1,
        }}
        transition={{
          opacity: { duration: 1.5, delay: 0.5, ease: "easeOut" },
          scale: { duration: 1.5, delay: 0.5, ease: "easeOut" },
        }}
        className="w-[120vw] h-[120vw] md:w-[55vw] md:h-[55vw] md:max-w-[800px] md:max-h-[800px] xl:w-[700px] xl:h-[700px] md:translate-y-[45%] md:scale-[1.1] mix-blend-multiply"
      >
        <img
          src={zodiacWheelImage}
          alt=""
          className="w-full h-full object-contain animate-[spin_60s_linear_infinite]"
          loading="eager"
          decoding="async"
        />
      </motion.div>
    </div>
  )
}

export default ZodiacWheel
