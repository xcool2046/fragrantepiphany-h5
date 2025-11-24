import React from 'react'
import { useNavigate } from 'react-router-dom'
import LanguageToggle from '../components/LanguageToggle'
import Sparkles from '../components/Sparkles'
import homeBgDecorationWebp from '../assets/home-bg-decoration.webp'
import homeBgDecorationJpg from '../assets/home-bg-decoration.jpg'

const Home: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F7F2ED] text-[#2B1F16] selection:bg-[#D4A373]/30">
      <div className="absolute top-6 right-6 z-30">
        <LanguageToggle />
      </div>

      {/* --- 背景层：改为轻量 CSS 动效，减 JS 负担 --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F7F2ED] via-[#F5F0EB] to-[#EBE4DC]" />

        <div className="hero-bg-floating absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] md:w-[100vh] aspect-[3/4] mix-blend-multiply pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_closest-side,transparent_28%,#F7F2ED_100%)] z-10" />
          <picture>
            <source srcSet={homeBgDecorationWebp} type="image/webp" />
            <img
              src={homeBgDecorationJpg}
              alt=""
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-[58%_18%] grayscale contrast-125 opacity-100 hero-bg-fade"
            />
          </picture>
        </div>

        <div className="absolute top-[10%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-[#D4A373] blur-[160px] opacity-20 mix-blend-multiply hero-bloom" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-[#FFF8F0] blur-[100px] opacity-70 mix-blend-soft-light" />
        <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-20 bg-[radial-gradient(circle_at_center,rgba(43,31,22,0.12),transparent_55%)]" />

        <div
          className="absolute inset-0 opacity-[0.35] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        <Sparkles />
      </div>

      {/* --- 主内容层：CSS 渐显，避免运行时 JS 动画 --- */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 min-h-screen flex flex-col items-center justify-center text-center">
        <div className="w-full flex flex-col items-center justify-center -mt-12 md:-mt-14">
          <div className="mb-12 md:mb-12 hero-fade">
            <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#A87B51] font-sans font-medium">
              Fragrant Epiphany
            </span>
          </div>

          <div className="mb-8 md:mb-12 space-y-4 md:space-y-5 hero-fade hero-fade-delay-1">
            <h1 className="text-[#2B1F16] font-serif leading-[1.1]">
              <span className="block text-[clamp(2rem,5vw,3.5rem)] italic font-light tracking-wide opacity-90">
                A Journey Through
              </span>
              <span className="block text-[clamp(2.5rem,7vw,5rem)] font-medium tracking-tight mt-2">
                Scent, Spirit <span className="italic font-light">&</span> Stars
              </span>
            </h1>
          </div>

          <p className="mb-12 md:mb-14 text-sm md:text-lg text-[#2B1F16]/60 font-serif italic tracking-[0.1em] hero-fade hero-fade-delay-2">
            Tarot · Fragrance · You
          </p>

          <div className="mb-18 hero-fade hero-fade-delay-3">
            <button
              onClick={() => navigate('/onboarding')}
              className="group relative overflow-hidden px-10 py-4 md:px-14 md:py-5 rounded-full bg-[#2B1F16] text-[#F7F2ED] shadow-[0_20px_40px_-15px_rgba(43,31,22,0.3)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-12px_rgba(43,31,22,0.35)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#2B1F16] via-[#3E2D20] to-[#2B1F16] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[radial-gradient(circle_at_center,white,transparent)] blur-xl transition-opacity duration-500" />

              <span className="relative z-10 flex items-center gap-3 text-xs md:text-sm uppercase tracking-[0.25em] font-medium">
                Start Explore
                <span className="hero-arrow inline-flex">→</span>
              </span>
            </button>
          </div>

          <div className="absolute bottom-10 left-0 right-0 hero-fade hero-fade-delay-4">
            <button
              onClick={() => navigate('/about')}
              className="text-[10px] uppercase tracking-[0.2em] text-[#2B1F16]/40 hover:text-[#2B1F16]/80 transition-colors duration-300"
            >
              Learn More
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Home
