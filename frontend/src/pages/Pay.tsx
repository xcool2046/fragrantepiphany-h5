import { useTranslation } from 'react-i18next'
import Section from '../components/Section'
import { useLocation } from 'react-router-dom'
import { createCheckout } from '../api'
import { useState } from 'react'

export default function Pay() {
  const { t } = useTranslation()
  const location = useLocation()
  const payload = location.state || {}
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePay = () => {
    setLoading(true)
    setError(null)
    createCheckout({ currency: 'usd', metadata: payload })
      .then((res) => {
        if (res.sessionUrl) {
          window.location.href = res.sessionUrl
        } else {
          setError('Missing session URL')
          setLoading(false)
        }
      })
      .catch(() => {
        setError('Failed to create session')
        setLoading(false)
      })
  }

  return (
    <Section title={t('pay.title')}>
      <p className="text-text">{t('pay.summary')}</p>
      <pre className="bg-black/5 p-3 rounded-card text-xs overflow-x-auto">{JSON.stringify(payload, null, 2)}</pre>
      <p className="text-subtext text-sm mb-2">{t('pay.note')}</p>
      <button
        onClick={handlePay}
        disabled={loading}
        className={`px-4 py-2 rounded-full ${loading ? 'bg-black/20 text-subtext' : 'bg-primary text-white'}`}
      >
        {loading ? 'Processing...' : t('pay.button')}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </Section>
  )
}
