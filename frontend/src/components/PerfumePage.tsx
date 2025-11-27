import React, { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { PerfumeChapter } from '../api'

interface PerfumePageProps {
  chapter: PerfumeChapter
  expanded: boolean
  onToggle: () => void // 改为切换函数
  onComplete: () => void
  answers?: Record<string, string> // 问卷答案，用于选择背景图
}

import bgOptionA from '../assets/perfume/bg_option_a.jpg'
import bgOptionB from '../assets/perfume/bg_option_b.jpg'
import bgOptionC from '../assets/perfume/bg_option_c.jpg'
import bgOptionD from '../assets/perfume/bg_option_d.jpg'



// 映射关系：根据 Q4 (气息问题) 的选项选择背景图
// 选项文本需与数据库(或 mock 数据)完全一致
const BACKGROUND_IMAGES: Record<string, string> = {
  // Option A: Rose Garden
  '初夏清晨的玫瑰园': bgOptionA,
  'Rose garden in early summer morning': bgOptionA,
  
  // Option B: Wooden Furniture
  '午后被阳光烘暖的木质家具': bgOptionB,
  'Sun-warmed wooden furniture in the afternoon': bgOptionB,

  // Option C: Bakery Scent
  '夜晚咖啡馆飘出的烘焙香气': bgOptionC,
  'Baking scent from a night cafe': bgOptionC,

  // Option D: White Soap
  '海边度假时的白色香皂': bgOptionD,
  'White soap during a seaside vacation': bgOptionD,

  default: bgOptionA
}

const PerfumePage: React.FC<PerfumePageProps> = ({ chapter, expanded, onToggle, onComplete, answers }) => {
  const tags = chapter.tags ?? []
  const description = chapter.description ?? ''
  const quote = chapter.quote ?? ''

  // 根据问卷答案选择背景图 (使用 Q4 答案)
  // 注意：answers 的 key 现在是 questionId (number string), Q4 的 ID 是 4
  const scentAnswer = answers?.['4']
  const backgroundImage = (scentAnswer && BACKGROUND_IMAGES[scentAnswer]) || BACKGROUND_IMAGES.default

  // 滑动手势检测
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isDragging = useRef(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isDragging.current = true
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return

    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const deltaX = currentX - touchStartX.current
    const deltaY = currentY - touchStartY.current

    // 只处理水平滑动
    if (Math.abs(deltaX) < Math.abs(deltaY)) return

    // 向左滑动展开 (查看大图) / 向右滑动收回 (恢复阅读)
    if (!expanded && deltaX < -50) {
      onToggle()
      isDragging.current = false
    } else if (expanded && deltaX > 50) {
      onToggle()
      isDragging.current = false
    }
  }, [expanded, onToggle])

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false
  }, [])

  // 鼠标事件（桌面端）
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    touchStartX.current = e.clientX
    touchStartY.current = e.clientY
    isDragging.current = true
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return

    const deltaX = e.clientX - touchStartX.current
    const deltaY = e.clientY - touchStartY.current

    if (Math.abs(deltaX) < Math.abs(deltaY)) return

    if (!expanded && deltaX < -50) {
      onToggle()
      isDragging.current = false
    } else if (expanded && deltaX > 50) {
      onToggle()
      isDragging.current = false
    }
  }, [expanded, onToggle])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  return (
    <div
      className="relative min-h-screen w-full bg-[#E8DCC5] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 背景图层（右侧，绝对定位） */}
      <motion.div
        className="absolute top-0 right-0 h-full overflow-hidden z-0"
        initial={{ width: '40%' }}
        animate={{ width: expanded ? '100%' : '40%' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} // 使用更优雅的缓动曲线
        onClick={() => expanded && onToggle()} // 点击大图也可以收回
      >
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt="香水背景"
            className="w-full h-full object-cover"
          />
          {/* 柔和遮罩 - 仅在非展开状态下显示左侧边缘遮罩，展开时减少遮挡 */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-l from-transparent via-[#E8DCC5]/10 to-[#E8DCC5]/40" 
            animate={{ opacity: expanded ? 0 : 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* 左侧内容区域 */}
      <motion.div
        className="relative z-10 h-screen overflow-y-auto"
        initial={{ opacity: 1, x: 0 }}
        animate={{ 
          opacity: expanded ? 0 : 1, 
          x: expanded ? -60 : 0,
          pointerEvents: expanded ? 'none' : 'auto'
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ paddingRight: '40%' }} // 预留右侧图片空间
      >
        <div className="min-h-full px-6 md:px-10 py-10 md:py-14">
          <div className="w-full max-w-[400px] flex flex-col gap-8">
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#A87B51] font-medium">{chapter.brandName}</p>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-serif text-[#2B1F16] leading-tight">{chapter.productName}</h2>
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
                <p className="text-sm md:text-base font-serif text-[#2B1F16] leading-relaxed">{description}</p>
                {quote && <p className="text-xs italic text-[#2B1F16]/70 font-serif">&quot;{quote}&quot;</p>}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-6">
              <button
                onClick={onComplete}
                className="px-6 py-3 rounded-full bg-[#2B1F16] text-[#F7F2ED] text-xs uppercase tracking-[0.22em] shadow-lg hover:-translate-y-0.5 transition"
              >
                完成
              </button>
              <div className="text-xs uppercase tracking-widest text-[#A87B51]/70">
                {chapter.cardName} · {chapter.sceneChoice}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PerfumePage
