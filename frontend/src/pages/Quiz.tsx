import { useTranslation } from 'react-i18next'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitQuestionnaire } from '../api'
import { motion, AnimatePresence } from 'framer-motion'
import { tapSpring } from '../utils/interactionPresets'
import BackgroundBubbles from '../components/BackgroundBubbles'
import ClickBubbles from '../components/ClickBubbles'
import { PageTransitionOverlay } from '../components/PageTransitionOverlay'
import axios from 'axios'

type QuestionDTO = {
  id: number
  title_en: string
  title_zh?: string | null
  options_en?: string[] | null
  options_zh?: string[] | null
}

type Answers = { [key: string]: string }

export default function Quiz() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Answers>({})
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [questions, setQuestions] = useState<QuestionDTO[]>([])
  const [loading, setLoading] = useState(true)

  const currentQ = questions[currentQIndex]
  const opts = useMemo(() => {
    if (!currentQ) return []
    const lang = i18n.language.startsWith('zh') ? 'zh' : 'en'
    const arr = lang === 'zh' ? currentQ.options_zh : currentQ.options_en
    if (arr && Array.isArray(arr) && arr.length > 0) return arr
    return (t(`quiz.q${currentQIndex + 1}Options`, { returnObjects: true }) as string[]) || []
  }, [currentQ, currentQIndex, i18n.language, t])
  const isLastQuestion = currentQIndex === (questions.length || 3) - 1
  const currentAnswer = currentQ ? answers[`q${currentQIndex + 1}`] : ''
  // 触摸端禁用 hover 态，避免 iOS 长按后默认高亮
  const supportsHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches

  const bubbles = [
    { size: 250, x: '15%', y: '15%', color: 'rgba(155, 126, 189, 0.12)', blur: 70, opacity: 0.5, duration: 16, xOffset: 20, yOffset: -20 },
    { size: 200, x: '85%', y: '75%', color: 'rgba(139, 157, 195, 0.12)', blur: 60, opacity: 0.4, duration: 19, xOffset: -20, yOffset: 20 },
    { size: 220, x: '40%', y: '50%', color: 'rgba(212, 163, 115, 0.08)', blur: 60, opacity: 0.3, duration: 22, xOffset: 15, yOffset: 15 },
  ]

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get('/api/content/questions')
        const list = Array.isArray(res.data) ? res.data : []
        if (list.length > 0) {
          setQuestions(list)
          setLoading(false)
          return
        }
      } catch (e) {
        console.warn('Failed to fetch questions, fallback to locales', e)
      }
      // fallback: 3 个占位题
      const fallback: QuestionDTO[] = [1, 2, 3].map((idx) => ({
        id: idx,
        title_en: t(`quiz.q${idx}`),
        title_zh: t(`quiz.q${idx}`, { lng: 'zh' }),
        options_en: (t(`quiz.q${idx}Options`, { returnObjects: true }) as string[]) || [],
        options_zh: (t(`quiz.q${idx}Options`, { lng: 'zh', returnObjects: true }) as string[]) || [],
        active: true,
      })) as any
      setQuestions(fallback)
      setLoading(false)
    }
    fetchQuestions()
  }, [t, i18n.language, navigate])

  const handleContinue = (value: string) => {
    if (!currentQ) return
    const finalAnswers = {
      ...answers,
      [`q${currentQIndex + 1}`]: value,
    }

    if (isLastQuestion) {
      const payload = finalAnswers as any
      submitQuestionnaire(payload).catch(() => {})
      
      // Trigger exit animation
      setIsExiting(true)
      setTimeout(() => {
        navigate('/draw', { state: { answers: finalAnswers } })
      }, 500) // Wait for animation
    } else {
      setCurrentQIndex((prev) => prev + 1)
    }
  }

  const setAnswer = (value: string) => {
    if (!currentQ) return
    setAnswers((prev) => ({ ...prev, [`q${currentQIndex + 1}`]: value }))
    // 自动进入下一题/结果，保留轻微延时避免误触
    window.setTimeout(() => handleContinue(value), 120)
  }

  if (loading) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <motion.div 
      className="relative min-h-screen w-full overflow-hidden bg-background text-text flex flex-col pb-20 bg-noise"
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      <PageTransitionOverlay show={isExiting} variant="goldenGlow" />

      {/* Ambient Background - Purple/Blue Theme */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#9B7EBD]/12 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#8B9DC3]/12 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-gradient-to-br from-[#D4A373]/8 via-transparent to-[#9B7EBD]/8 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{animationDuration: '15s'}} />

      {/* Background Bubbles */}
      <div className="opacity-40">
        <BackgroundBubbles bubbles={bubbles} />
      </div>
      <ClickBubbles />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-end px-6 py-6">
        <div className="px-3 py-1 rounded-full bg-white/30 border border-[#D4A373]/20 backdrop-blur-sm text-xs font-medium tracking-widest text-[#6B5542]">
          EN
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col px-8 mt-4">
        {/* Progress */}
        <div className="flex items-center justify-center space-x-2 mb-8">
           <div className="h-[1px] w-12 bg-[#D4A373]/30"></div>
           <span className="text-[10px] tracking-[0.2em] text-[#D4A373] uppercase font-semibold">
             Question {currentQIndex + 1} / {questions.length || 3}
           </span>
           <div className="h-[1px] w-12 bg-[#D4A373]/30"></div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQIndex}
            initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex-1 flex flex-col"
          >
            {/* Question */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif text-[#2B1F16] leading-tight drop-shadow-sm">
                {i18n.language.startsWith('zh') ? currentQ.title_zh || currentQ.title_en : currentQ.title_en}
              </h2>
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4A373] to-transparent mx-auto mt-6" />
            </div>

            {/* Options */}
            <div className="flex-1 flex flex-col justify-center space-y-5">
              {opts.map((opt, index) => {
                const isSelected = currentAnswer === opt
                return (
                  <motion.button
                    {...tapSpring}
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    onClick={() => setAnswer(opt)}
                    className={`
                      relative w-full p-5 rounded-xl text-left transition-all duration-300 group overflow-hidden
                      ${isSelected 
                        ? 'bg-[#F7F2ED]/90 border-[#D4A373] shadow-[0_4px_20px_rgba(212,163,115,0.3)] scale-[1.02]' 
                        : `bg-white/40 border-white/40 ${supportsHover ? 'hover:bg-white/60 hover:border-[#D4A373]/40 hover:shadow-lg' : ''}`
                      }
                      border backdrop-blur-xl
                    `}
                  >
                    {/* Shimmer Effect on Hover */}
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#D4A373]' : `bg-[#D4A373]/30 ${supportsHover ? 'group-hover:bg-[#D4A373]/60' : ''}`} transition-colors`} />
                        <span className={`text-lg font-serif tracking-wide transition-colors ${isSelected ? 'text-[#2B1F16] font-medium' : `text-[#6B5542] ${supportsHover ? 'group-hover:text-[#2B1F16]' : ''}`}`}>
                          {opt}
                        </span>
                      </div>
                      
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="text-[#D4A373]"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </motion.div>
  )
}
