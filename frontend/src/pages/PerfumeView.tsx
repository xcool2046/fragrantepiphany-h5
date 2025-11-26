import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { getPerfumeChapters, PerfumeChapter } from '../api'
import PerfumePage from '../components/PerfumePage'

interface LocationState {
  cardIds?: number[]
}

const PerfumeView: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const cardIds = useMemo(() => {
    const state = (location.state as LocationState) || {}
    return state.cardIds || []
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
        const data = await getPerfumeChapters(cardIds)
        setChapters(data)
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

  const chapter = chapters[0]

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
          onExpand={() => setExpanded(true)}
          onComplete={() => navigate('/journey/complete')}
        />
      </div>
    </div>
  )
}

export default PerfumeView
