import { useTranslation } from 'react-i18next'
import Section from '../components/Section'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const questionsKeys = [
  { key: 'q1', optionsKey: 'q1Options' },
  { key: 'q2', optionsKey: 'q2Options' },
  { key: 'q3', optionsKey: 'q3Options' },
]

type Answers = { [key: string]: string }

export default function Quiz() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Answers>({})

  const setAnswer = (qKey: string, value: string) => setAnswers((prev) => ({ ...prev, [qKey]: value }))

  const allAnswered = questionsKeys.every((q) => answers[q.key])

  const submit = () => {
    // TODO: persist to backend or global store
    navigate('/draw', { state: { answers } })
  }

  return (
    <div className="space-y-4">
      <Section title={t('quiz.title')}>
        <p className="text-text">{t('quiz.subtitle')}</p>
        <p className="text-subtext text-sm">{t('quiz.hint')}</p>
      </Section>
      {questionsKeys.map((q) => {
        const opts = t(`quiz.${q.optionsKey}`, { returnObjects: true }) as string[]
        return (
          <Section key={q.key} title={t(`quiz.${q.key}`)}>
            <div className="grid gap-2 sm:grid-cols-2">
              {opts.map((opt, idx) => {
                const selected = answers[q.key] === opt
                return (
                  <button
                    key={idx}
                    onClick={() => setAnswer(q.key, opt)}
                    className={`text-left px-3 py-3 rounded-card border transition ${
                      selected ? 'border-primary bg-primary/10 text-text' : 'border-black/5 bg-white hover:border-primary/50'
                    }`}
                  >
                    <div className="text-text">{opt}</div>
                  </button>
                )
              })}
            </div>
          </Section>
        )
      })}
      <div className="flex gap-3">
        <button
          disabled={!allAnswered}
          onClick={submit}
          className={`px-4 py-2 rounded-full ${allAnswered ? 'bg-primary text-white' : 'bg-black/10 text-subtext cursor-not-allowed'}`}
        >
          {t('quiz.next')}
        </button>
        <button onClick={() => i18n.changeLanguage(i18n.language.startsWith('zh') ? 'en' : 'zh')} className="text-primary">
          {t('common.language')}
        </button>
      </div>
    </div>
  )
}
