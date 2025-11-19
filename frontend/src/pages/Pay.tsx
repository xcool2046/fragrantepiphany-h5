import { useTranslation } from 'react-i18next'
import Section from '../components/Section'
import { useLocation } from 'react-router-dom'
import { createCheckout } from '../api'
import { useState } from 'react'

export default function Pay() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const payload = location.state || {}
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currency, setCurrency] = useState<'cny' | 'usd'>(
    i18n.language.startsWith('zh') ? 'cny' : 'usd'
  )

  const handlePay = () => {
    setLoading(true)
    setError(null)
    createCheckout({ currency, metadata: payload })
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

  const priceDisplay = currency === 'cny' ? t('result.price.cny') : t('result.price.usd')

  return (
    <Section title={t('pay.title')}>
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-black/5">
          <span className="text-[#2B1F16] font-medium">{t('common.appName')}</span>
          <span className="text-[#D4A373] font-bold text-lg">{priceDisplay}</span>
        </div>

        {/* Currency Toggle */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setCurrency('usd')}
            className={`px-4 py-1 rounded-full text-sm border transition ${
              currency === 'usd' 
                ? 'bg-[#2B1F16] text-[#F3E6D7] border-[#2B1F16]' 
                : 'bg-transparent text-[#6B5542] border-[#D4A373]/50'
            }`}
          >
            USD ($5)
          </button>
          <button
            onClick={() => setCurrency('cny')}
            className={`px-4 py-1 rounded-full text-sm border transition ${
              currency === 'cny' 
                ? 'bg-[#2B1F16] text-[#F3E6D7] border-[#2B1F16]' 
                : 'bg-transparent text-[#6B5542] border-[#D4A373]/50'
            }`}
          >
            CNY (¥15)
          </button>
        </div>

        <p className="text-subtext text-sm text-center">{t('pay.note')}</p>
        
        <button
          onClick={handlePay}
          disabled={loading}
          className={`w-full px-4 py-3 rounded-full font-bold shadow-lg transition ${
            loading 
              ? 'bg-black/20 text-subtext cursor-not-allowed' 
              : 'bg-[#D4A373] text-[#2B1F16] hover:bg-[#C49BA3]'
          }`}
        >
          {loading ? 'Processing...' : t('pay.button')}
        </button>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>
    </Section>
  )
}
