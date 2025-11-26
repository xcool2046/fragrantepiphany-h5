import React from 'react'
import { motion } from 'framer-motion'
import { PerfumeChapter } from '../api'
import PerfumePyramid from './PerfumePyramid'
import FlowingTexture from './FlowingTexture'

interface PerfumePageProps {
  chapter: PerfumeChapter
  expanded: boolean
  onExpand: () => void
  onComplete: () => void
}

const PerfumePage: React.FC<PerfumePageProps> = ({ chapter, expanded, onExpand, onComplete }) => {
  const leftWidth = expanded ? 'md:w-4/5' : 'md:w-3/5'
  const rightWidth = expanded ? 'md:w-1/5' : 'md:w-2/5'
  const tags = chapter.tags ?? []
  const description = chapter.description ?? ''
  const quote = chapter.quote ?? ''

  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row bg-[#E8DCC5]">
      {/* Background texture (right side & global) */}
      <div className="absolute inset-0 pointer-events-none">
        <FlowingTexture />
      </div>

      {/* Left content */}
      <motion.div
        className={`relative z-10 ${leftWidth} transition-all duration-600 ease-out px-6 md:px-10 py-10 md:py-14 flex flex-col gap-8`}
        animate={{ width: expanded ? '80%' : '100%' }}
        >
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

        <div className="flex flex-col gap-4">
          {!expanded && (
            <button
              onClick={onExpand}
              className="self-start px-5 py-3 rounded-full border border-[#2B1F16]/20 bg-white/60 text-xs uppercase tracking-[0.2em] text-[#2B1F16] shadow-sm hover:shadow-md transition"
            >
              展开香调
            </button>
          )}
          {expanded && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <PerfumePyramid top={chapter.notes.top} heart={chapter.notes.heart} base={chapter.notes.base} />
            </motion.div>
          )}
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
      </motion.div>

      {/* Right background pane */}
      <motion.div
        className={`relative z-0 hidden md:block ${rightWidth} transition-all duration-600 ease-out`}
        animate={{ width: expanded ? '20%' : '40%' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#E8DCC5] via-[#F0E4D3] to-[#D4A373]/20 opacity-80" />
      </motion.div>
    </div>
  )
}

export default PerfumePage
