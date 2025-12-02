import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import LanguageToggle from '../components/LanguageToggle'
import homeBgDecorationWebp from '../assets/home-bg-decoration.webp'
import homeBgDecorationJpg from '../assets/home-bg-decoration.jpg'
import ZodiacWheel from '../components/ZodiacWheel'

import StarryBackground from '../components/StarryBackground'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const heroTitleLines = t('home.title').split('\n')
  const isZh = i18n.language === 'zh'

  return (
    <div className="relative min-h-screen overflow-hidden text-[#2B1F16] selection:bg-[#D4A373]/30 bg-[#F7F2ED]">
      
      <div className="absolute top-6 right-6 z-50">
        <LanguageToggle />
      </div>

      {/* --- Background Layer: Starry Sky & Atmosphere --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* Premium Starry Sky Effect */}
        <StarryBackground />

        {/* Subtle Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(43,31,22,0.15)_100%)] pointer-events-none" />

        {/* Goddess Image: Faded into upper-middle area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[150vw] h-[65vh] md:w-[110vh] md:h-[65vh] mix-blend-multiply pointer-events-none"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_closest-side,transparent_25%,#F7F2ED_85%)] z-10" />
          <picture>
            <source srcSet={homeBgDecorationWebp} type="image/webp" />
            <img
              src={homeBgDecorationJpg}
              alt=""
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-top grayscale contrast-110"
            />
          </picture>
        </motion.div>
      </div>

      {/* --- Content Layer: Centered Layout --- */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-6 min-h-screen flex flex-col items-center justify-end text-center pb-[40vw]">

        {/* Title Group with Fixed Height Container */}
        <div className="mb-3 md:mb-4 flex flex-col items-center relative">
          {/* Brand Name Above Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mb-3 md:mb-4"
          >
            <span className="text-xs md:text-sm uppercase tracking-[0.3em] text-[#2B1F16] font-sans font-medium opacity-50 block">
              {t('common.appName')}
            </span>
          </motion.div>

          {/* Fixed height container to prevent layout shift */}
          <div
            className="flex flex-col items-center justify-center relative z-10"
            style={{
              minHeight: isZh ? '160px' : '180px',
            }}
          >
            <h1 className="text-[#2B1F16] font-serif text-shadow-sm relative">
              {heroTitleLines.map((line, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    duration: 0.8,
                    delay: 0.3 + (idx * 0.1),
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="block"
                  style={{
                    fontSize: isZh
                      ? 'clamp(2.8rem, 7.5vw, 5rem)'
                      : 'clamp(2.5rem, 6.5vw, 4.8rem)',
                    fontWeight: 500,
                    letterSpacing: isZh ? '0.05em' : '-0.02em',
                    lineHeight: isZh ? 1.25 : 1.1,
                    marginTop: idx > 0 ? (isZh ? '0.2rem' : '0.15rem') : 0,
                  }}
                >
                  {line}
                </motion.span>
              ))}
            </h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-2 text-sm md:text-base text-[#2B1F16]/60 font-serif italic tracking-[0.15em] relative z-10 mix-blend-multiply"
          >
            {t('home.subtitle')}
          </motion.p>
        </div>

        {/* Interaction Group */}
        <div className="flex flex-col items-center gap-3 mb-0">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/onboarding')}
            className="group relative overflow-hidden px-14 py-5 md:px-20 md:py-6 rounded-full bg-[#2B1F16] text-[#F7F2ED] shadow-[0_20px_50px_-15px_rgba(43,31,22,0.4)] transition-shadow transition-colors duration-700 inner-glow-gold hover:shadow-[0_30px_80px_-15px_rgba(212,163,115,0.3)]"
          >
            {/* Shimmer effect - slower */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_ease-in-out_infinite]" />

            {/* Subtle background glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#2B1F16] via-[#3E2D20] to-[#2B1F16] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            {/* Enhanced outer glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[radial-gradient(circle_at_center,#D4A373,transparent_70%)] blur-2xl transition-all duration-700" />

            {/* Subtle border glow */}
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ boxShadow: 'inset 0 0 0 1px rgba(212,163,115,0.15)' }} />

            <span className="relative z-10 flex items-center gap-4 text-xs md:text-sm uppercase tracking-[0.3em] font-medium pl-1">
              {t('common.start')}
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            onClick={() => navigate('/about')}
            className="group/learn relative text-[10px] uppercase tracking-[0.25em] text-[#2B1F16]/40 hover:text-[#2B1F16] transition-colors transition-transform duration-500 py-3 px-8 hover:-translate-y-[3px] border border-[#2B1F16]/[0.15] hover:border-[#2B1F16]/40 rounded-full"
          >
            <span className="relative z-10">{t('common.learnMore')}</span>
            {/* 极淡的悬浮阴影 */}
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[80%] h-[2px] bg-[#2B1F16] opacity-0 group-hover/learn:opacity-[0.08] blur-[3px] transition-opacity duration-500" />
          </motion.button>
        </div>
      </div>

      {/* --- Zodiac Wheel: Bottom Decoration --- */}
      <ZodiacWheel />
    </div>
  )
}

export default Home
