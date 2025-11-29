import React from 'react'
import { PerfumeChapter } from '../api'

interface PerfumePageProps {
  chapter: PerfumeChapter
  onComplete: () => void
  answers?: Record<string, string> // 问卷答案，用于选择背景图
}

import { BACKGROUND_IMAGES } from '../config/perfume-constants'

import { useTranslation } from 'react-i18next'
import bgImage from '../assets/bg.png'

const PerfumePage: React.FC<PerfumePageProps> = ({ chapter, onComplete, answers }) => {
  const { t } = useTranslation()
  const tags = chapter.tags ?? []
  const description = chapter.description ?? ''
  const quote = chapter.quote ?? ''

  // 根据问卷答案选择背景图 (使用 Q4 答案)
  const scentAnswer = answers?.['4']
  const rightImage = (scentAnswer && BACKGROUND_IMAGES[scentAnswer]) || BACKGROUND_IMAGES.default

  return (
    <div className="relative min-h-screen w-full bg-[#E8DCC5] overflow-hidden flex">
      {/* 左侧内容区域 - 占 2/3 */}
      <div className="relative w-2/3 h-screen overflow-hidden">
        {/* 左侧背景图 (模糊) */}
        <div className="absolute inset-0 z-0">
           <img 
             src={bgImage} 
             alt={t('perfume.bgAlt', 'Background')} 
             className="w-full h-full object-cover filter blur-md scale-110" // blur-md for blur, scale-110 to hide blurred edges
           />
           <div className="absolute inset-0 bg-[#E8DCC5]/60" /> {/* Overlay for readability */}
        </div>

        {/* 内容 */}
        <div className="relative z-10 h-full overflow-y-auto px-6 md:px-16 py-10 md:py-14">
          <div className="w-full max-w-[500px] flex flex-col gap-8">
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#A87B51] font-medium">{chapter.brandName}</p>
              </div>
              <div>
                <h2 className="text-3xl md:text-5xl font-serif text-[#2B1F16] leading-tight">{chapter.productName}</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {tags.map((tag, idx) => (
                  <span key={idx} className="text-xs uppercase tracking-wider text-[#2B1F16]/70 font-medium border-b border-[#D4A373]/30 pb-1">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="h-px bg-[#2B1F16]/10 w-full" />
              <div className="space-y-4">
                <p className="text-sm md:text-lg font-serif text-[#2B1F16] leading-relaxed">{description}</p>
                {quote && <p className="text-sm italic text-[#2B1F16]/70 font-serif">&quot;{quote}&quot;</p>}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-6">
              <button
                onClick={onComplete}
                className="w-fit px-8 py-3 rounded-full bg-[#2B1F16] text-[#F7F2ED] text-xs uppercase tracking-[0.22em] shadow-lg hover:-translate-y-0.5 transition"
              >
                {t('common.complete', 'Complete')}
              </button>
              <div className="text-xs uppercase tracking-widest text-[#A87B51]/70">
                {chapter.cardName} · {chapter.sceneChoice}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧图片区域 - 占 1/3 */}
      <div className="relative w-1/3 h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={rightImage}
            alt={t('perfume.imgAlt', 'Perfume Image')}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#E8DCC5]/20" />
        </div>
      </div>
    </div>
  )
}

export default PerfumePage
