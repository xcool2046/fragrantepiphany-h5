import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import LanguageToggle from '../components/LanguageToggle'
import StarrySky from '../components/StarrySky'
import homeBgDecorationWebp from '../assets/home-bg-decoration.webp'
import homeBgDecorationJpg from '../assets/home-bg-decoration.jpg'
import NoiseOverlay from '../components/NoiseOverlay'
import MysticalOrb from '../components/MysticalOrb'
import Sparkles from '../components/Sparkles'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const heroTitleLines = t('home.title').split('\n')
  const isZh = i18n.language === 'zh'

  return (
    <div className="relative min-h-screen overflow-hidden text-[#2B1F16] selection:bg-[#D4A373]/30 bg-[#F7F2ED]">
      <NoiseOverlay />
      
      <div className="absolute top-6 right-6 z-50">
        <LanguageToggle />
      </div>

      {/* --- Background Layer: Starry Sky & Atmosphere --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <StarrySky />
        <Sparkles />
        
        {/* Subtle Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(43,31,22,0.15)_100%)] pointer-events-none" />

        {/* Goddess Image: Faded into top area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[140vw] h-[60vh] md:w-[100vh] md:h-[60vh] mix-blend-multiply pointer-events-none"
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
        
        {/* Bottom Mystical Orb / Horizon */}
        {/* Adjusted to be purely atmospheric overlay on top of the existing planet graphic */}
        <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 scale-110 opacity-80 z-10 pointer-events-none mix-blend-screen">
          <MysticalOrb />
        </div>
      </div>

      {/* --- Content Layer: Centered Layout --- */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-6 min-h-screen flex flex-col items-center justify-center text-center pt-8 md:pt-16">

        {/* Title Group with Fixed Height Container */}
        <div className="mb-12 md:mb-16 flex flex-col items-center relative">
          {/* Brand Name Above Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="mb-8 md:mb-10"
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
                    duration: 1.2,
                    delay: 0.8 + (idx * 0.2),
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
            transition={{ duration: 1.5, delay: 1.5 }}
            className="mt-6 text-sm md:text-base text-[#2B1F16]/60 font-serif italic tracking-[0.15em] relative z-10 mix-blend-multiply"
          >
            {t('home.subtitle')}
          </motion.p>
        </div>

        {/* Interaction Group */}
        <div className="flex flex-col items-center gap-6">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1.8, ease: "easeOut" }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/onboarding')}
            className="group relative overflow-hidden px-14 py-5 md:px-20 md:py-6 rounded-full bg-[#2B1F16] text-[#F7F2ED] shadow-[0_20px_50px_-15px_rgba(43,31,22,0.4)] transition-all duration-500 inner-glow-gold"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            
            <div className="absolute inset-0 bg-gradient-to-r from-[#2B1F16] via-[#3E2D20] to-[#2B1F16] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-[radial-gradient(circle_at_center,#D4A373,transparent_70%)] blur-xl transition-opacity duration-500" />

            <span className="relative z-10 flex items-center gap-4 text-xs md:text-sm uppercase tracking-[0.3em] font-medium pl-1">
              {t('common.start')}
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2.2 }}
            onClick={() => navigate('/about')}
            className="text-[10px] uppercase tracking-[0.25em] text-[#2B1F16]/40 hover:text-[#2B1F16] transition-colors duration-500 py-2 hover:tracking-[0.3em]"
          >
            {t('common.learnMore')}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default Home
