import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageToggle from '../components/LanguageToggle'
import StarrySky from '../components/StarrySky'
import homeBgDecorationWebp from '../assets/home-bg-decoration.webp'
import homeBgDecorationJpg from '../assets/home-bg-decoration.jpg'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const heroTitleLines = t('home.title').split('\n')
  const isZh = i18n.language === 'zh'

  return (
    <div className="relative min-h-screen overflow-hidden text-[#2B1F16] selection:bg-[#D4A373]/30">
      <div className="absolute top-6 right-6 z-30">
        <LanguageToggle />
      </div>

      {/* --- Background Layer: Starry Sky Gradient --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <StarrySky />

        {/* Goddess Image: Faded into top area (moved up) */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[140vw] h-[60vh] md:w-[100vh] md:h-[60vh] mix-blend-multiply opacity-30 pointer-events-none">
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
        </div>

        {/* Subtle Ambient Glow */}
        <div className="absolute top-[15%] left-[15%] w-[50vw] h-[50vw] rounded-full bg-[#D4A373] blur-[140px] opacity-10 mix-blend-soft-light" />
      </div>

      {/* --- Content Layer: Centered Layout --- */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 min-h-screen flex flex-col items-center justify-center text-center">

        {/* Title Group with Fixed Height Container */}
        <div className="mb-8 md:mb-10 hero-fade flex flex-col items-center relative">
          {/* Brand Name Above Title */}
          <div className="mb-6 md:mb-8">
            <span className="text-xs md:text-sm uppercase tracking-[0.25em] text-[#2B1F16] font-sans font-light opacity-50 block">
              {t('common.appName')}
            </span>
          </div>

          {/* Fixed height container to prevent layout shift */}
          <div
            className="flex flex-col items-center justify-center relative z-10"
            style={{
              minHeight: isZh ? '160px' : '180px',
            }}
          >
            <h1 className="text-[#2B1F16] font-serif text-shadow-sm relative">
              {heroTitleLines.map((line, idx) => (
                <span
                  key={idx}
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
                </span>
              ))}
            </h1>
          </div>

          <p className="mt-4 text-sm md:text-base text-[#2B1F16]/70 font-serif italic tracking-[0.15em] relative z-10">
            {t('home.subtitle')}
          </p>
        </div>

        {/* Interaction Group */}
        <div className="flex flex-col items-center gap-4 hero-fade hero-fade-delay-2">
          <button
            onClick={() => navigate('/onboarding')}
            className="group relative overflow-hidden px-12 py-4 md:px-16 md:py-5 rounded-full bg-[#2B1F16] text-[#F7F2ED] shadow-[0_20px_40px_-15px_rgba(43,31,22,0.3)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-12px_rgba(43,31,22,0.35)] inner-glow-gold"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#2B1F16] via-[#3E2D20] to-[#2B1F16] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[radial-gradient(circle_at_center,white,transparent)] blur-xl transition-opacity duration-500" />

            <span className="relative z-10 flex items-center gap-3 text-xs md:text-sm uppercase tracking-[0.25em] font-medium">
              {t('common.start')}
              <span className="hero-arrow inline-flex">→</span>
            </span>
          </button>

          <button
            onClick={() => navigate('/about')}
            className="text-[10px] uppercase tracking-[0.2em] text-[#2B1F16]/40 hover:text-[#2B1F16] transition-colors duration-300 py-2"
          >
            {t('common.learnMore')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
