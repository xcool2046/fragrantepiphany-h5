import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { journeyChapters } from '../data/journey'

const JourneyHub: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F7F2ED] text-[#2B1F16] px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#A87B51] font-medium mb-2">
              {t('common.appName')}
            </p>
            <h1 className="text-3xl md:text-4xl font-serif leading-tight">{t('journey.hubTitle')}</h1>
            <p className="mt-3 text-[#2B1F16]/70">{t('journey.hubDesc')}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm rounded-full border border-[#2B1F16]/10 bg-white/70 shadow-sm hover:shadow-md transition"
          >
            {t('journey.nav.back')}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {journeyChapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => navigate(`/journey/${chapter.id}`)}
              className="group rounded-3xl bg-white/80 border border-[#D4A373]/25 shadow-[0_12px_32px_-18px_rgba(43,31,22,0.35)] hover:-translate-y-1 transition-all duration-400 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#F9F1E6] via-white to-[#F7F2ED] opacity-80" />
              <div className="p-6 relative flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-[#2B1F16]/5 flex items-center justify-center overflow-hidden shadow-inner">
                  <img
                    src={chapter.image}
                    alt={t(`${chapter.keyPrefix}.title`)}
                    className="w-20 h-20 object-contain mix-blend-multiply"
                    loading="lazy"
                  />
                </div>
                <div className="text-center space-y-1">
                  <div className="text-sm uppercase tracking-[0.25em] text-[#A87B51]">
                    {t('journey.chapterLabel', { order: chapter.order })}
                  </div>
                  <div className="text-xl font-serif">{t(`${chapter.keyPrefix}.title`)}</div>
                  <div className="text-sm text-[#2B1F16]/60">{t(`${chapter.keyPrefix}.subtitle`)}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default JourneyHub
