import { useTranslation } from 'react-i18next'
import Section from '../components/Section'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { fetchDraw } from '../api'

type Card = { id: number; label: string }
const mockCards: Card[] = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, label: `Card ${i + 1}` }))

export default function Draw() {
  const { t } = useTranslation()
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const presetAnswers = (location.state as any)?.answers
  const [selected, setSelected] = useState<Card[]>([])
  const [loading, setLoading] = useState(false)
  const [serverCards, setServerCards] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDraw(presetAnswers?.q1, i18n.language.startsWith('zh') ? 'zh' : 'en')
      .then((data) => {
        setServerCards(data)
      })
      .catch(() => setError('Draw failed'))
  }, [presetAnswers, i18n.language])

  const addCard = (card: Card) => {
    if (selected.find((c) => c.id === card.id) || selected.length >= 3) return
    const next = [...selected, card]
    setSelected(next)
    if (next.length === 3) {
      setLoading(true)
      setTimeout(() => {
        navigate('/result', { state: { answers: presetAnswers, cards: next, serverCards } })
      }, 700)
    }
  }

  const slotLabels = [t('draw.slots.past'), t('draw.slots.now'), t('draw.slots.future')]

  return (
    <div className="space-y-4">
      <Section title={t('draw.title')}>
        <p className="text-text">{t('draw.tipTop')}</p>
        <p className="text-subtext text-sm">{t('draw.tipBottom')}</p>
      </Section>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-3">
          {slotLabels.map((label, idx) => (
            <div key={idx} className="h-20 rounded-card border border-dashed border-primary/50 flex items-center justify-center bg-white/70">
              <span className="text-subtext">{selected[idx]?.label ?? label}</span>
            </div>
          ))}
        </div>
        <div className="md:col-span-2">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            <AnimatePresence>
              {mockCards.map((card) => (
                <motion.button
                  key={card.id}
                  onClick={() => addCard(card)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className={`h-24 rounded-card border ${
                    selected.find((c) => c.id === card.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-black/5 bg-white hover:border-primary/40'
                  } flex items-center justify-center text-subtext`}
                >
                  {card.label}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {loading && <div className="text-primary">{t('draw.loading')}</div>}
    </div>
  )
}
