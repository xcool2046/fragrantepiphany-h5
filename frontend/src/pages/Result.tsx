import Section from '../components/Section'
import { useTranslation } from 'react-i18next'
import { useLocation, Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getOrder } from '../api'

export default function Result() {
  const { t } = useTranslation()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  
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
    if (paymentStatus === 'success' && orderId) {
      setLoading(true)
      getOrder(orderId)
        .then((order) => {
          if (order.status === 'succeeded') {
            setIsPaid(true)
            // In a real app, we would fetch the full result associated with the order
            // For now, we might need to re-fetch or use stored data. 
            // Since we don't have a backend "get result by order" yet, 
            // we'll assume the user came back and we need to show the "Paid" view.
            // Ideally, the backend should return the result in the order or a separate endpoint.
            // Let's assume we can get it or just unlock the view if we have the data.
            
            // If we lost state (page refresh), we might be in trouble without a backend persistence for results.
            // For this demo, let's assume we still have state or we re-fetch.
            // But wait, if we redirect from Stripe, we lose `location.state`.
            // So we MUST fetch the result from backend using orderId or session.
            // The current `api.ts` doesn't have `getResultByOrder`.
            // We'll mock it or just show a success message for now.
          }
        })
        .finally(() => setLoading(false))
    }
  }, [paymentStatus, orderId])

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
    <Section title={title}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-24 bg-[#2B1F16] rounded border border-[#D4A373] flex items-center justify-center text-xs text-[#F3E6D7] text-center p-1">
          {card?.label}
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-lg text-[#2B1F16]">{card?.label}</h3>
          {/* <p className="text-xs text-[#6B5542]">Keywords...</p> */}
        </div>
      </div>
      <p className="text-[#2B1F16] text-sm leading-relaxed whitespace-pre-wrap">{content?.summary || '...'}</p>
    </Section>
  )

  if (loading) return <div className="p-8 text-center">{t('draw.loading')}</div>

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif text-[#2B1F16]">{t('result.tagsTitle')}</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {stateAnswers && Object.values(stateAnswers).map((ans: any, i) => (
            <span key={i} className="px-3 py-1 bg-white rounded-full text-xs text-[#6B5542] shadow-sm border border-[#E5E5E5]">
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
                // Fallback: Copy to clipboard
                navigator.clipboard.writeText(window.location.href)
                alert(t('common.copied')) // Ensure this key exists or use hardcoded for now
              }
            }}
            className="px-3 py-1 bg-[#D4A373] rounded-full text-xs text-[#2B1F16] shadow-sm hover:bg-[#C49BA3] transition flex items-center gap-1"
          >
            <i className="fas fa-share-alt"></i> Share
          </button>
        </div>
      </div>

      {/* Past (Always Visible) */}
      {renderCardSection(t('result.freeTitle'), pastCard, fullResult?.past)}

      {/* Paywall / Paid Content */}
      {!isPaid ? (
        <div className="relative">
          {/* Blurred Preview */}
          <div className="blur-sm select-none opacity-50 pointer-events-none">
             {renderCardSection(t('result.paidSections.now'), nowCard, { summary: 'LOCKED CONTENT LOCKED CONTENT' })}
          </div>
          
          {/* Paywall Overlay - Sticky Bottom */}
          <div className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-[#F7F0E5] via-[#F7F0E5]/90 to-transparent pb-8">
            <div className="bg-white/95 backdrop-blur p-4 rounded-xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border border-[#D4A373]/30 max-w-md mx-auto flex flex-col items-center gap-3">
              <div className="text-center">
                 <h3 className="text-base font-serif text-[#2B1F16]">{t('result.paywall')}</h3>
                 <p className="text-xs text-[#6B5542]">{t('about.youGet.0')}</p>
              </div>
              
              <Link 
                to="/pay" 
                state={{ answers: stateAnswers, cards: stateCards, serverCards: stateServerCards }} 
                className="w-full flex items-center justify-between px-6 py-3 bg-[#D4A373] text-[#2B1F16] rounded-full font-bold shadow-lg hover:bg-[#C49BA3] transition"
              >
                <span>{t('result.cta')}</span>
                <span>{t('result.price.cny')} / {t('result.price.usd')}</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Paid Content */}
          {renderCardSection(t('result.paidSections.now'), nowCard, fullResult?.now)}
          {renderCardSection(t('result.paidSections.future'), futureCard, fullResult?.future)}
          
          {/* Recommendations */}
          <Section title={t('result.paidSections.recommendation')}>
             <p className="text-[#2B1F16] text-sm">
               {fullResult?.recommendation ? JSON.stringify(fullResult.recommendation) : 'Perfume recommendations will appear here.'}
             </p>
          </Section>
        </>
      )}
    </div>
  )
}
