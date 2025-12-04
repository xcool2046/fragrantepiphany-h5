import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import { submitQuestionnaire, fetchQuestions, Question } from '../api'
import QuestionSkeleton from '../components/QuestionSkeleton'

const QuestionPage: React.FC = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(0) // 0 or 1
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadQuestions = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await fetchQuestions()
      if (data && data.length > 0) {
        setQuestions(data)
      } else {
        console.warn('No questions from API, questions list is empty')
        setQuestions([])
        setError(t('question.loadEmpty', '题库为空，请稍后重试'))
      }
    } catch (err) {
      console.error('Failed to fetch questions', err)
      setQuestions([])
      setError(t('question.loadFailed', '题库加载失败，请稍后重试'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  const isZh = i18n.language.startsWith('zh')
  
  const QUESTIONS_PER_PAGE = 3
  const currentQuestions = questions.slice(page * QUESTIONS_PER_PAGE, (page + 1) * QUESTIONS_PER_PAGE)
  
  const isPageComplete = currentQuestions.every(q => answers[String(q.id)])
  const isAllComplete = questions.length > 0 && questions.every(q => answers[String(q.id)])

  const handleOptionSelect = (qId: number, option: string) => {
    setAnswers(prev => ({ ...prev, [String(qId)]: option }))
  }

  const handleContinue = async () => {
    if (error || questions.length === 0) return
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

  if (error) {
    return (
      <div className="min-h-screen w-full bg-background text-text px-4 py-12 flex items-center justify-center">
        <div className="max-w-md w-full glass-panel p-8 text-center space-y-4">
          <h2 className="text-2xl font-serif text-text">{t('question.loadFailedTitle', '问卷加载失败')}</h2>
          <p className="text-subtext">{error}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={loadQuestions}
              className="px-6 py-3 rounded-full bg-text text-white text-sm tracking-wide font-serif hover:opacity-90"
            >
              {t('common.retry', '重试')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-full bg-white border text-text text-sm tracking-wide font-serif hover:border-text/50"
            >
              {t('common.back', '返回首页')}
            </button>
          </div>
        </div>
      </div>
    )
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
