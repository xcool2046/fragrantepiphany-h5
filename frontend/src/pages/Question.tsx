import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import { submitQuestionnaire, fetchQuestions, Question } from '../api'

import { MOCK_QUESTIONS } from '../constants/questions'
import QuestionSkeleton from '../components/QuestionSkeleton'

const QuestionPage: React.FC = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(0) // 0 or 1
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await fetchQuestions()
        if (data && data.length > 0) {
          setQuestions(data)
        } else {
          console.warn('No questions from API, using mock data')
          setQuestions(MOCK_QUESTIONS)
        }
      } catch (err) {
        console.error('Failed to fetch questions, using mock data', err)
        setQuestions(MOCK_QUESTIONS)
      } finally {
        setLoading(false)
      }
    }
    loadQuestions()
  }, [])

  const isZh = i18n.language.startsWith('zh')
  
  const QUESTIONS_PER_PAGE = 3
  const currentQuestions = questions.slice(page * QUESTIONS_PER_PAGE, (page + 1) * QUESTIONS_PER_PAGE)
  
  const isPageComplete = currentQuestions.every(q => answers[String(q.id)])
  const isAllComplete = questions.length > 0 && questions.every(q => answers[String(q.id)])

  const handleOptionSelect = (qId: number, option: string) => {
    setAnswers(prev => ({ ...prev, [String(qId)]: option }))
  }

  const handleContinue = async () => {
    const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE)
    if (page < totalPages - 1) {
      // Go to next page
      window.scrollTo(0, 0)
      setPage(prev => prev + 1)
      return
    }

    if (!isAllComplete) return

    // 立即保存到 localStorage，防止后续页面刷新丢失
    localStorage.setItem('last_answers', JSON.stringify(answers))

    try {
      // 提交答案
      await submitQuestionnaire(answers)
    } catch (error) {
      console.error('Failed to submit questionnaire:', error)
      // 前端不阻塞流程，继续跳转
    }

    navigate('/breath', { state: { answers } })
  }

  if (loading) {
    return <QuestionSkeleton />
  }

  return (
    <div className="min-h-screen w-full bg-background text-text px-4 py-12 pb-48">
      <div className="max-w-lg mx-auto">
        <h2 className="text-3xl text-text font-serif text-center mb-8">
          {page === 0 ? t('question.page1Title') : t('question.page2Title')}
          <span className="block text-xs font-sans text-subtext mt-3 tracking-widest uppercase">
            {t('question.step', { current: page + 1, total: Math.ceil(questions.length / QUESTIONS_PER_PAGE) })}
          </span>
        </h2>

        <div className="space-y-5">
          {currentQuestions.map((q, idx) => {
            const title = isZh ? q.title_zh : q.title_en
            const options = isZh ? (q.options_zh || []) : (q.options_en || [])
            
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.4 }}
                className="glass-panel p-8 border-white/60 shadow-card"
              >
                <h3 className="text-xl font-serif mb-6 text-text">
                  <span className="text-[#D4A373] mr-2 text-lg font-sans tracking-wider inline-block">
                    {String(page * QUESTIONS_PER_PAGE + idx + 1).padStart(2, '0')}.
                  </span>
                  {title}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleOptionSelect(q.id, opt)}
                      className={clsx(
                        "py-3 px-5 rounded-xl text-left transition-all duration-300 border",
                        answers[String(q.id)] === opt
                          ? "bg-[#8B5A2B]/10 border-[#8B5A2B] text-[#8B5A2B] shadow-sm font-medium"
                          : "bg-white/40 border-transparent text-subtext hover:bg-white/60"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Standard Pill Button (Not Fixed Bottom Bar) */}
        <div className="mt-12 mb-12 flex justify-center">
          <button
            disabled={page === 0 ? !isPageComplete : !isAllComplete}
            onClick={handleContinue}
            className={clsx(
              "px-12 py-3 rounded-full font-serif text-sm tracking-widest uppercase transition-all duration-500 shadow-md transform active:scale-95",
              (page === 0 ? isPageComplete : isAllComplete)
                ? "bg-text text-white hover:opacity-90"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
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
