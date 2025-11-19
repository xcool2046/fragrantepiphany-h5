
import { useTranslation } from 'react-i18next'
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getOrder } from '../api'

export default function Result() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Data from Draw page
  const stateAnswers = (location.state as any)?.answers
  const stateCards = (location.state as any)?.cards
  const stateServerCards = (location.state as any)?.serverCards

  // Data from Payment Callback
  const orderId = searchParams.get('order_id')
  const paymentStatus = searchParams.get('status')

  const [isPaid, setIsPaid] = useState(false)
  const [fullResult, setFullResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Initialize with state data if available
  useEffect(() => {
    if (stateServerCards) {
      setFullResult(stateServerCards)
    }
  }, [stateServerCards])

  // Check payment status if returning from Stripe
  useEffect(() => {
    const mockPay = searchParams.get('mock_pay') === 'true'
    
    if (mockPay) {
      setIsPaid(true)
      return
    }

    if (paymentStatus === 'success' && orderId) {
      setLoading(true)
      getOrder(orderId)
        .then((order) => {
          if (order.status === 'succeeded') {
            setIsPaid(true)
          }
        })
        .finally(() => setLoading(false))
    }
  }, [paymentStatus, orderId, searchParams])

  // If we have stateCards but no serverCards (e.g. direct navigation?), fetch them
  useEffect(() => {
    if (stateCards && !stateServerCards && !fullResult) {
       // Fetch logic if needed
    }
  }, [stateCards, stateServerCards, fullResult])

  const pastCard = stateCards?.[0]
  const nowCard = stateCards?.[1]
  const futureCard = stateCards?.[2]

  // Helper to render card section
  const renderCardSection = (title: string, card: any, content: any) => (
    <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-card relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/10 rounded-full blur-3xl group-hover:bg-gold/20 transition-all duration-500"></div>
      
      <h3 className="text-sm text-gold uppercase tracking-[0.2em] mb-6 font-medium border-b border-gold/20 pb-2 inline-block">{title}</h3>
      
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <div className="w-32 h-48 bg-gradient-to-br from-[#2B1F16] to-[#1a120d] rounded-xl border border-gold/30 flex items-center justify-center relative shadow-lg group-hover:scale-[1.02] transition-transform duration-500">
             <div className="absolute inset-0 opacity-30 bg-[url('/assets/pattern.png')] bg-cover mix-blend-overlay"></div>
             <div className="absolute inset-0 border border-white/10 rounded-xl"></div>
             <span className="absolute bottom-4 text-gold/90 text-xs font-serif tracking-widest uppercase text-center px-2">{card?.label}</span>
          </div>
        </div>
        
        <div className="flex-1 space-y-3">
          <h4 className="font-serif text-2xl text-text">{card?.label}</h4>
          <div className="w-12 h-0.5 bg-gold/50"></div>
          <p className="text-text text-base leading-relaxed font-light whitespace-pre-wrap opacity-90">
            {content?.summary || '...'}
          </p>
        </div>
      </div>
    </div>
  )

  const handlePay = () => {
    navigate('/pay', { 
      state: { 
        answers: stateAnswers, 
        cards: stateCards, 
        serverCards: stateServerCards 
      } 
    })
  }

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-gold/30 border-t-gold"></div>
      <p className="text-gold font-serif tracking-widest uppercase text-sm">{t('draw.loading')}</p>
    </div>
  )

  return (
    <div className="space-y-8 pb-[calc(env(safe-area-inset-bottom)+100px)] pt-4">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-serif text-text">{t('result.tagsTitle')}</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {stateAnswers && Object.values(stateAnswers).map((ans: any, i) => (
            <span key={i} className="px-4 py-1.5 bg-white/60 backdrop-blur-sm rounded-full text-xs font-medium text-subtext shadow-sm border border-white/50 tracking-wide">
              {ans}
            </span>
          ))}
          {/* Share Button */}
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Fragrant Epiphany Tarot',
                  text: 'Check out my Tarot reading!',
                  url: window.location.href,
                }).catch(console.error)
              } else {
                navigator.clipboard.writeText(window.location.href)
                alert(t('common.copied'))
              }
            }}
            className="px-4 py-1.5 bg-gold/10 backdrop-blur-sm rounded-full text-xs font-medium text-gold shadow-sm border border-gold/20 hover:bg-gold/20 transition flex items-center gap-2"
          >
            <i className="fas fa-share-alt"></i> Share
          </button>
        </div>
      </div>

      {/* Past (Always Visible) */}
      {renderCardSection(t('result.freeTitle'), pastCard, fullResult?.past)}

      {/* Paywall / Paid Content */}
      {!isPaid ? (
        <div className="relative mt-8">
          {/* Blurred Preview */}
          <div className="blur-md select-none opacity-40 pointer-events-none grayscale">
             {renderCardSection(t('result.paidSections.now'), nowCard, { summary: 'LOCKED CONTENT LOCKED CONTENT LOCKED CONTENT LOCKED CONTENT' })}
          </div>
          
          {/* Paywall Overlay */}
          {!isPaid && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 -mt-12">
              <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl border border-white/60 max-w-sm w-full relative overflow-hidden">
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-gold/20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center shadow-glow mb-6 cursor-pointer hover:scale-110 transition-transform duration-300" onClick={handlePay}>
                    <span className="text-2xl text-white">🔒</span>
                  </div>
                  
                  <h3 className="text-2xl font-serif text-text mb-3">{t('result.paywallTitle')}</h3>
                  <p className="text-subtext text-sm mb-8 leading-relaxed">{t('result.paywallDesc')}</p>
                  
                  <button
                    onClick={handlePay}
                    className="w-full py-4 bg-gradient-gold text-white rounded-full font-medium shadow-glow hover:shadow-lg hover:scale-[1.02] transition-all duration-300 tracking-wide text-lg"
                  >
                    {t('result.unlockButton')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Paid Content */}
          {renderCardSection(t('result.paidSections.now'), nowCard, fullResult?.now)}
          {renderCardSection(t('result.paidSections.future'), futureCard, fullResult?.future)}
          
          {/* Recommendations */}
          <div className="bg-gradient-to-br from-[#2B1F16] to-[#1a120d] rounded-2xl p-8 text-white relative overflow-hidden shadow-card">
             <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl"></div>
             <div className="absolute inset-0 opacity-10 bg-[url('/assets/pattern.png')] bg-cover"></div>
             
             <div className="relative z-10">
               <h3 className="text-sm text-gold uppercase tracking-[0.2em] mb-6 font-medium border-b border-gold/20 pb-2 inline-block">
                 {t('result.paidSections.recommendation')}
               </h3>
               <p className="text-white/90 text-base leading-relaxed font-light">
                 {fullResult?.recommendation ? JSON.stringify(fullResult.recommendation) : 'Perfume recommendations will appear here.'}
               </p>
             </div>
          </div>
        </>
      )}
    </div>
  )
}
