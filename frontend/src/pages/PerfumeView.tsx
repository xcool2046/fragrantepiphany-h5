
import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getPerfumeChapters, PerfumeChapter } from '../api'
import PerfumePage from '../components/PerfumePage'
import GlobalLoading from '../components/GlobalLoading'

import { matchSceneChoice } from '../utils/perfume-matcher'

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

  // Fetch perfume chapters
  useEffect(() => {
    if (cardIds.length === 0) {
      setError(t('perfume.noCards', 'No cards provided'))
      return
    }

    const fetchChapters = async () => {
      try {
        setLoading(true)
        // Pass language + scent answer (prefer Q2, fallback Q4)
        const scentAnswer = answers['2'] || answers['4']
        
        // Map Q4 answer to category (Self/Career/Love)
        const mapCategory = (val?: string) => {
          if (!val) return 'Self';
          const first = val.trim().charAt(0).toUpperCase();
          if (first === 'B') return 'Career';
          if (first === 'C') return 'Love';
          return 'Self'; // Default to Self (A)
        };
        const category = mapCategory(answers['4']);

        const res = await getPerfumeChapters(cardIds, i18n.language, scentAnswer, category)

        setChapters(res.data.chapters)
        setError(null)
      } catch (err: any) {
        console.error('Failed to fetch perfume chapters:', err)
        const msg = err.response?.data?.message || err.message || t('perfume.loadFailed', 'Failed to load fragrance journey')
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    fetchChapters()
  }, [cardIds, i18n.language])

  // Filter chapters based on scent answer (prefer Q2, fallback Q4)
  const chapter = useMemo(() => {
    const scentAnswer = answers['2'] || answers['4']
    return matchSceneChoice(chapters, scentAnswer)
  }, [chapters, answers])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    // Preload SharePage to prevent "vibration" (loading state) on navigation
    import('./SharePage')
  }, [])

  if (loading) {
    return <GlobalLoading />
  }

  if (error || chapters.length === 0 || !chapter) {
    return (
      <div className="min-h-screen bg-[#E8DCC5] flex flex-col items-center justify-center gap-4 text-[#2B1F16] px-4">
        <p className="text-lg">{error || t('perfume.notFound', 'No fragrance journey found')}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-full bg-[#2B1F16] text-white text-sm tracking-wide font-serif">
          {t('common.back', 'Back')}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#E8DCC5] text-[#2B1F16] overflow-hidden">
      <div className="min-h-screen w-full relative">
        <PerfumePage
          chapter={chapter}
          onComplete={() => navigate('/share', { 
            state: { 
              perfumeName: chapter.productName, 
              sentence: chapter.sentence, 
              brandName: chapter.brandName 
            } 
          })}
          answers={answers}
        />
      </div>
    </div>
  )
}

export default PerfumeView
