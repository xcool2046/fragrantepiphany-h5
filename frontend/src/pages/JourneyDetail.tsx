import React, { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { chapterById, getNextChapter, getPrevChapter, JourneyChapterId } from '../data/journey'

const JourneyDetail: React.FC = () => {
  const { chapterId = '' } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const chapter = chapterById[chapterId as JourneyChapterId]

  const notes = useMemo(() => {
    const raw = t(`${chapter?.keyPrefix}.notes`, { returnObjects: true }) as {
      top?: string
      topIcon?: string
      middle?: string
      middleIcon?: string
      base?: string
      baseIcon?: string
    }
    return raw || {}
  }, [chapter?.keyPrefix, t])

  const tarotInsight = useMemo(() => {
      const raw = t(`${chapter?.keyPrefix}.tarotInsight`, { returnObjects: true }) as {
          title?: string
          content?: string
      }
      return raw || {}
  }, [chapter?.keyPrefix, t])

  const atmosphere = t(`${chapter?.keyPrefix}.atmosphere`)

  if (!chapter) {
    navigate('/journey')
    return null
  }

  const prev = getPrevChapter(chapter.id)
  const next = getNextChapter(chapter.id)

  return (
    <div className="min-h-screen bg-[#F7F2ED] text-[#2B1F16] flex flex-col items-center justify-center p-4 md:p-8">
      {/* Card Container */}
      <div className="w-full max-w-md bg-[#FDFBF7] rounded-[32px] shadow-2xl overflow-hidden relative border border-[#E8DCC5]">
        
        {/* Top Section: Image & Chapter Info */}
        <div className="relative p-8 pb-4">
            {/* Chapter Header */}
            <div className="flex justify-between items-start mb-6 border-b border-[#D4A373]/30 pb-2">
                <div className="w-1/3">
                    <img src="/src/assets/flower_sketch.png" alt="botanical" className="w-full opacity-60 mix-blend-multiply" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
                <div className="text-right">
                    <h2 className="text-lg font-serif text-[#2B1F16] tracking-wide">{t(`${chapter.keyPrefix}.title`)}</h2>
                </div>
            </div>

            {/* Quote */}
            <div className="text-center mb-8">
                 <p className="font-serif text-sm italic text-[#2B1F16] mb-2">{t(`${chapter.keyPrefix}.quote`)}</p>
                 <p className="font-serif text-xs tracking-widest uppercase text-[#A87B51]">{t(`${chapter.keyPrefix}.name`)}</p>
            </div>

            {/* Perfume Image */}
            <div className="flex justify-center mb-8">
                <img 
                    src={chapter.image} 
                    alt={t(`${chapter.keyPrefix}.name`)} 
                    className="h-48 object-contain drop-shadow-lg mix-blend-multiply"
                />
            </div>
        </div>

        {/* Bottom Section: Details */}
        <div className="px-8 pb-12 space-y-6">
            
            {/* Notes */}
            <div className="space-y-3 font-serif text-xs text-[#5A4A3B] leading-relaxed">
                <div>
                    <p className="font-bold text-[#2B1F16]">{notes.top}</p>
                    {notes.topIcon && <p className="italic opacity-80 pl-4">({t('common.icon', 'Icon')}: {notes.topIcon})</p>}
                </div>
                <div>
                    <p className="font-bold text-[#2B1F16]">{notes.middle}</p>
                    {notes.middleIcon && <p className="italic opacity-80 pl-4">({t('common.icon', 'Icon')}: {notes.middleIcon})</p>}
                </div>
                <div>
                    <p className="font-bold text-[#2B1F16]">{notes.base}</p>
                    {notes.baseIcon && <p className="italic opacity-80 pl-4">({t('common.icon', 'Icon')}: {notes.baseIcon})</p>}
                </div>
            </div>

            {/* Tarot Insight */}
            {tarotInsight.title && (
                <div className="bg-[#F7F2ED]/50 p-4 rounded-xl border border-[#D4A373]/10">
                    <h3 className="font-serif text-sm text-[#A87B51] mb-2">{tarotInsight.title}</h3>
                    <p className="font-serif text-xs leading-relaxed whitespace-pre-line text-[#3E3025]">
                        {tarotInsight.content}
                    </p>
                </div>
            )}

            {/* Atmosphere */}
            {atmosphere && (
                <div className="font-serif text-xs leading-loose text-[#3E3025] text-justify opacity-90">
                     {atmosphere}
                </div>
            )}

        </div>

        {/* Navigation Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#FDFBF7] to-transparent flex justify-between items-end">
             {prev ? (
                 <button onClick={() => navigate(`/journey/${prev.id}`)} className="text-[#A87B51] hover:text-[#2B1F16] transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                     </svg>
                 </button>
             ) : (
                 <div />
             )}
             
             {next ? (
                 <button onClick={() => navigate(`/journey/${next.id}`)} className="text-[#A87B51] hover:text-[#2B1F16] transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                     </svg>
                 </button>
             ) : (
                 <button 
                    onClick={() => navigate('/journey/complete')}
                    className="text-xs uppercase tracking-widest text-[#A87B51] hover:text-[#2B1F16] transition-colors border-b border-transparent hover:border-[#2B1F16]"
                 >
                     {t('journey.nav.complete')}
                 </button>
             )}
        </div>

      </div>
    </div>
  )
}

export default JourneyDetail
