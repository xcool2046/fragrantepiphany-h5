// import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import '../index.css'

export default function About() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background text-text font-sans pt-20 px-6 pb-10">
      {/* Nav */}
      <button 
        onClick={() => navigate('/')} 
        className="fixed top-6 left-6 z-50 w-10 h-10 rounded-full bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center shadow-sm hover:scale-105 transition text-text"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-12"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full opacity-80 blur-xl"></div>
          <h1 className="text-4xl font-serif text-text relative z-10 -mt-12">{t('common.appName')}</h1>
          <p className="text-primary uppercase tracking-[0.2em] text-sm font-medium">{t('about.tagline')}</p>
        </div>

        {/* Content */}
        <div className="prose prose-stone mx-auto text-center">
          <p className="text-lg font-light leading-relaxed text-text/80">
            {t('about.intro1')}
          </p>
          <p className="text-lg font-light leading-relaxed text-text/80 mt-6">
            {t('about.intro2')}
          </p>
          
          <p className="text-xs font-light leading-relaxed text-text/50 mt-12 whitespace-pre-line">
            {t('about.disclaimer')}
          </p>
        </div>

        {/* Decorative Image Placeholder (using a gradient if image missing) */}
        <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-card bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
           <div className="text-primary/40 font-serif italic">Fragrant Epiphany</div>
        </div>

      </motion.div>
    </div>
  )
}
