import { useTranslation } from 'react-i18next'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitQuestionnaire } from '../api'

const questionsKeys = [
  { key: 'q1', optionsKey: 'q1Options' },
  { key: 'q2', optionsKey: 'q2Options' },
  { key: 'q3', optionsKey: 'q3Options' },
]

type Answers = { [key: string]: string }

export default function Quiz() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Answers>({})

  const setAnswer = (qKey: string, value: string) => setAnswers((prev) => ({ ...prev, [qKey]: value }))

  const allAnswered = questionsKeys.every((q) => answers[q.key])

  const submit = () => {
    submitQuestionnaire({
      q1: answers.q1,
      q2: answers.q2,
      q3: answers.q3,
    }).catch(() => {})
    navigate('/draw', { state: { answers } })
  }

  return (
    <div className="space-y-8 pb-32 pt-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif text-text">{t('quiz.title')}</h1>
        <p className="text-subtext font-light italic">{t('quiz.subtitle')}</p>
      </div>

      {questionsKeys.map((q) => {
        const opts = t(`quiz.${q.optionsKey}`, { returnObjects: true }) as string[]
        return (
          <div key={q.key} className="space-y-4">
            <h2 className="text-xl font-serif text-text px-2">{t(`quiz.${q.key}`)}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {opts.map((opt, idx) => {
                const selected = answers[q.key] === opt
                return (
                  <button
                    key={idx}
                    onClick={() => setAnswer(q.key, opt)}
                    className={`text-left px-6 py-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                      selected 
                        ? 'border-gold bg-gold/10 shadow-glow' 
                        : 'border-white/40 bg-white/40 backdrop-blur-sm hover:bg-white/60 hover:scale-[1.01]'
                    }`}
                  >
                    {selected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold"></div>
                    )}
                    <div className={`text-base font-medium ${selected ? 'text-text' : 'text-subtext group-hover:text-text'}`}>
                      {opt}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
      
      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F9F5F1] via-[#F9F5F1]/95 to-transparent flex items-center justify-center z-10 pb-[env(safe-area-inset-bottom,24px)]">
        <button
          disabled={!allAnswered}
          onClick={submit}
          className={`w-full max-w-md py-4 rounded-full font-semibold text-lg transition-all duration-300 active:scale-95 tracking-wide relative overflow-hidden group ${
            allAnswered
              ? 'bg-gradient-gold text-white shadow-glow hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer'
              : 'bg-black/5 text-black/20 cursor-not-allowed'
          }`}
        >
          {/* Subtle shine effect */}
          {allAnswered && (
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
          )}
          <span className="relative z-10">{t('quiz.next')}</span>
        </button>
      </div>
    </div>
  )
}
