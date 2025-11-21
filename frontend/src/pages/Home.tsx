import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { tapSpring } from '../utils/interactionPresets'
import { useNavigate } from 'react-router-dom'
import BackgroundBubbles from '../components/BackgroundBubbles'
import ClickBubbles from '../components/ClickBubbles'

export default function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const bubbles = [
    { size: 280, x: '10%', y: '20%', color: 'rgba(212, 163, 115, 0.15)', blur: 80, opacity: 0.6, duration: 15, xOffset: 30, yOffset: -20 },
    { size: 220, x: '80%', y: '60%', color: 'rgba(196, 155, 163, 0.15)', blur: 60, opacity: 0.5, duration: 18, xOffset: -20, yOffset: 30 },
    { size: 300, x: '30%', y: '80%', color: 'rgba(212, 163, 115, 0.1)', blur: 90, opacity: 0.4, duration: 20, xOffset: 20, yOffset: 20 },
  ]

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center text-center bg-background bg-noise">
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_70%)] z-0 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#D4A373]/20 rounded-full blur-[120px] pointer-events-none mix-blend-overlay" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#C49BA3]/20 rounded-full blur-[100px] pointer-events-none mix-blend-overlay" />
      
      {/* Background Pattern (Enhanced) */}
      <div className="absolute inset-0 opacity-[0.08] bg-[url('/assets/bg-home.png')] bg-cover bg-center pointer-events-none mix-blend-soft-light" />

      {/* Background Bubbles */}
      <div className="opacity-40">
        <BackgroundBubbles bubbles={bubbles} />
      </div>
      <ClickBubbles />

      {/* Content */}
      <div className="relative z-10 px-6 max-w-md mx-auto flex flex-col items-center">
        
        {/* Mystic Symbol (Decorative) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-[-120px] w-64 h-64 bg-gradient-to-b from-[#D4A373]/10 to-transparent rounded-full blur-3xl pointer-events-none"
        />

        {/* App Name */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xs text-[#D4A373] uppercase tracking-[0.3em] mb-8 font-medium"
        >
          {t('common.appName')}
        </motion.p>
        
        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-5xl md:text-6xl font-serif text-[#1A120B] mb-6 leading-tight drop-shadow-sm"
        >
          {t('home.title')}
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-[#6B5542] mb-16 font-light italic text-lg tracking-wide"
        >
          {t('home.subtitle')}
        </motion.p>

        {/* Start Button */}
        <motion.button
          {...tapSpring}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 280, damping: 22, delay: 1.2 }}
          onClick={() => navigate('/quiz')}
          className="w-[260px] md:w-[280px] px-10 py-4 bg-[#2B1F16]/95 text-[#F7F2ED] rounded-full shadow-[0_12px_36px_rgba(43,31,22,0.35)] hover:shadow-[0_16px_48px_rgba(43,31,22,0.38)] text-base md:text-lg font-medium tracking-normal uppercase whitespace-nowrap relative overflow-hidden group transition-all border border-[#D4A373]/50 backdrop-blur-sm flex justify-center"
        >
          <span className="relative z-10 flex items-center gap-2">
            {t('common.start')}
            <svg className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4A373]/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
        </motion.button>

        {/* Learn More (Minimal) */}
        <motion.button
          {...tapSpring}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          whileHover={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          onClick={() => navigate('/about')}
          className="mt-10 text-[#6B5542] text-xs tracking-[0.2em] uppercase border-b border-transparent hover:border-[#D4A373] transition-all pb-1"
        >
          {t('common.learnMore')}
        </motion.button>
      </div>
    </div>
  )
}
