import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const Onboarding: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [step, setStep] = useState(0)

  const slides = [
    {
      id: 1,
      title: t('onboarding.slide1.title'),
      content: (
        <>
          <p className="mb-6 font-serif text-lg whitespace-pre-line">{t('onboarding.slide1.p1')}</p>
          <p className="mb-6 text-sm text-subtext leading-relaxed whitespace-pre-line">
            {t('onboarding.slide1.p2')}
          </p>
          <p className="mb-6 text-sm text-subtext leading-relaxed whitespace-pre-line">
            {t('onboarding.slide1.p3')}
          </p>
          {/* Conditionally render quote if it exists and is not empty */}
          {t('onboarding.slide1.quote', { defaultValue: '' }) && (
            <>
              <div className="w-12 h-px bg-primary/40 mx-auto mb-6 mt-6" />
              <p className="text-sm text-subtext/80 italic font-serif whitespace-pre-line">
                {t('onboarding.slide1.quote')}
              </p>
            </>
          )}
        </>
      )
    },
    {
      id: 2,
      title: t('onboarding.slide2.title'),
      content: (
        <>
          <p className="mb-6 font-serif text-lg">{t('onboarding.slide2.p1')}</p>
          <ul className="text-sm text-subtext space-y-4 mb-8 list-disc pl-5 text-left leading-relaxed">
            <li>{t('onboarding.slide2.list1')}</li>
            <li>{t('onboarding.slide2.list2')}</li>
            <li>{t('onboarding.slide2.list3')}</li>
            {/* Only render list4 if it exists (non-empty and not the key itself) */}
            {t('onboarding.slide2.list4', { defaultValue: '' }) && (
              <li>{t('onboarding.slide2.list4')}</li>
            )}
          </ul>
          <p className="text-primary font-medium text-sm whitespace-pre-line">
            {t('onboarding.slide2.p2')}
          </p>
        </>
      )
    }
  ]

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1)
    } else {
      navigate('/question')
    }
  }

  return (
    <div 
      className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center p-6 bg-background"
      onClick={() => step < slides.length - 1 && handleNext()}
    >
      {/* Background Texture */}
      <div className="absolute inset-0 z-0 opacity-30 bg-cover bg-center mix-blend-overlay" />
      
      <div className="relative z-10 max-w-md w-full glass-panel p-10 min-h-[60vh] flex flex-col justify-center text-center shadow-card">
        <AnimatePresence mode='wait'>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <h2 className="text-xl text-text mb-8 font-serif tracking-wider border-b border-primary/20 pb-4 w-full">
              {slides[step].title}
            </h2>
            
            <div className="font-sans text-text">
              {slides[step].content}
            </div>

            {step === slides.length - 1 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                className="mt-12 px-12 py-3 bg-text text-white rounded-full hover:opacity-90 transition-opacity duration-300 shadow-md font-serif tracking-widest text-sm uppercase active:scale-95 transform"
              >
                {t('onboarding.startBtn')}
              </motion.button>
            )}
            
            {step < slides.length - 1 && (
              <div className="mt-12 text-xs text-subtext/60 animate-bounce uppercase tracking-widest">
                {t('common.tapToContinue')}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-12 flex gap-3 z-20">
        {slides.map((_, idx) => (
          <div 
            key={idx}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${idx === step ? 'bg-primary w-6' : 'bg-primary/30'}`}
          />
        ))}
      </div>
    </div>
  )
}

export default Onboarding
