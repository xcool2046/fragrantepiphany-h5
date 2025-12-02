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
          <div className="w-full max-w-[500px] flex flex-col items-center h-full">
            {/* Brand - Left Aligned */}
            <div className="w-full text-left mb-8">
              <p className="text-2xl font-serif text-[#2B1F16]">{chapter.brandName}</p>
            </div>

            {/* Product Name - Centered */}
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-serif text-[#2B1F16] leading-tight">{chapter.productName}</h2>
            </div>

            {/* Tags - Centered Pills */}
            <div className="flex justify-center gap-3 mb-8 flex-wrap">
              {tags.map((tag, idx) => {
                 const bgColors = ['bg-[#8B5A2B]', 'bg-[#656B2F]', 'bg-[#D97706]'];
                 const bgColor = bgColors[idx % bgColors.length];
                 return (
                  <span key={idx} className={`px-5 py-1.5 rounded-full text-white text-xs font-medium tracking-wide ${bgColor} whitespace-nowrap`}>
                    {tag}
                  </span>
                 )
              })}
            </div>

            {/* Description (Result) - Centered */}
            <div className="space-y-6 text-center mb-6 mt-12">
              <p className="text-sm md:text-base font-serif text-[#2B1F16]/80 leading-relaxed max-w-sm mx-auto">
                  {description}
              </p>
            </div>

            {/* Bottom Section: Quote + Button */}
            <div className="mt-auto w-full flex flex-col items-center pb-6">
                {/* Quote (Sentence) */}
                {quote && (
                    <div className="text-center space-y-4 mb-8">
                        <p className="text-lg italic text-[#2B1F16] font-serif leading-relaxed px-4">&quot;{quote}&quot;</p>
                    </div>
                )}

                {/* Button */}
                <button
                    onClick={onComplete}
                    className="px-12 py-4 rounded-full bg-gradient-to-r from-[#3E2723] to-[#5D4037] text-[#F7F2ED] text-sm font-serif tracking-wide shadow-xl hover:-translate-y-0.5 transition border border-[#D4A373]/20 whitespace-nowrap"
                >
                    {t('perfume.customize', 'Customize scent card')}
                </button>
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
