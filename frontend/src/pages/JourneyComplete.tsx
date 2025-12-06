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
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const shareData = {
        title: t('common.appName'),
        text: t('journey.complete.desc'),
        url: t('journey.complete.shareUrl', 'https://fragrantepiphany.com/')
    }

    // 1. Mobile Native Share
    if (navigator.share) {
        try {
            await navigator.share(shareData)
            return
        } catch (err) {
            console.log('Share canceled or failed', err)
        }
    }

    // 2. Desktop Clipboard Fallback
    try {
        await navigator.clipboard.writeText(shareData.url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    } catch (err) {
        console.error('Copy failed', err)
    }
  }

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
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: 'easeOut', delay: 3.5 }}
        >
          {/* Share Button - Top (Primary/Solid) */}
          <button
            onClick={handleShare}
            className="w-[220px] h-[50px] rounded-full bg-[#2B1F16] text-[#F7F2ED] text-[10px] tracking-[0.2em] uppercase shadow-[0_10px_30px_-10px_rgba(43,31,22,0.4)] hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(43,31,22,0.5)] transition-all duration-500 flex items-center justify-center gap-2 group relative overflow-hidden"
          >
             <span className="relative z-10 flex items-center gap-2 transition-all duration-300 leading-none pt-[1px]">
                {copied ? (
                    <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {t('journey.complete.copied')}
                    </>
                ) : (
                    <>
                        <svg className="w-3.5 h-3.5 text-[#F7F2ED]/70 group-hover:text-[#F7F2ED] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        {t('journey.complete.shareBtn')}
                    </>
                )}
             </span>
             {copied && (
                 <motion.div 
                    layoutId="copied-bg"
                    className="absolute inset-0 bg-[#F7F2ED]/20 z-0" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                 />
             )}
          </button>

          {/* Home Button - Bottom (Secondary/Outline) */}
          <button
            onClick={() => navigate('/')}
            className="w-[220px] h-[50px] rounded-full bg-transparent border border-[#2B1F16]/30 text-[#2B1F16] text-[10px] tracking-[0.2em] uppercase hover:bg-[#2B1F16]/5 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span className="flex items-center gap-2 leading-none pt-[1px]">
                <svg className="w-3.5 h-3.5 text-[#2B1F16]/70 group-hover:text-[#2B1F16] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {t('journey.complete.toHome')}
            </span>
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default JourneyComplete
