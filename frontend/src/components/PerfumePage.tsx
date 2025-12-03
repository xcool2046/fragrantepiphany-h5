import React from 'react'
import { PerfumeChapter } from '../api'
import { motion } from 'framer-motion'

interface PerfumePageProps {
  chapter: PerfumeChapter
  onComplete: () => void
  answers?: Record<string, string> // 问卷答案，用于选择背景图
}

import { BACKGROUND_IMAGES } from '../config/perfume-constants'

import { useTranslation } from 'react-i18next'
import bgImage from '../assets/bg.png'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

const imageVariants = {
  hidden: { opacity: 0, scale: 1.1 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 1.2,
      ease: "easeOut"
    }
  }
}

const PerfumePage: React.FC<PerfumePageProps> = ({ chapter, onComplete, answers }) => {
  const { t, i18n } = useTranslation()
  const { sentence } = chapter;
  const tags = chapter.tags ?? []
  const description = i18n.language === 'en' ? (chapter.description_en || '') : (chapter.description || '')


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
        <motion.div 
          className="relative z-10 h-full overflow-y-auto px-6 md:px-16 pt-10 md:pt-14 pb-4 md:pb-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="w-full max-w-[500px] flex flex-col items-center h-full">
            {/* Brand - Left Aligned */}
            <motion.div className="w-full text-left mb-8" variants={itemVariants}>
              <p className="text-2xl text-[#2B1F16]" style={{ fontFamily: "'Spectral SC', serif" }}>{chapter.brandName}</p>
            </motion.div>

            {/* Product Name - Centered */}
            <motion.div className="text-center mb-10" variants={itemVariants}>
              <h2 className="text-[#2B1F16] leading-tight whitespace-nowrap" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px' }}>{chapter.productName}</h2>
            </motion.div>

            {/* Tags - Centered Pills */}
            <motion.div className="flex justify-center gap-1.5 mb-8 flex-wrap w-full px-1" variants={itemVariants}>
              {tags.map((tag, idx) => {
                 const bgColors = ['bg-[#8B5A2B]', 'bg-[#656B2F]', 'bg-[#D97706]'];
                 const bgColor = bgColors[idx % bgColors.length];
                 return (
                  <span key={idx} className={`px-2.5 py-1 rounded-full text-white text-[9px] font-medium tracking-wide ${bgColor} whitespace-nowrap`}>
                    {tag}
                  </span>
                 )
              })}
            </motion.div>

            {/* Description (Result) - Centered */}
            <motion.div className="space-y-6 text-center mb-6 mt-4" variants={itemVariants}>
              <p className="text-sm md:text-base font-serif text-[#2B1F16]/80 leading-relaxed max-w-sm mx-auto">
                  {description}
              </p>
            </motion.div>

            {/* Bottom Section: Quote + Button */}
            <div className="mt-auto w-full flex flex-col items-center pb-2">
              {sentence && (
                <motion.div className="mb-8 text-center px-6" variants={itemVariants}>
                  <p className="font-serif italic text-[#4A3B32]/80 text-sm md:text-base leading-relaxed">
                    "{sentence}"
                  </p>
                </motion.div>
              )}

                {/* Button */}
                <motion.button
                    variants={itemVariants}
                    onClick={onComplete}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-12 py-4 rounded-full bg-gradient-to-r from-[#3E2723] to-[#5D4037] text-[#F7F2ED] text-sm font-serif tracking-wide shadow-xl border border-[#D4A373]/20 whitespace-nowrap"
                >
                    {t('perfume.customize', 'Customize scent card')}
                </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 右侧图片区域 - 占 1/3 */}
      <div className="relative w-1/3 h-screen overflow-hidden">
        <motion.div 
          className="absolute inset-0"
          variants={imageVariants}
          initial="hidden"
          animate="visible"
        >
          <img
            src={rightImage}
            alt={t('perfume.imgAlt', 'Perfume Image')}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#E8DCC5]/20" />
        </motion.div>
      </div>
    </div>
  )
}

export default PerfumePage
