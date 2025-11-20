import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitQuestionnaire } from '../api'
import { motion, AnimatePresence } from 'framer-motion'

const questionsKeys = [
  { key: 'q1', optionsKey: 'q1Options' },
  { key: 'q2', optionsKey: 'q2Options' },
  { key: 'q3', optionsKey: 'q3Options' },
]

type Answers = { [key: string]: string }
type QuestionnairePayload = { q1: string; q2: string; q3: string }

export default function Quiz() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Answers>({})
  const [currentQIndex, setCurrentQIndex] = useState(0)

  const currentQ = questionsKeys[currentQIndex]
  const opts = currentQ
    ? ((t(`quiz.${currentQ.optionsKey}`, { returnObjects: true }) as string[]) || [])
    : []
  const isLastQuestion = currentQIndex === questionsKeys.length - 1
  const currentAnswer = currentQ ? answers[currentQ.key] : ''

  // 防御：数据异常直接返回首页，避免 optionsKey 报错
  useEffect(() => {
    if (!currentQ || !Array.isArray(opts) || opts.length === 0) {
      navigate('/', { replace: true })
    }
  }, [currentQ, opts, navigate])

  const handleContinue = (value: string) => {
    if (!currentQ) return
    const finalAnswers = {
      ...answers,
      [currentQ.key]: value,
    }

    if (isLastQuestion) {
      const payload = finalAnswers as QuestionnairePayload
      submitQuestionnaire(payload).catch(() => {})
      navigate('/draw', { state: { answers: finalAnswers } })
    } else {
      setCurrentQIndex((prev) => prev + 1)
    }
  }

  const setAnswer = (value: string) => {
    if (!currentQ) return
    setAnswers((prev) => ({ ...prev, [currentQ.key]: value }))
    // 自动进入下一题/结果，保留轻微延时避免误触
    window.setTimeout(() => handleContinue(value), 120)
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#1a1a1a] text-white flex flex-col pb-20">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-[url('/assets/bg-home.png')] bg-cover bg-center opacity-20 pointer-events-none" />

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.key}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md space-y-8"
          >
            {/* Question Title */}
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-serif text-gold/90 tracking-wide">
                {t(`quiz.${currentQ.key}`)}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {opts.map((opt, idx) => {
                const selected = currentAnswer === opt
                return (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      scale: selected ? 1.02 : 1,
                      borderColor: selected ? '#D4AF37' : 'rgba(255,255,255,0.1)',
                      backgroundColor: selected ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)'
                    }}
                    transition={{ duration: 0.3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAnswer(opt)}
                    className={`w-full text-left px-6 py-5 rounded-xl border transition-all duration-300 relative overflow-hidden group ${
                      selected 
                        ? 'border-gold bg-gold/20 shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30'
                    }`}
                    aria-pressed={selected}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-base font-light tracking-wide ${selected ? 'text-white' : 'text-white/70'}`}>
                        {opt}
                      </span>
                      {selected && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-gold shadow-glow"
                        />
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Gradient for depth */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent" />
    </div>
  )
}
