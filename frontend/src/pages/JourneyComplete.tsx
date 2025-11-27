import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

const TypewriterText: React.FC<{ text: string; speed?: number }> = ({ text, speed = 50 }) => {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      setDisplayedText((prev) => {
        if (index < text.length) {
          index++
          return text.slice(0, index)
        }
        clearInterval(timer)
        return prev
      })
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed])

  return <span>{displayedText}</span>
}

import bgEnd from '../assets/perfume/bg_end.jpg'

const JourneyComplete: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div 
      className="min-h-screen bg-[#F7F2ED] text-[#2B1F16] flex items-center justify-center px-6 py-12 relative overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src={bgEnd} alt="Journey End" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20" /> {/* Slight overlay for text readability */}
      </div>

      <div className="max-w-3xl mx-auto text-center space-y-8 relative z-10">
        {/* Text with fade-in animation */}
        <motion.p
          className="text-xl md:text-2xl font-serif leading-relaxed text-[#2B1F16]/85"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, ease: 'easeOut' }}
        >
          <TypewriterText text={t('journey.complete.desc')} speed={50} />
        </motion.p>

        {/* Buttons with staggered animation */}
        <motion.div
          className="flex justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 2.5 }}
        >
          <button
            onClick={() => navigate('/')}
            className="px-5 py-3 rounded-full bg-[#2B1F16] text-[#F7F2ED] text-sm tracking-[0.2em] uppercase shadow-lg hover:-translate-y-0.5 transition"
          >
            {t('journey.complete.toHome')}
          </button>
          <button
            onClick={() => navigate('/journey')}
            className="px-5 py-3 rounded-full border border-[#2B1F16]/15 bg-white/80 text-sm tracking-[0.15em] uppercase shadow-sm hover:shadow-md transition"
          >
            {t('journey.complete.revisit')}
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default JourneyComplete
