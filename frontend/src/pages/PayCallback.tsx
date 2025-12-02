import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const PayCallback: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [status, setStatus] = useState<'loading' | 'success' | 'cancel' | 'error'>('loading')
  
  const statusParam = searchParams.get('status')
  const orderId = searchParams.get('order_id')

  useEffect(() => {
    if (statusParam === 'success' && orderId) {
      // Immediate redirect on success
      navigate(`/result?orderId=${orderId}&status=success`, { replace: true })
    } else if (statusParam === 'cancel') {
      // Immediate redirect on cancel
      navigate('/result', { replace: true })
    } else {
      setStatus('error')
    }
  }, [statusParam, orderId, navigate])

  const handleBack = () => {
    navigate('/result')
  }

  return (
    <div className="min-h-screen w-full bg-[#E8DCC5] text-[#2B1F16] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {status === 'error' ? (
        <div className="z-10 max-w-md w-full bg-[#F7F2ED] rounded-2xl p-8 border border-[#D4A373]/30 text-center shadow-xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500 mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif mb-2">{t('pay.error_title', 'Something Went Wrong')}</h2>
            <p className="text-[#4A3B32] mb-8">{t('pay.error_desc', 'We could not process your request.')}</p>
            <button
              onClick={handleBack}
              className="w-full py-3 px-6 bg-[#2B1F16] text-[#E8DCC5] rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              {t('common.back', 'Go Back')}
            </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-[#D4A373]/30 border-t-[#D4A373] rounded-full animate-spin mb-4" />
            <p className="text-[#4A3B32] font-serif">{t('common.loading', 'Processing...')}</p>
        </div>
      )}
    </div>
  )
}

export default PayCallback
