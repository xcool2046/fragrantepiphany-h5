import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

const PayCallback: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [status, setStatus] = useState<'loading' | 'success' | 'cancel' | 'error'>('loading')
  
  const statusParam = searchParams.get('status')
  const orderId = searchParams.get('order_id')

  useEffect(() => {
    if (statusParam === 'success' && orderId) {
      setStatus('success')
    } else if (statusParam === 'cancel') {
      setStatus('cancel')
    } else {
      setStatus('error')
    }
  }, [statusParam, orderId])

  const handleContinue = () => {
    if (status === 'success') {
      // Navigate to result page or wherever appropriate
      // Assuming we want to go back to the result page to show the unlocked content
      navigate(`/result?orderId=${orderId}&status=success`)
    } else {
      // If cancelled or error, go back to result page to try again
      navigate('/result')
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.1),transparent_70%)]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 max-w-md w-full bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center"
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-300">{t('common.loading', 'Processing...')}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif mb-2">{t('pay.success_title', 'Payment Successful')}</h2>
            <p className="text-gray-400 mb-8">{t('pay.success_desc', 'Your content has been unlocked.')}</p>
            <button
              onClick={handleContinue}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              {t('common.continue', 'Continue')}
            </button>
          </div>
        )}

        {status === 'cancel' && (
          <div className="flex flex-col items-center">
             <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6 text-yellow-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif mb-2">{t('pay.cancel_title', 'Payment Cancelled')}</h2>
            <p className="text-gray-400 mb-8">{t('pay.cancel_desc', 'You have cancelled the payment.')}</p>
            <button
              onClick={handleContinue}
              className="w-full py-3 px-6 bg-white/10 border border-white/20 rounded-xl font-medium hover:bg-white/20 transition-colors"
            >
              {t('common.back', 'Go Back')}
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6 text-red-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif mb-2">{t('pay.error_title', 'Something Went Wrong')}</h2>
            <p className="text-gray-400 mb-8">{t('pay.error_desc', 'We could not process your request.')}</p>
            <button
              onClick={handleContinue}
              className="w-full py-3 px-6 bg-white/10 border border-white/20 rounded-xl font-medium hover:bg-white/20 transition-colors"
            >
              {t('common.back', 'Go Back')}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default PayCallback
