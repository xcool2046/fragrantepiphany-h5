import Section from '../components/Section'
import { useTranslation } from 'react-i18next'
import { useLocation, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchInterpretation } from '../api'

export default function Result() {
  const { t } = useTranslation()
  const location = useLocation()
  const answers = (location.state as any)?.answers
  const cards = (location.state as any)?.cards
  const serverCards = (location.state as any)?.serverCards
  const [pastSummary, setPastSummary] = useState<string>('(Placeholder) Past summary here.')

  useEffect(() => {
    if (serverCards?.past) {
      setPastSummary(serverCards.past.summary)
      return
    }
    if (cards && cards[0]) {
      fetchInterpretation({
        card_name: cards[0].label,
        category: answers?.q1 || '',
        position: 'Past',
        language: 'en',
      })
        .then((d) => setPastSummary(d?.summary || pastSummary))
        .catch(() => {})
    }
  }, [cards, answers, serverCards])

  return (
    <div className="space-y-4">
      <Section title={t('result.freeTitle')}>
        <p className="text-text">{t('result.tagsTitle')}: {JSON.stringify(answers) || t('common.value') }</p>
        <p className="text-text">Cards: {cards ? cards.map((c: any) => c.label).join(', ') : 'N/A'}</p>
        <p className="text-subtext">{pastSummary}</p>
      </Section>
      <Section title={t('result.paywall')}>
        <p className="text-text">{t('result.price.cny')} / {t('result.price.usd')}</p>
        <Link to="/pay" state={{ answers, cards }} className="inline-block px-4 py-2 bg-primary text-white rounded-full mt-2">
          {t('result.cta')}
        </Link>
      </Section>
    </div>
  )
}
