import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

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

const JourneyComplete: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F7F2ED] text-[#2B1F16] flex items-center justify-center px-6 py-12">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <p className="text-xl md:text-2xl font-serif leading-relaxed text-[#2B1F16]/85">
          <TypewriterText text={t('journey.complete.desc')} speed={50} />
        </p>
        <div className="flex justify-center gap-4 animate-fade-in" style={{ animationDelay: '2s' }}>
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
        </div>
      </div>
    </div>
  )
}

export default JourneyComplete
