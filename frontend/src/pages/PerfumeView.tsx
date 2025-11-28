import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { getPerfumeChapters, PerfumeChapter } from '../api'
import PerfumePage from '../components/PerfumePage'

interface LocationState {
  cardIds?: number[]
  answers?: Record<string, string> // 问卷答案
}

const PerfumeView: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const cardIds = useMemo(() => {
    const state = (location.state as LocationState) || {}
    return state.cardIds || []
  }, [location.state])

  const answers = useMemo(() => {
    const state = (location.state as LocationState) || {}
    return state.answers || {}
  }, [location.state])

  const [chapters, setChapters] = useState<PerfumeChapter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  // Fetch perfume chapters
  useEffect(() => {
    if (cardIds.length === 0) {
      setError('No cards provided')
      return
    }

    const fetchChapters = async () => {
      try {
        setLoading(true)
        // Modified line: Pass i18n.language and handle response structure
        const res = await getPerfumeChapters(cardIds, i18n.language)
        setChapters(res.data.chapters)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch perfume chapters:', err)
        setError('Failed to load fragrance journey')
      } finally {
        setLoading(false)
      }
    }

    fetchChapters()
  }, [cardIds])

  // Filter chapters based on Q4 answer (scent preference)
  const chapter = useMemo(() => {
    if (chapters.length === 0) return undefined
    
    // Q4 answer (scent preference)
    const scentAnswer = answers['4']
    if (!scentAnswer) return chapters[0]

    // Fuzzy match logic
    // DB has "A. 玫瑰园", "午后被阳光烘暖的木质家具"
    // Question has "初夏清晨的玫瑰园", "午后被阳光烘暖的木质家具"
    const match = chapters.find(c => {
      const dbChoice = c.sceneChoice || ''
      
      // Exact match
      if (dbChoice === scentAnswer) return true
      
      // Partial match (e.g. "玫瑰园" in "初夏清晨的玫瑰园")
      // We check if key keywords from DB choice exist in user answer
      const keywords = dbChoice.replace(/^[A-Z]\.\s*/, '').split(/[\s,]+/)
      return keywords.some(k => scentAnswer.includes(k) || k.includes(scentAnswer))
    })

    return match || chapters[0]
  }, [chapters, answers])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8DCC5] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="w-12 h-12 border-4 border-[#2B1F16]/20 border-t-[#2B1F16] rounded-full" />
      </div>
    )
  }

  if (error || chapters.length === 0 || !chapter) {
    return (
      <div className="min-h-screen bg-[#E8DCC5] flex flex-col items-center justify-center gap-4 text-[#2B1F16] px-4">
        <p className="text-lg">{error || 'No fragrance journey found'}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-full bg-[#2B1F16] text-white text-sm tracking-wide font-serif">
          {t('journey.nav.back', 'Back')}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#E8DCC5] text-[#2B1F16] overflow-hidden">
      <div className="min-h-screen w-full relative">
        <PerfumePage
          chapter={chapter}
          expanded={expanded}
          onToggle={() => setExpanded(!expanded)}
          onComplete={() => navigate('/journey/complete')}
          answers={answers}
        />
      </div>
    </div>
  )
}

export default PerfumeView
