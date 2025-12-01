import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import drawBg from '../assets/draw_bg.jpg'
import breathIcon from '../assets/breath_icon.png'

const Breath: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const state = location.state as { answers?: Record<string, string> }

  const handleContinue = () => {
    navigate('/draw', { state })
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#F7F2ED] text-[#F7F2ED] font-serif flex flex-col items-center justify-center pb-40">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img 
          src={drawBg} 
          alt="Background" 
          className="w-full h-full object-cover opacity-100"
        />
        <div className="absolute inset-0 bg-black/30" /> 
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center w-full max-w-md">
        
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="mb-12"
        >
          <img 
            src={breathIcon} 
            alt="Sun and Moon" 
            className="w-80 h-80 md:w-[30rem] md:h-[30rem] object-contain drop-shadow-[0_0_15px_rgba(212,163,115,0.3)]"
          />
        </motion.div>

        {/* Text */}
        <div className="space-y-6 mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-xl md:text-2xl tracking-wide font-medium text-[#E5C4A3]"
          >
            Take a deep breath...
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="text-xl md:text-2xl tracking-wide font-medium text-[#E5C4A3]"
          >
            Let your mind settle.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.5 }}
            className="text-lg md:text-xl tracking-wider text-[#E5C4A3] leading-relaxed mt-4"
          >
            Connect with the message that is approaching you
          </motion.p>
        </div>

        {/* Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 3.5 }}
          onClick={handleContinue}
          className="px-10 py-3 rounded-full bg-[#5C4033]/80 border border-[#D4A373]/30 text-[#D4A373] uppercase tracking-[0.2em] text-sm hover:bg-[#5C4033] hover:text-[#F7F2ED] transition-all duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
        >
          {t('common.continue')}
        </motion.button>

      </div>
    </div>
  )
}

export default Breath
