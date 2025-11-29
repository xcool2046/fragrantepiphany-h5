import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import bgEnd from '../assets/perfume/bg_end.jpg'

// --- Components ---

// 1. Enhanced Typewriter Effect
const TypewriterText: React.FC<{ text: string; speed?: number; delay?: number }> = ({ text, speed = 40, delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => {
        setStarted(true)
    }, delay * 1000)

    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!started) return

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
  }, [text, speed, started])

  return (
    <span className="inline-block min-h-[1.5em]">
        {displayedText}
        {/* Blinking Cursor */}
        <motion.span 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="inline-block w-[2px] h-[1em] bg-[#2B1F16] ml-1 align-middle"
        />
    </span>
  )
}

// 2. Floating Particles
const FloatingParticles = () => {
    // Generate random particles
    const particles = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5
    }))

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-1">
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-white/30 blur-[1px]"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size
                    }}
                    animate={{
                        y: [0, -100],
                        opacity: [0, 0.5, 0]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    )
}

const JourneyComplete: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div 
      className="min-h-screen bg-[#F7F2ED] text-[#2B1F16] flex items-center justify-center px-6 py-12 relative overflow-hidden"
    >
      {/* Background Image with Slow Zoom */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img 
            src={bgEnd} 
            alt="Journey End" 
            className="w-full h-full object-cover"
            initial={{ scale: 1.0 }}
            animate={{ scale: 1.1 }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        />
        <div className="absolute inset-0 bg-[#F7F2ED]/20 mix-blend-overlay" /> {/* Texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F7F2ED] via-transparent to-[#F7F2ED]/50" /> {/* Vignette */}
      </div>

      {/* Particles */}
      <FloatingParticles />

      <div className="max-w-3xl mx-auto text-center space-y-12 relative z-10">
        
        {/* Main Text Container */}
        <div className="space-y-6">
            {/* Title (Optional, if we want one) */}
            {/* 
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-3xl md:text-4xl font-serif text-[#2B1F16]"
            >
                {t('journey.complete.title', 'Journey Complete')}
            </motion.h1>
            */}

            {/* Typewriter Description */}
            <div className="text-xl md:text-2xl font-serif leading-relaxed text-[#2B1F16]/90 min-h-[120px] flex items-center justify-center">
                <TypewriterText text={t('journey.complete.desc')} speed={40} delay={0.5} />
            </div>
        </div>

        {/* Buttons with staggered animation */}
        <motion.div
          className="flex flex-col md:flex-row justify-center gap-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: 'easeOut', delay: 3.5 }} // Delay matches approx text finish
        >
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 rounded-full bg-[#2B1F16] text-[#F7F2ED] text-xs tracking-[0.25em] uppercase shadow-[0_10px_30px_-10px_rgba(43,31,22,0.4)] hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(43,31,22,0.5)] transition-all duration-500"
          >
            {t('journey.complete.toHome')}
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default JourneyComplete
