import { useTranslation } from 'react-i18next'
import Section from '../components/Section'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Pay() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const payload = location.state || {}

  const handlePay = () => {
    // TODO: call backend to create Stripe session; here redirect mock
    navigate('/pay/callback?status=success', { state: payload })
  }

  return (
    <Section title={t('pay.title')}>
      <p className="text-text">{t('pay.summary')}</p>
      <pre className="bg-black/5 p-3 rounded-card text-xs overflow-x-auto">{JSON.stringify(payload, null, 2)}</pre>
      <p className="text-subtext text-sm mb-2">{t('pay.note')}</p>
      <button onClick={handlePay} className="px-4 py-2 bg-primary text-white rounded-full">
        {t('pay.button')}
      </button>
    </Section>
  )
}
