import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CardFace } from '../components/CardFace'
import { useTranslation } from 'react-i18next'
import { createCheckout, getOrder, getReading, fetchPayConfig, ReadingResult } from '../api'
import GlobalLoading from '../components/GlobalLoading'

interface LocationState {
  cardIds?: number[]
  realCardIds?: number[]
  answers?: Record<string, string>
}

type MatchStatus = 'idle' | 'loading' | 'success' | 'error'

const Result: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const state = useMemo(() => (location.state as LocationState) || {}, [location.state])
  const cardIds = useMemo(() => {
    const ids = state.cardIds || []
    if (ids.length === 3) {
        localStorage.setItem('last_card_ids', JSON.stringify(ids))
        return ids
    }
    
    try {
        const saved = localStorage.getItem('last_card_ids')
        if (saved) {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed) && parsed.length === 3) return parsed
        }
    } catch {
        console.warn('Failed to recover cards from local storage')
    }

    if (searchParams.get('debug') === 'unlocked') return [1, 2, 3]
    return []
  }, [state.cardIds, searchParams])

  // Retrieve the Deck Mapping to translate Visual ID -> Real Content ID
  const realCardIds = useMemo(() => {
      // 1. If we recovered Real IDs from Order Metadata, use them directly.
      if (state.realCardIds && state.realCardIds.length === 3) {
          return state.realCardIds
      }

      try {
          const savedMapping = localStorage.getItem('deck_mapping')
          if (savedMapping) {
              const mapping = JSON.parse(savedMapping)
              if (Array.isArray(mapping) && cardIds.length === 3) {
                  // Map visual ID to Real ID
                  return cardIds.map(visualId => mapping[visualId])
              }
          }
      } catch (e) {
          console.warn('Failed to load deck mapping', e)
      }
      // Fallback: if no mapping found (old session?), assume ID is Real ID
      return cardIds
  }, [cardIds, state.realCardIds])

  const answers = useMemo(() => {
    const val = state.answers || {}
    // If we have answers, save them
    if (Object.keys(val).length > 0) {
        localStorage.setItem('last_answers', JSON.stringify(val))
        return val
    }
    
    // If no answers in state, try to recover
    try {
        const saved = localStorage.getItem('last_answers')
        if (saved) {
            return JSON.parse(saved)
        }
    } catch {
        console.warn('Failed to recover answers from local storage')
    }
    
    return {}
  }, [state.answers])

  const [revealed, setRevealed] = useState<boolean[]>([false, false, false])
  const [textVisible, setTextVisible] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [readingData, setReadingData] = useState<ReadingResult | null>(null)
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('idle')
  const [unlockedByOrder, setUnlockedByOrder] = useState(false)
  const [priceLabel, setPriceLabel] = useState('$5.00')
  const [currentPageStep, setCurrentPageStep] = useState(0) // 0 = Present, 1 = Future
  const [direction, setDirection] = useState(0) // -1 = Back, 1 = Next
  const [isInPastSection, setIsInPastSection] = useState(true)

  const pastSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchPayConfig().then(cfg => {
        if (cfg?.priceDisplay) setPriceLabel(cfg.priceDisplay)
    }).catch(err => console.warn('Failed to load price config', err))
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  // FIXED: Observer Race Condition
  // Now depends on matchStatus to ensure DOM elements exist before observing
  useEffect(() => {
    if (matchStatus !== 'success') return

    const pastElement = pastSectionRef.current
    if (!pastElement) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInPastSection(entry.isIntersecting && entry.intersectionRatio > 0.3)
        })
      },
      {
        threshold: [0, 0.3, 0.5, 1],
        rootMargin: '-100px 0px -200px 0px'
      }
    )

    observer.observe(pastElement)

    return () => {
      observer.disconnect()
    }
  }, [matchStatus])

  useEffect(() => {
    if (matchStatus !== 'success') return

    let isMounted = true;

    const revealSequence = async () => {
        if (isMounted) {
            setRevealed([false, false, false]);
            setTextVisible(false);
        }

        // Wait for Wipe transition (1.25s) + small buffer
        await new Promise(r => setTimeout(r, 1500));
        if (!isMounted) return;

        setRevealed(() => [true, false, false]);
        
        await new Promise(r => setTimeout(r, 800));
        if (!isMounted) return;

        setRevealed(() => [true, true, false]);

        await new Promise(r => setTimeout(r, 800));
        if (!isMounted) return;
        
        setRevealed(() => [true, true, true]);

        await new Promise(r => setTimeout(r, 1000));
        if (!isMounted) return;
        setTextVisible(true);
    }

    revealSequence();

    return () => {
        isMounted = false;
    }
  }, [matchStatus]);

  const normalizedCardIds = cardIds

  useEffect(() => {
    if (normalizedCardIds.length !== 3) return
    setMatchStatus('loading')

    const mapQ4 = (val?: string) => {
      if (!val || typeof val !== 'string') return null
      const first = val.trim().charAt(0).toUpperCase()
      if (first === 'A') return 'Self'
      if (first === 'B') return 'Career'
      if (first === 'C') return 'Love'
      return null
    }

    let category = mapQ4(answers['4']) || 'Self'

    if (!mapQ4(answers['4'])) {
      const categoryAnswer = answers['1']
      if (categoryAnswer && typeof categoryAnswer === 'string') {
        const ans = categoryAnswer.toLowerCase()
        if (ans.includes('关系') || ans.includes('relationship') || ans.includes('love')) {
            category = 'Love'
        } else if (ans.includes('事业') || ans.includes('career') || ans.includes('work') || ans.includes('job')) {
            category = 'Career'
        } else if (ans.includes('自我') || ans.includes('self') || ans.includes('growth')) {
            category = 'Self'
        }
      }
    }
    
    console.log('Fetching reading for category:', category, 'Real IDs:', realCardIds)

    const currentOrderId = searchParams.get('orderId') || undefined
    const debugMode = searchParams.get('debug') === 'unlocked'
    const effectiveOrderId = debugMode ? 'debug-unlocked' : currentOrderId

    getReading({
      card_indices: realCardIds, // Use the Real Content IDs for the API
      language: i18n.language,
      category,
      answers,
      orderId: effectiveOrderId,
      timestamp: Date.now(),
    })
      .then((res) => {
        setReadingData(res)
        if (res.is_unlocked) {
          setUnlockedByOrder(true)
        }
        setMatchStatus('success')
      })
      .catch((err) => {
        console.error('reading fetch failed', err)
        setReadingData(null)
        setMatchStatus('error')
      })
  }, [normalizedCardIds, realCardIds, answers, i18n.language, searchParams])

  useEffect(() => {
    const orderId = searchParams.get('orderId')
    if (!orderId) return
    getOrder(orderId)
      .then((res) => {
        if (res?.status === 'succeeded') {
          setUnlockedByOrder(true)
        }
        if (res?.metadata && (!state.cardIds || state.cardIds.length === 0)) {
            try {
                const meta = res.metadata as { cardIds?: string | number[]; realCardIds?: string | number[]; answers?: string | Record<string, string> };
                
                let recoveredIds: number[] = [];
                if (Array.isArray(meta.cardIds)) {
                    recoveredIds = meta.cardIds;
                } else if (typeof meta.cardIds === 'string') {
                    recoveredIds = meta.cardIds.split(',').map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n));
                }

                let recoveredRealIds: number[] = [];
                if (Array.isArray(meta.realCardIds)) {
                    recoveredRealIds = meta.realCardIds;
                } else if (typeof meta.realCardIds === 'string') {
                    recoveredRealIds = meta.realCardIds.split(',').map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n));
                }

                let recoveredAnswers: Record<string, string> = {};
                if (typeof meta.answers === 'object' && meta.answers !== null) {
                    recoveredAnswers = meta.answers as Record<string, string>;
                } else if (typeof meta.answers === 'string') {
                    try {
                        recoveredAnswers = JSON.parse(meta.answers);
                    } catch {
                        console.warn('Failed to parse answers string');
                    }
                }
                
                if (recoveredIds.length === 3) {
                    navigate(location.pathname + location.search, {
                        state: {
                            ...state,
                            cardIds: recoveredIds,
                            realCardIds: recoveredRealIds.length === 3 ? recoveredRealIds : undefined,
                            answers: recoveredAnswers
                        },
                        replace: true
                    });
                }
            } catch (e) {
                console.error("Failed to recover state from order metadata", e);
            }
        }
      })
      .catch((err) => {
        console.error('order check failed', err)
      })
  }, [searchParams])

  const isUnlocked = useMemo(() => {
      const debug = searchParams.get('debug');
      const orderId = searchParams.get('orderId');
      const status = searchParams.get('status');
      if (readingData?.is_unlocked) return true;
      return (debug === 'unlocked') || unlockedByOrder || (!!orderId && (status === 'paid' || status === 'succeeded'));
  }, [searchParams, unlockedByOrder, readingData]);

  useEffect(() => {
    if (!isUnlocked) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
      return ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isUnlocked])

  const handleUnlock = async () => {
    setUnlocking(true)
    setOrderError(null)
    try {
      const res = await createCheckout({
        currency: 'usd',
        metadata: { 
            cardIds: cardIds.join(','), 
            realCardIds: realCardIds.join(','), // Save Real IDs
            answers 
        }
      })
      
      if (res?.sessionUrl) {
        window.location.href = res.sessionUrl
      } else {
        console.error("No session URL returned")
        setOrderError('Payment initialization failed. Please try again.')
      }
    } catch (err) {
      console.error('Unlock failed:', err)
      setOrderError('Payment initialization failed. Please try again.')
    } finally {
      setUnlocking(false)
    }
  }

  const [titleClickCount, setTitleClickCount] = useState(0);
  const handleTitleClick = () => {
      if (titleClickCount + 1 >= 5) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('debug', 'unlocked');
      window.location.href = newUrl.toString();
  } else {
      setTitleClickCount(prev => prev + 1);
  }
  };

  // Animation Variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  if (matchStatus === 'loading' || matchStatus === 'idle') {
    return <GlobalLoading />
  }

  if (normalizedCardIds.length !== 3) {
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

  if (matchStatus === 'error') {
    return (
      <div className="min-h-screen bg-[#E8DCC5] flex flex-col items-center justify-center gap-4 text-[#2B1F16] px-4 text-center font-serif">
        <p className="text-lg">{t('result.error', 'Failed to load your reading.')}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 rounded-full bg-[#2B1F16] text-[#E8DCC5] text-sm tracking-widest uppercase hover:scale-105 transition-transform"
        >
          {t('common.retry', 'Retry')}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-[#E8DCC5] text-[#2B1F16] relative">
      <div className="relative z-10 max-w-md mx-auto">
          {/* 1. Cards Section - Sticky Fixed */}
          <div className="sticky top-0 z-50 bg-[#E8DCC5] pt-8 pb-4 px-4">
            <div className="flex flex-row justify-center items-end gap-3 md:gap-6 perspective-1000">
            {normalizedCardIds.map((_, index) => {
              const labels = [
                t('result.timeframes.past.label', 'Past'),
                t('result.timeframes.present.label', 'Present'),
                t('result.timeframes.future.label', 'Future')
              ]
              const isBlurLocked = index > 0 && !isUnlocked
              return (
              <div key={index} className="flex flex-col items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 + index * 0.8 }}
                        className="font-serif text-[10px] tracking-[0.2em] uppercase text-[#8B5A2B]"
                    >
                        {labels[index]}
                    </motion.span>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.8 }}
                        className="w-1 h-1 bg-[#D4A373] rounded-full"
                    />
                </div>

                <div className="relative w-24 h-36 md:w-32 md:h-48 perspective-1000">
                    <motion.div
                        className="w-full h-full relative preserve-3d"
                        initial={{ rotateY: 0 }}
                        animate={{
                            rotateY: revealed[index] ? 180 : 0,
                        }}
                        // FIX: Removed index-based delay. Staggering is handled by 'revealed' state timing.
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
                    >
                        <div 
                            className="absolute inset-0 backface-hidden rounded-xl shadow-xl overflow-hidden"
                            style={{ transform: 'translateZ(1px)' }}
                        >
                             <CardFace id={normalizedCardIds[index]} variant="slot" side="back" vertical={true} />
                        </div>
                        <div
                            className="absolute inset-0 backface-hidden rounded-xl shadow-xl overflow-hidden"
                            style={{ transform: 'rotateY(180deg) translateZ(1px)' }}
                        >
                             <CardFace id={normalizedCardIds[index]} variant="slot" side="front" />
                             {index > 0 && (
                                 <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: isBlurLocked ? 1 : 0 }}
                                    transition={{ duration: 0.8 }}
                                    className="absolute inset-0 bg-[#2B1F16]/40 backdrop-blur-[3px] rounded-xl z-10 flex items-center justify-center"
                                 >
                                    {!isUnlocked && (
                                        <div className="flex flex-col items-center gap-2">
                                            <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#E8DCC5]" fill="currentColor">
                                                <path d="M12 1C8.676 1 6 3.676 6 7v3H5c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V12c0-1.103-.897-2-2-2h-1V7c0-3.324-2.676-6-6-6zm-4 7c0-2.206 1.794-4 4-4s4 1.794 4 4v3h-8V7z"/>
                                            </svg>
                                        </div>
                                    )}
                                 </motion.div>
                             )}
                        </div>
                    </motion.div>
                </div>
              </div>
              )
            })}
            </div>
          </div>

          {/* 2. Scrollable Content Area */}
          <div className="px-4 pb-8">

          {/* Content Fade-in Wrapper */}
          <motion.div
             ref={pastSectionRef}
             initial={{ opacity: 0 }}
             animate={{ opacity: textVisible ? 1 : 0 }}
             transition={{ duration: 1.0, delay: 0.5 }} // Reduced delay slightly for better flow
             className="w-full relative text-center"
          >
              <h2
                onClick={handleTitleClick}
                className="text-2xl text-[#4A3B32] font-serif mb-8 tracking-wider leading-tight cursor-pointer select-none opacity-90"
              >
                {t('result.title', 'The Revelation')}
              </h2>

              {/* 2.1 Past Section - Always Visible */}
              <div className="mb-8">
                  <div className="text-[#3E3025] font-serif text-sm leading-8 text-left px-2">
                      <div className="flex justify-center mb-6">
                          <div className="w-16 h-[1px] bg-[#4A3B32]/20" />
                      </div>
                      <h3 className="text-center text-base font-serif text-[#4A3B32] mb-4 tracking-wider">{t('result.timeframes.past.label', 'PAST')}</h3>
                      <p className="mb-8 whitespace-pre-wrap">
                          {readingData?.past?.interpretation || t('result.timeframes.past.description', "Your journey has led you here. Embrace the wisdom of the cards as they reveal the path ahead. Trust in their guidance, for they speak the language of your soul's deepest knowing.")}
                      </p>
                  </div>
              </div>
          </motion.div>

          {/* Premium Container: CTA + Paid Content */}
          <motion.div 
             initial={{ opacity: 0 }}
             // FIX: Depend on textVisible (end of sequence) instead of revealed[2] (card start)
             animate={{ opacity: textVisible ? 1 : 0 }}
             // FIX: Delay 1.0s to ensure it appears AFTER the Past text (which has delay 0.5s)
             transition={{ duration: 1.0, delay: 1.0 }}
             className="relative mt-6"
          >
            <div className="relative overflow-hidden rounded-2xl border border-[#D4A373]/25 bg-[#F7F2ED]/75 shadow-[0_22px_60px_-34px_rgba(43,31,22,0.5)] px-5 py-9 md:px-7 md:py-11 transition-all duration-700">
              {!isUnlocked && (
                <div className="absolute inset-0 bg-gradient-to-b from-[#F1E6D4]/88 via-[#E8DCC5]/78 to-[#E8DCC5]/86 backdrop-blur-md z-20 pointer-events-none" />
              )}

              {!isUnlocked ? (
                <div className="relative z-30 flex flex-col items-center justify-center px-2 py-4 text-center">
                    <div className="w-full space-y-5">
                        <div className="space-y-3 font-serif text-[15px] leading-relaxed text-[#3E3025]">
                        <p dangerouslySetInnerHTML={{ __html: t('result.locked.promo.p1') }} />
                        <p>
                            {t('result.locked.promo.p2_pre')} <span className="text-[#B58558] font-medium">{t('result.locked.promo.p2_highlight')}</span> {t('result.locked.promo.p2_post')}
                        </p>
                        <p>
                            {t('result.locked.promo.p3_pre')} <span className="text-[#B58558] font-medium">{t('result.locked.promo.p3_highlight1')}</span>
                            <span dangerouslySetInnerHTML={{ __html: t('result.locked.promo.p3_mid') }} /> <span className="text-[#B58558] font-medium">{t('result.locked.promo.p3_highlight2')}</span>{t('result.locked.promo.p3_post')}
                        </p>
                        <p>
                            {t('result.locked.promo.p4_pre')} <span className="text-[#B58558] font-medium">{t('result.locked.promo.p4_highlight')}</span> {t('result.locked.promo.p4_post')}
                        </p>
                        </div>

                        <div className="mx-auto w-28 h-40 bg-[#F9F7F2] rounded shadow-sm border border-[#E8DCC5] flex flex-col items-center justify-center p-3 gap-2 mt-4">
                            <span className="text-[8px] tracking-widest text-[#8B5A2B] uppercase">Chloe</span>
                            <span className="text-[14px] text-[#3E3025] text-center leading-tight font-medium">Chloe Rose Tangerine</span>
                            <div className="w-4 h-[1px] bg-[#D4A373]/30 my-1" />
                            <span className="text-[9px] text-[#8B5A2B]/60 font-serif italic">"abcdfddf"</span>
                            <div className="mt-2 text-[8px] text-[#3E3025]">
                                <span className="text-[#8B5A2B]/60 text-[6px] uppercase tracking-wider block text-center mb-0.5">FOR</span>
                                monica
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-10 w-full flex flex-col items-center gap-2">
                        <button
                        onClick={handleUnlock}
                        disabled={unlocking}
                        className="group relative px-10 py-4 rounded-full font-serif tracking-widest text-[11px] uppercase transition-all duration-500 whitespace-nowrap bg-[#2B1F16] text-[#E8DCC5] shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                        <span className="relative z-10">
                            {unlocking ? t('draw.loading') + '...' : `${t('result.unlock', 'Reveal Your Destiny')}  |  ${priceLabel}`}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-1000 ease-in-out rounded-full" />
                        </button>
                        {orderError && <span className="text-xs text-red-800/80 animate-pulse font-serif">{orderError}</span>}
                    </div>
                </div>
              ) : (
                <>
                  <div className="relative z-10 flex justify-center gap-2 mb-8">
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isInPastSection ? 'bg-[#4A3B32]' : 'bg-[#4A3B32]/20'}`} />
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${!isInPastSection && currentPageStep === 0 ? 'bg-[#4A3B32]' : 'bg-[#4A3B32]/20'}`} />
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${!isInPastSection && currentPageStep === 1 ? 'bg-[#4A3B32]' : 'bg-[#4A3B32]/20'}`} />
                  </div>

                  <div className="relative overflow-hidden min-h-[400px]">
                    <AnimatePresence mode='wait' custom={direction}>
                        <motion.div
                          key={currentPageStep}
                          custom={direction}
                          variants={variants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.3 }}
                          drag="x"
                          dragConstraints={{ left: 0, right: 0 }}
                          dragElastic={0.2}
                          style={{ touchAction: 'pan-y' }} 
                          onDragEnd={(_e, info) => {
                            const swipeThreshold = 50
                            if (info.offset.x > swipeThreshold && currentPageStep === 1) {
                              // Swipe right: go back to Present
                              setDirection(-1)
                              setCurrentPageStep(0)
                            } else if (info.offset.x < -swipeThreshold && currentPageStep === 0) {
                              // Swipe left: go to Future
                              setDirection(1)
                              setCurrentPageStep(1)
                            }
                          }}
                          className="relative z-10 text-[#3E3025] font-serif text-sm leading-8 cursor-grab active:cursor-grabbing"
                        >
                          <div className="flex justify-center mb-6">
                            <div className="w-16 h-[1px] bg-[#4A3B32]/15" />
                          </div>

                          {currentPageStep === 0 ? (
                            <div>
                              <h3 className="text-center text-base font-serif text-[#4A3B32] mb-4 tracking-[0.22em]">{t('result.timeframes.present.label', 'PRESENT')}</h3>
                              <p className="mb-0 text-[#3E3025]/90 whitespace-pre-wrap text-left px-2">
                                {readingData?.present?.interpretation || t('result.timeframes.present.description', 'The present moment holds infinite possibilities. Open your heart to receive the blessings around you now.')}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <h3 className="text-center text-base font-serif text-[#4A3B32] mb-4 tracking-[0.22em]">{t('result.timeframes.future.label', 'FUTURE')}</h3>
                              <p className="mb-0 text-[#3E3025]/90 whitespace-pre-wrap text-left px-2">
                                {readingData?.future?.interpretation || t('result.timeframes.future.description', 'Trust your intuition and take the next step with confidence. Your destiny awaits.')}
                              </p>
                            </div>
                          )}
                        </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="relative z-30 mt-10 flex justify-center items-center gap-4 pb-[env(safe-area-inset-bottom)]">
                    {currentPageStep === 1 && (
                      <button
                        onClick={() => {
                            setDirection(-1)
                            setCurrentPageStep(0)
                        }}
                        className="px-8 py-3 rounded-full font-serif tracking-widest text-[10px] uppercase transition-all duration-300 bg-transparent text-[#2B1F16]/60 border border-[#D4A373]/30 hover:border-[#D4A373]/50"
                      >
                        {t('common.back', 'Back')}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (currentPageStep === 0) {
                          setDirection(1)
                          setCurrentPageStep(1)
                        } else {
                          // 确保跳转前保存 answers 到 localStorage
                          if (Object.keys(answers).length > 0) {
                            localStorage.setItem('last_answers', JSON.stringify(answers))
                          }
                          navigate('/perfume', { state: { cardIds: normalizedCardIds, answers } })
                        }
                      }}
                      className="group relative px-10 py-4 rounded-full font-serif tracking-widest text-[11px] uppercase transition-all duration-500 whitespace-nowrap bg-[#2B1F16] text-[#E8DCC5] shadow-lg hover:-translate-y-0.5"
                    >
                      <span className="relative z-10">
                        {currentPageStep === 0 ? t('common.continue', 'Continue') : t('journey.cta', 'Discover Your Fragrance')}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-1000 ease-in-out rounded-full" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
          
          </div>
      </div>
    </div>
  )
}

export default Result