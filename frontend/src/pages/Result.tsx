import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CardFace } from '../components/CardFace'
import { useTranslation } from 'react-i18next'
import { createCheckout, getOrder } from '../api'
import cardBack from '../assets/ref/card_back.jpg'

// Import assets (Arbitrary assignment, to be verified by user)
import perfumeImg from '../assets/web/07296560-77c6-4ef6-9797-d84d25347096.png'
import signatureImg from '../assets/web/9aa28f50-b479-4eaa-b05d-e7287130c5ca.png'
import plantDecor1 from '../assets/web/ChatGPT Image 2025年11月17日 02_41_39.png'
import plantDecor2 from '../assets/web/ChatGPT Image 2025年11月17日 02_47_34.png'

const Result: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const state = (location.state as { cardIds?: number[]; answers?: Record<string, string> }) || {}
  const cardIds = state.cardIds && state.cardIds.length === 3 ? state.cardIds : []
  const answers = state.answers || {}

  const [revealed, setRevealed] = useState([false, false, false])
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [currency, setCurrency] = useState<'cny' | 'usd'>(i18n.language?.startsWith('zh') ? 'cny' : 'usd')

  useEffect(() => {
    const timers = [
      setTimeout(() => setRevealed(prev => [true, prev[1], prev[2]]), 500),
      setTimeout(() => setRevealed(prev => [true, true, prev[2]]), 1500),
      setTimeout(() => setRevealed(() => [true, true, true]), 2500),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search])

  useEffect(() => {
    const orderId = searchParams.get('orderId')
    if (!orderId) return

    const checkOrder = async () => {
      try {
        const order = await getOrder(orderId)
        if (order?.status === 'paid' || order?.status === 'succeeded') {
          setIsUnlocked(true)
        } else {
          setOrderError(t('result.payFailed', 'Payment not completed, please retry.'))
        }
      } catch (err) {
        console.error('Get order failed', err)
        setOrderError(t('result.payFailed', 'Payment not completed, please retry.'))
      }
    }

    checkOrder()
  }, [searchParams, t])

  const handleUnlock = async () => {
    setUnlocking(true)
    setOrderError(null)

    try {
      const res = await createCheckout({
        currency,
        metadata: { cardIds: cardIds.join(','), answers }
      })

      if (res?.sessionUrl) {
        window.location.href = res.sessionUrl
        return
      }

      // 若无跳转链接，降级直接解锁
      setIsUnlocked(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Checkout failed', error)
      setOrderError(t('result.payFailed', 'Payment not completed, please retry.'))
    } finally {
      setUnlocking(false)
    }
  }

  if (cardIds.length !== 3) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-text px-4 text-center">
        <p className="text-lg">{t('result.missingState', 'Please draw cards again to view the result.')}</p>
        <button
          onClick={() => navigate('/question')}
          className="px-6 py-3 rounded-full bg-text text-white text-sm tracking-wide"
        >
          {t('common.restart')}
        </button>
      </div>
    )
  }

  const priceLabel = currency === 'cny' ? '¥15.00' : '$5.00'

  // Locked View Component
  const LockedView = () => (
    <div className="max-w-4xl mx-auto pt-16 pb-32 px-6 flex flex-col items-center">
      
      {/* Cards Display with Reflection */}
      <div className="flex flex-row justify-center items-end gap-4 md:gap-8 mb-16 perspective-1000">
        {cardIds.map((id, index) => (
          <div key={index} className="relative w-28 h-44 md:w-40 md:h-64 group">
            {/* Main Card */}
            <motion.div
              className="w-full h-full relative preserve-3d transition-all duration-1000 z-10"
              animate={{ rotateY: revealed[index] ? 180 : 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Back */}
              <div className="absolute inset-0 backface-hidden">
                <img src={cardBack} alt="Card Back" className="w-full h-full object-cover rounded-xl shadow-2xl border border-white/40" />
              </div>
              
              {/* Front */}
              <div 
                className="absolute inset-0 backface-hidden bg-white rounded-xl border border-primary/20 shadow-card flex flex-col items-center justify-center overflow-hidden"
                style={{ transform: 'rotateY(180deg)' }}
              >
                 <img src={cardBack} alt={`Card ${id}`} className="w-full h-full object-cover opacity-80" />
                 <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="text-white font-serif text-4xl drop-shadow-md">{id}</span>
                 </div>
              </div>
            </motion.div>
            
            {/* Reflection */}
            <motion.div
                className="absolute top-full left-0 w-full h-full preserve-3d opacity-30 pointer-events-none"
                animate={{ rotateY: revealed[index] ? 180 : 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                style={{ 
                    transformOrigin: 'top', 
                    transform: `rotateY(${revealed[index] ? 180 : 0}deg) scaleY(-1) translateY(-10px)`, // translateY to add slight gap if needed, or 0
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0) 60%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0) 60%)'
                }}
             >
                {/* Back Reflection */}
              <div className="absolute inset-0 backface-hidden">
                <img src={cardBack} alt="Card Back Reflection" className="w-full h-full object-cover rounded-xl" />
              </div>
              
              {/* Front Reflection */}
              <div 
                className="absolute inset-0 backface-hidden rotate-y-180 rounded-lg overflow-hidden shadow-2xl flex items-center justify-center bg-[#14100F]"
                style={{ transform: 'rotateY(180deg)' }}
              >
                {/* CardFace is landscape (140x90), so we rotate it 90deg to fit the vertical card slot */}
                <div className="w-[140px] h-[90px] flex items-center justify-center transform rotate-90">
                    <CardFace id={cardIds[index]} variant="slot" />
                </div>
              </div>
             </motion.div>
          </div>
        ))}
      </div>

      {/* Title */}
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: revealed[2] ? 1 : 0, y: revealed[2] ? 0 : 20 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-2xl md:text-3xl text-primary font-serif text-center mb-10 tracking-widest leading-relaxed"
      >
        {t('result.locked.summary')}
      </motion.h2>

      {/* Body Text - Open Layout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed[2] ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="max-w-2xl text-subtext font-sans text-base md:text-lg leading-loose text-justify mb-16 space-y-6 px-4"
      >
          <p className="whitespace-pre-line">
            {t('result.locked.desc')}
          </p>
      </motion.div>

      {/* Actions Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: revealed[2] ? 1 : 0, y: revealed[2] ? 0 : 20 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="flex flex-col items-center gap-6"
      >
         {/* Price Toggle */}
         <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm border border-primary/10 rounded-full px-4 py-1.5 shadow-sm">
           <span className="text-xs text-subtext uppercase tracking-wider">{t('result.priceLabel', 'Unlock Reading')}</span>
           <div className="flex items-center gap-1">
             <button
               onClick={() => setCurrency('cny')}
               className={`px-3 py-1 rounded-full text-xs transition-all ${currency === 'cny' ? 'bg-primary text-white shadow-md' : 'text-subtext hover:bg-primary/5'}`}
             >
               CNY ¥15
             </button>
             <button
               onClick={() => setCurrency('usd')}
               className={`px-3 py-1 rounded-full text-xs transition-all ${currency === 'usd' ? 'bg-primary text-white shadow-md' : 'text-subtext hover:bg-primary/5'}`}
             >
               USD $5
             </button>
           </div>
         </div>

         {/* Unlock Button */}
         <button 
             onClick={handleUnlock}
             disabled={unlocking}
             className="group relative px-12 py-4 rounded-full bg-primary text-[#FDFBF7] font-serif tracking-[0.2em] text-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none overflow-hidden"
         >
             <span className="relative z-10 flex items-center gap-3">
                {unlocking ? (
                    <span>{t('draw.loading')}...</span>
                ) : (
                    <>
                        <span>{t('result.unlock')}</span>
                        <span className="opacity-60">|</span>
                        <span className="font-sans tracking-normal">{priceLabel}</span>
                    </>
                )}
             </span>
             <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
         </button>

         {orderError && <div className="text-sm text-red-500 animate-pulse">{orderError}</div>}

         {/* Tags (Optional, kept subtle) */}
         <div className="flex flex-wrap justify-center gap-2 mt-4 opacity-60">
            {Object.values(answers).map((val, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 border border-primary/20 rounded-full text-primary/60">
                {val}
              </span>
            ))}
         </div>
      </motion.div>

    </div>
  )

  // Unlocked View Component (Multi-page)
  const UnlockedView = () => {
    const [step, setStep] = useState(0)
    const totalSteps = 5 // Cover, Ch1, Ch2, Ch3, Ending

    const handleNext = () => {
      setStep(prev => Math.min(prev + 1, totalSteps - 1))
    }

    // Common Header Component
    const ChapterHeader = ({ title, right = false }: { title: string, right?: boolean }) => (
      <div className={`w-full flex ${right ? 'justify-end' : 'justify-start'} mb-8`}>
        <h2 className="text-xl md:text-2xl font-songti text-vintage-text border-b border-vintage-text/30 pb-2 px-4 inline-block tracking-widest">
          {title}
        </h2>
      </div>
    )

    return (
      <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="max-w-md mx-auto bg-vintage-bg min-h-screen shadow-2xl relative overflow-hidden text-vintage-text font-kaiti cursor-pointer"
          onClick={handleNext}
      >
          {/* Global Texture */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] z-0"></div>
          
          {/* Decorative Plants */}
          <img src={plantDecor1} className="absolute top-0 left-0 w-32 opacity-40 mix-blend-multiply z-0 pointer-events-none sepia" alt="decor" />
          <img src={plantDecor2} className="absolute bottom-0 right-0 w-40 opacity-40 mix-blend-multiply z-0 pointer-events-none rotate-180 sepia" alt="decor" />

          <AnimatePresence mode="wait">
            {/* Step 0: Cover & Index */}
            {step === 0 && (
              <motion.div 
                key="cover"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6 }}
                className="h-screen flex flex-col justify-center items-center p-8 text-center relative z-10"
              >
                 <h1 className="text-3xl font-songti text-vintage-text mb-16 tracking-widest font-bold">
                    {t('result.unlocked.title')}
                 </h1>
                 <div className="space-y-8 font-songti text-lg text-vintage-subtext flex flex-col items-center w-full max-w-xs">
                    <div className="w-full flex justify-between border-b border-vintage-accent/30 pb-2">
                        <span>{t('result.unlocked.cover.chapter1')}</span>
                        <span className="text-sm self-end opacity-70">TAM DAO</span>
                    </div>
                     <div className="w-full flex justify-between border-b border-vintage-accent/30 pb-2">
                        <span>{t('result.unlocked.cover.chapter2')}</span>
                        <span className="text-sm self-end opacity-70">FIGUIER</span>
                    </div>
                     <div className="w-full flex justify-between border-b border-vintage-accent/30 pb-2">
                        <span>{t('result.unlocked.cover.chapter3')}</span>
                        <span className="text-sm self-end opacity-70">Signature</span>
                    </div>
                 </div>
                 <p className="absolute bottom-12 text-xs text-vintage-accent animate-pulse">Tap to continue</p>
              </motion.div>
            )}

            {/* Step 1: Chapter 1 (Perfume) */}
            {step === 1 && (
               <motion.div 
                key="chapter1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6 }}
                className="h-screen flex flex-col p-6 pt-16 relative z-10"
              >
                <ChapterHeader title={t('result.unlocked.chapter1.title')} right />
                
                <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                    <div className="text-center mb-6 px-4">
                        <p className="text-lg font-songti font-bold mb-2">“{t('result.unlocked.chapter1.quote')}”</p>
                        <p className="text-sm font-serif text-vintage-subtext">TAM DAO</p>
                    </div>

                    <div className="flex justify-center mb-8">
                         <img src={perfumeImg} alt="Perfume" className="w-48 h-auto object-contain drop-shadow-lg sepia-[0.2] contrast-[1.1]" />
                    </div>

                    <div className="space-y-3 text-xs font-sans text-vintage-subtext mb-8 pl-4 border-l-2 border-vintage-accent/50 mx-4">
                         <p>{t('result.unlocked.chapter1.notes.top')}</p>
                         <p>{t('result.unlocked.chapter1.notes.middle')}</p>
                         <p>{t('result.unlocked.chapter1.notes.base')}</p>
                    </div>

                    <div className="bg-vintage-text/5 p-5 rounded-lg mb-8 mx-2">
                        <h4 className="font-bold text-sm mb-2 text-vintage-text/80 font-songti">{t('result.unlocked.chapter1.tarotInsight.title')}</h4>
                        <p className="text-sm italic leading-relaxed opacity-80">{t('result.unlocked.chapter1.tarotInsight.content')}</p>
                    </div>

                    <p className="text-sm leading-loose text-justify opacity-90 px-2 font-kaiti">
                        {t('result.unlocked.chapter1.atmosphere')}
                    </p>
                </div>
              </motion.div>
            )}

            {/* Step 2: Chapter 2 (Home Fragrance) */}
            {step === 2 && (
               <motion.div 
                key="chapter2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6 }}
                className="h-screen flex flex-col p-6 pt-16 relative z-10"
              >
                <ChapterHeader title={t('result.unlocked.chapter2.title')} />
                
                <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                    <div className="text-center mb-6 px-4">
                        <p className="text-lg font-songti font-bold mb-2">“{t('result.unlocked.chapter2.quote')}”</p>
                        <p className="text-sm font-serif text-vintage-subtext">FIGUIER</p>
                    </div>

                    <div className="flex justify-center mb-8">
                         <img src={signatureImg} alt="Home Fragrance" className="w-48 h-auto object-contain drop-shadow-lg sepia-[0.2]" />
                    </div>

                    <div className="space-y-3 text-xs font-sans text-vintage-subtext mb-8 pl-4 border-l-2 border-vintage-accent/50 mx-4">
                         <p>{t('result.unlocked.chapter2.notes.top')}</p>
                         <p>{t('result.unlocked.chapter2.notes.middle')}</p>
                         <p>{t('result.unlocked.chapter2.notes.base')}</p>
                    </div>

                    <div className="bg-vintage-text/5 p-5 rounded-lg mb-8 mx-2">
                        <h4 className="font-bold text-sm mb-2 text-vintage-text/80 font-songti">{t('result.unlocked.chapter2.tarotInsight.title')}</h4>
                        <p className="text-sm italic leading-relaxed opacity-80">{t('result.unlocked.chapter2.tarotInsight.content')}</p>
                    </div>

                    <p className="text-sm leading-loose text-justify opacity-90 px-2 font-kaiti">
                        {t('result.unlocked.chapter2.atmosphere')}
                    </p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Chapter 3 (Signature) */}
            {step === 3 && (
               <motion.div 
                key="chapter3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6 }}
                className="h-screen flex flex-col p-6 pt-16 relative z-10"
              >
                <ChapterHeader title={t('result.unlocked.chapter3.title')} right />
                
                <div className="flex-1 flex flex-col justify-center items-center pb-20 px-4">
                    <div className="border border-vintage-text/20 p-8 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm w-full">
                        <p className="text-vintage-text font-kaiti leading-loose whitespace-pre-line text-lg text-center">
                            {t('result.unlocked.chapter3.content')}
                        </p>
                    </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Ending */}
            {step === 4 && (
               <motion.div 
                key="ending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-screen flex flex-col justify-center items-center p-10 text-center relative z-10"
               >
                  <p className="text-xl font-songti text-vintage-text leading-loose tracking-wide">
                    {t('result.unlocked.footer')}
                  </p>
                  <div className="mt-12 w-16 h-1 bg-vintage-accent opacity-50"></div>
               </motion.div>
            )}
          </AnimatePresence>
          
          {/* Page Indicator */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-20">
            {[0,1,2,3,4].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? 'bg-vintage-text scale-125' : 'bg-vintage-accent/50'}`} />
            ))}
          </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-background text-text overflow-x-hidden">
      <AnimatePresence mode="wait">
        {!isUnlocked ? (
            <motion.div 
                key="locked"
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
            >
                <LockedView />
            </motion.div>
        ) : (
            <UnlockedView />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Result
