import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import axios from 'axios'
import tarotData from '../assets/tarot_data.json'
import { tapSpring } from '../utils/interactionPresets'
import BackgroundBubbles from '../components/BackgroundBubbles'
import ClickBubbles from '../components/ClickBubbles'
import { useToast } from '../components/Toast'

type TarotCard = {
  id: number
  name_en: string
  name_cn?: string
  image?: string
  meaning?: Record<string, string>
}

type Interpretation = {
  interpretation?: string
  summary?: string
  action?: string
  future?: string
  recommendation?: string
}

// Helper to get card object by ID
const getCardById = (id: number) => (tarotData as TarotCard[]).find(c => c.id === id)

export default function Result() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const toast = useToast()
  
  // 1. Synchronous Data Recovery & Persistence
  // Initialize state directly to avoid "white flash"
  const [cards] = useState<TarotCard[]>(() => {
    let cardIds = location.state?.cards
    
    // Fallback to localStorage
    if (!cardIds) {
      const saved = localStorage.getItem('last_draw_ids')
      if (saved) {
        try {
          cardIds = JSON.parse(saved)
        } catch (e) {
          console.error('Failed to parse saved cards', e)
        }
      }
    }

    if (cardIds && cardIds.length > 0) {
      return cardIds.map((id: number) => getCardById(id)).filter(Boolean) as TarotCard[]
    }
    return []
  })

  const [interpretations, setInterpretations] = useState<Record<string, Interpretation>>({})
  const [isPaid, setIsPaid] = useState(false)
  const [loading, setLoading] = useState(() => cards.length === 0)

  const bubbles = [
    { size: 220, x: '20%', y: '30%', color: 'rgba(212, 163, 115, 0.15)', blur: 60, opacity: 0.5, duration: 14, xOffset: 20, yOffset: -15 },
    { size: 180, x: '70%', y: '70%', color: 'rgba(196, 155, 163, 0.15)', blur: 50, opacity: 0.4, duration: 17, xOffset: -15, yOffset: 20 },
  ]

  const handleShare = async () => {
    const shareData = {
      title: 'Tarot Reading Result',
      text: 'Check out my tarot reading result!',
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success(t('result.shareSuccess', 'Link copied to clipboard!'))
      }
    } catch (err) {
      console.error('Share failed:', err)
    }
  }

  useEffect(() => {
    // Redirect if no cards found
    if (cards.length === 0) {
      navigate('/draw', { replace: true })
    } else {
      setLoading(false)
    }
  }, [cards, navigate])

  // 2. Check Payment Status
  useEffect(() => {
    const checkPayment = async () => {
      // Mock Pay for Dev/Test (Dev only)
      // Mock Pay for Dev/Test (Enabled for Prod testing temporarily)
      if (searchParams.get('mock_pay') === 'true') {
        setIsPaid(true)
        return
      }

      // Real Payment Check (existing logic)
      const paymentStatus = searchParams.get('payment_status')
      const orderId = searchParams.get('order_id')
      
      if (paymentStatus === 'succeeded' && orderId) {
        try {
          // Verify with backend
          const res = await axios.get(`/api/pay/order/${orderId}`)
          if (res.data.status === 'paid' || res.data.status === 'succeeded') {
            setIsPaid(true)
          }
        } catch (err) {
          console.error('Payment verification failed', err)
        }
      }
    }
    checkPayment()
  }, [searchParams])

  // 3. Fetch Dynamic Interpretations from Backend
  useEffect(() => {
    if (cards.length === 0) return

    const fetchInterpretations = async () => {
      // UI 翻译用小写，API 查询用首字母大写形式（与后端/seed 数据一致）
      const positions = [
        { ui: 'past', api: 'Past', meaningKey: 'past' },
        { ui: 'now', api: 'Now', meaningKey: 'present' },
        { ui: 'future', api: 'Future', meaningKey: 'future' },
      ]
      const newInterps: Record<string, Interpretation> = {}

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i]
        const position = positions[i]
        
        try {
          // Try to fetch from API
          const res = await axios.get('/api/interp', {
            params: {
              card_name: card.name_en, // Use English name as key
              position: position.api,
              language: i18n.language // 'en' or 'zh'
            }
          })
          
          if (res.data) {
            newInterps[`${card.id}-${position.api}`] = res.data
          }
        } catch (err) {
          console.warn(`Failed to fetch interp for ${card.name_en}`, err)
        }
      }
      setInterpretations(newInterps)
    }

    fetchInterpretations()
  }, [cards, i18n.language])

  if (loading) return <div className="min-h-screen bg-[#F9F5F1]" />

  return (
    <motion.div 
      className="min-h-screen bg-[#F9F5F1] pb-[calc(env(safe-area-inset-bottom)+80px)] relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Texture - Enhanced */}
      <div className="absolute inset-0 bg-[url('/assets/bg-home.png')] bg-cover bg-center opacity-[0.08] pointer-events-none" />

      {/* Background Bubbles */}
      <div className="opacity-40">
        <BackgroundBubbles bubbles={bubbles} />
      </div>
      <ClickBubbles />

      {/* Header */}
      <div className="pt-8 pb-4 px-6 text-center relative z-10">
        <h1 className="font-serif text-2xl text-[#2B1F16] mb-1">{t('result.title', 'Your Reading')}</h1>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="flex overflow-x-auto snap-x snap-mandatory px-6 pb-8 gap-4 no-scrollbar relative z-10">
        {cards.map((card, index) => {
          const positions = [
            { ui: 'past', api: 'Past', meaningKey: 'past' },
            { ui: 'now', api: 'Now', meaningKey: 'present' },
            { ui: 'future', api: 'Future', meaningKey: 'future' },
          ]
          const position = positions[index]
          const interp = interpretations[`${card.id}-${position.api}`]
          
          // Determine if locked (Present/Future locked until paid)
          const isLocked = !isPaid && index > 0

          return (
            <div key={card.id} className="snap-center shrink-0 w-[85vw] md:w-[350px] flex flex-col">
              {/* Card Visual */}
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg mb-8 group bg-[#2B1F16]">
                <img 
                  src={`/cards/${card.image}`} 
                  alt={card.name_en} 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                  className={`w-full h-full object-cover transition-all duration-700 ${isLocked ? 'blur-md scale-110' : ''}`} 
                />
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.button
                      {...tapSpring}
                      onClick={() => navigate('/pay')}
                      className="group relative px-6 py-5 rounded-2xl bg-white/25 text-[#2B1F16] border border-white/60 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] flex flex-col items-center gap-2 hover:scale-[1.02] transition-transform"
                    >
                      <span className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4A373] to-[#a67c00] flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                        <svg className="w-7 h-7 text-[#1a120d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <span className="text-sm font-medium text-[#1a120d]">{t('result.unlockButton', 'Unlock Full Reading')}</span>
                      <span className="text-xs text-[#6B5542] opacity-90">
                        {t('result.unlockMessage', 'Tap to unlock the full insight')}
                      </span>
                    </motion.button>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <p className="text-[#D4A373] font-serif italic text-sm mb-2 opacity-90">
                    {t(`result.position.${position.ui}`, position.ui)}
                  </p>
                  <h3 className="text-white font-serif text-2xl tracking-wide">
                    {i18n.language === 'zh' ? card.name_cn : card.name_en}
                  </h3>
                </div>
              </div>

              {/* Interpretation Content */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D4A373]/10 flex-1 relative overflow-hidden">
                {isLocked ? (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-full max-w-sm rounded-2xl bg-white/70 border border-[#D4A373]/30 backdrop-blur-lg shadow-[0_15px_45px_rgba(0,0,0,0.18)] p-4">
                      <p className="text-[#6B5542] mb-4 font-serif italic">
                        {t('result.unlockMessage', 'Unlock to reveal the deeper meaning of your path.')}
                      </p>
                      <motion.button 
                        {...tapSpring}
                        onClick={() => navigate('/pay')}
                        className="hidden md:inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2B1F16] to-[#392a1e] text-[#D4A373] rounded-full font-medium text-sm shadow-lg hover:scale-[1.02] transition-transform"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        {t('result.unlockButton', 'Unlock Full Reading')}
                      </motion.button>
                    </div>
                  </div>
                ) : null}

                <div className={isLocked ? 'opacity-20 blur-sm' : ''}>
                  <h4 className="font-serif text-lg text-[#2B1F16] mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4A373]" />
                    {t('result.meaning', 'Meaning')}
                  </h4>
                  <p className="text-[#6B5542] text-sm leading-relaxed mb-6">
                    {/* Prefer API data, fallback to JSON (which is currently only CN) */}
                    {interp?.interpretation || interp?.summary || (
                      i18n.language === 'zh' 
                        ? card.meaning?.[position.meaningKey] ?? ''
                        : "Interpretation loading or not available in English yet."
                    )}
                  </p>

                  {interp?.action && (
                    <>
                      <h4 className="font-serif text-lg text-[#2B1F16] mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4A373]" />
                        {t('result.action', 'Advice')}
                      </h4>
                      <p className="text-[#6B5542] text-sm leading-relaxed">
                        {interp.action}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-[#D4A373]/10 flex justify-between items-center md:hidden">
        <button onClick={() => navigate('/')} className="p-2 text-[#2B1F16]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </button>
        {!isPaid && (
           <motion.button 
             {...tapSpring}
             onClick={() => navigate('/pay')}
             className="flex-1 mx-4 py-3 bg-[#2B1F16] text-[#D4A373] rounded-full font-medium text-sm shadow-lg"
           >
             {t('result.unlockButton', 'Unlock Full Reading')}
           </motion.button>
        )}
        <button onClick={handleShare} className="p-2 text-[#2B1F16]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
        </button>
      </div>
    </motion.div>
  )
}
