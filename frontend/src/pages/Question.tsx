import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import { submitQuestionnaire } from '../api'

const QuestionPage: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [page, setPage] = useState(0) // 0 or 1
  const [answers, setAnswers] = useState<Record<string, string>>({})

  // Questions Data with i18n
  const QUESTIONS = [
    {
      id: 'q1',
      text: t('question.q1.text'),
      options: t('question.q1.options', { returnObjects: true }) as string[]
    },
    {
      id: 'q2',
      text: t('question.q2.text'),
      options: t('question.q2.options', { returnObjects: true }) as string[]
    },
    {
      id: 'q3',
      text: t('question.q3.text'),
      options: t('question.q3.options', { returnObjects: true }) as string[]
    },
    {
      id: 'q4',
      text: t('question.q4.text'),
      options: t('question.q4.options', { returnObjects: true }) as string[]
    },
    {
      id: 'q5',
      text: t('question.q5.text'),
      options: t('question.q5.options', { returnObjects: true }) as string[]
    },
    {
      id: 'q6',
      text: t('question.q6.text'),
      options: t('question.q6.options', { returnObjects: true }) as string[]
    }
  ]

  const QUESTIONS_PER_PAGE = 3
  const currentQuestions = QUESTIONS.slice(page * QUESTIONS_PER_PAGE, (page + 1) * QUESTIONS_PER_PAGE)
  
  const isPageComplete = currentQuestions.every(q => answers[q.id])
  const isAllComplete = QUESTIONS.every(q => answers[q.id])

  const handleOptionSelect = (qId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [qId]: option }))
  }

  const handleContinue = async () => {
    if (page === 0) {
      // 回到顶部后切换到第二页
      window.scrollTo(0, 0)
      setPage(1)
      return
    }

    if (!isAllComplete) return

    try {
      // 提交 6 题答案
      await submitQuestionnaire({
        q1: answers['q1'] || '',
        q2: answers['q2'] || '',
        q3: answers['q3'] || '',
        q4: answers['q4'] || '',
        q5: answers['q5'] || '',
        q6: answers['q6'] || '',
      })
    } catch (error) {
      console.error('Failed to submit questionnaire:', error)
      // 前端不阻塞流程，继续跳转
    }

    navigate('/draw', { state: { answers } })
  }

  return (
    <div className="min-h-screen w-full bg-background text-text px-4 py-12 pb-32">
      <div className="max-w-lg mx-auto">
        <h2 className="text-3xl text-text font-serif text-center mb-12">
          {page === 0 ? t('question.page1Title') : t('question.page2Title')}
          <span className="block text-xs font-sans text-subtext mt-3 tracking-widest uppercase">
            {t('question.step', { current: page + 1, total: 2 })}
          </span>
        </h2>

        <div className="space-y-10">
          {currentQuestions.map((q, idx) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="glass-panel p-8 border-white/60 shadow-card"
            >
              <h3 className="text-xl font-serif mb-6 text-text">{q.text}</h3>
              <div className="grid grid-cols-1 gap-3">
                {q.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(q.id, opt)}
                    className={clsx(
                      "py-3 px-5 rounded-xl text-left transition-all duration-300 border",
                      answers[q.id] === opt
                        ? "bg-[#8B5A2B]/10 border-[#8B5A2B] text-[#8B5A2B] shadow-sm font-medium"
                        : "bg-white/40 border-transparent text-subtext hover:bg-white/60"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#F7F2ED] via-[#F7F2ED]/90 to-transparent z-50 flex justify-center">
          <button
            disabled={page === 0 ? !isPageComplete : !isAllComplete}
            onClick={handleContinue}
            className={clsx(
              "w-full max-w-md py-4 rounded-full font-serif text-lg tracking-wider transition-all duration-500 shadow-lg",
              isPageComplete
                ? "bg-text text-white shadow-xl translate-y-0 opacity-100"
                : "bg-gray-300 text-gray-400 translate-y-4 opacity-0 pointer-events-none"
            )}
          >
            {page === 0 ? t('common.continue') : t('question.reveal')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuestionPage
