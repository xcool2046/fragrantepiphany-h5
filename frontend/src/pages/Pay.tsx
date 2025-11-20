import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { createCheckout } from '../api'
import { useEffect, useMemo, useState } from 'react'

export default function Pay() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const payload = useMemo<Record<string, unknown>>(() => (location.state as Record<string, unknown> | null) || {}, [location.state])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // User requested to always use USD and let Stripe/Alipay handle conversion
    const currency = 'usd';
    
    const createSession = async () => {
      try {
        // Create checkout session
        const res = await createCheckout({ currency, metadata: payload })
        
        // Redirect to Stripe
        if (res.sessionUrl) {
          window.location.href = res.sessionUrl
        } else {
          setError('Failed to create payment session')
        }
      } catch (err) {
        console.error('Payment error:', err)
        setError('Failed to initialize payment. Please try again.')
      }
    }

    createSession()
  }, [i18n.language, payload, t])

  // If error occurred, show retry button
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F7F0E5]">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-serif text-[#2B1F16]">{error}</h2>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-[#D4A373] text-[#2B1F16] rounded-full font-bold shadow-lg hover:bg-[#C49BA3] transition active:scale-95"
            >
              {t('pay.retry')}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full px-6 py-3 bg-white text-[#6B5542] rounded-full font-medium border border-[#D4A373]/30 hover:bg-[#F3E6D7] transition"
            >
              {t('common.back')}
            </button>
            {/* Mock Pay Button (Dev Only) */}
            {import.meta.env.DEV && (
              <button 
                onClick={() => window.location.href = '/result?mock_pay=true'}
                className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-gray-600 underline"
              >
                [DEV] Mock Pay (Test Only)
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F7F0E5]">
      <div className="text-center space-y-6">
        {/* Animated Loading Spinner */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 border-4 border-[#D4A373]/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#D4A373] rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-3 bg-gradient-to-br from-[#D4A373]/20 to-[#C49BA3]/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">✨</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-serif text-[#2B1F16]">{t('pay.redirecting', 'Preparing your checkout...')}</h3>
          <p className="text-sm text-[#6B5542]">{t('pay.pleaseWait', 'Please wait a moment')}</p>
        </div>
      </div>
    </div>
  )
}
