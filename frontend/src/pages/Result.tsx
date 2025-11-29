import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CardFace } from '../components/CardFace'
import { useTranslation } from 'react-i18next'
import { createCheckout, getOrder, getReading, fetchPayConfig, ReadingResult } from '../api'
import ResultSkeleton from '../components/ResultSkeleton'

// Import assets (Arbitrary assignment, to be verified by user)

interface LocationState {
  cardIds?: number[]
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
    if (ids.length === 3) return ids
    // 测试/调试模式允许兜底卡组，方便直接查看解锁内容
    if (searchParams.get('debug') === 'unlocked') return [1, 2, 3]
    return []
  }, [state.cardIds, searchParams])
  const answers = useMemo(() => state.answers || {}, [state.answers])

  const [revealed, setRevealed] = useState<boolean[]>([false, false, false])
  const [unlocking, setUnlocking] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [readingData, setReadingData] = useState<ReadingResult | null>(null)
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('idle')
  const [unlockedByOrder, setUnlockedByOrder] = useState(false)
  const [priceLabel, setPriceLabel] = useState('$5.00') // Default fallback

  useEffect(() => {
    // Fetch dynamic price from backend (which gets it from Stripe)
    fetchPayConfig().then(cfg => {
        if (cfg?.priceDisplay) setPriceLabel(cfg.priceDisplay)
    }).catch(err => console.warn('Failed to load price config', err))
  }, [])

  // Ensure returning to this page always starts at the top (e.g., back from Perfume)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  useEffect(() => {
    // Robust Sequential Reveal Animation
    // We use a mounted flag to prevent state updates on unmounted component
    let isMounted = true;

    const revealSequence = async () => {
        // Force initial state
        if (isMounted) setRevealed([false, false, false]);

        // Initial delay to ensure layout is stable and images are loaded
        await new Promise(r => setTimeout(r, 800));
        if (!isMounted) return;

        // 1. Past Card (Index 0)
        setRevealed(() => [true, false, false]);
        
        // Wait 0.6s
        await new Promise(r => setTimeout(r, 600));
        if (!isMounted) return;

        // 2. Present Card (Index 1)
        setRevealed(() => [true, true, false]);

        // Wait 0.6s
        await new Promise(r => setTimeout(r, 600));
        if (!isMounted) return;
        
        // 3. Future Card (Index 2)
        setRevealed(() => [true, true, true]);
    }

    revealSequence();

    return () => {
        isMounted = false;
    }
  }, []);

  // Use card IDs directly as they are already 0-based indices (0-77) from Draw.tsx
  const normalizedCardIds = cardIds

  useEffect(() => {
    if (normalizedCardIds.length !== 3) return
    setMatchStatus('loading')

    // Determine category from answers (Question ID 1)
    let category = 'Self'
    const categoryAnswer = answers['1']
    if (categoryAnswer) {
      if (categoryAnswer.includes('关系') || categoryAnswer.includes('Relationships')) category = 'Love'
      else if (categoryAnswer.includes('事业') || categoryAnswer.includes('Career')) category = 'Career'
      else if (categoryAnswer.includes('自我') || categoryAnswer.includes('Self')) category = 'Self'
    }

    const currentOrderId = searchParams.get('orderId') || undefined
    const debugMode = searchParams.get('debug') === 'unlocked'
    const effectiveOrderId = debugMode ? 'debug-unlocked' : currentOrderId

    getReading({
      card_indices: normalizedCardIds,
      language: i18n.language,
      category,
      orderId: effectiveOrderId,
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
  }, [normalizedCardIds, answers, i18n.language, searchParams])

  // Determine unlocked state:
  // 1. Payment success (orderId + status)
  // 2. Debug mode (?debug=unlocked)
  useEffect(() => {
    const orderId = searchParams.get('orderId')
    if (!orderId) return
    getOrder(orderId)
      .then((res) => {
        if (res?.status === 'succeeded') {
          setUnlockedByOrder(true)
        }
        // Restore state from metadata if missing locally (e.g. return from payment)
        if (res?.metadata && (!state.cardIds || state.cardIds.length === 0)) {
            try {
                const meta = res.metadata as { cardIds?: string | number[]; answers?: string | Record<string, string> };
                
                let recoveredIds: number[] = [];
                if (Array.isArray(meta.cardIds)) {
                    recoveredIds = meta.cardIds;
                } else if (typeof meta.cardIds === 'string') {
                    recoveredIds = meta.cardIds.split(',').map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n));
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
                    // Force update state and re-render
                    navigate(location.pathname + location.search, {
                        state: {
                            ...state,
                            cardIds: recoveredIds,
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
      // Prioritize readingData.is_unlocked if available
      if (readingData?.is_unlocked) return true;
      return (debug === 'unlocked') || unlockedByOrder || (!!orderId && (status === 'paid' || status === 'succeeded'));
  }, [searchParams, unlockedByOrder, readingData]);

  const handleUnlock = async () => {
    setUnlocking(true)
    setOrderError(null)
    try {
      // Always use USD as the single source of truth from Stripe configuration
      const res = await createCheckout({
        currency: 'usd',
        metadata: { cardIds: cardIds.join(','), answers }
      })
      
      // Redirect to payment
      if (res?.sessionUrl) {
        window.location.href = res.sessionUrl
      } else {
        // Fallback or error if no session URL
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

  // Debug backdoor: Click title 5 times to unlock
  const [titleClickCount, setTitleClickCount] = useState(0);
  const handleTitleClick = () => {
      if (titleClickCount + 1 >= 5) {
          // Redirect to same URL with debug param
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('debug', 'unlocked');
      window.location.href = newUrl.toString();
  } else {
      setTitleClickCount(prev => prev + 1);
  }
  };

  if (matchStatus === 'loading' || matchStatus === 'idle') {
    return <ResultSkeleton />
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



  return (
    <div className="min-h-screen w-full bg-[#E8DCC5] text-[#2B1F16] overflow-x-hidden relative py-8 px-4">
      {/* Main Content - Card Style Container */}
      <div className="relative z-10 max-w-md mx-auto">

          {/* 1. Cards Section */}
          <div className="flex flex-row justify-center items-end gap-3 md:gap-6 mb-8 perspective-1000">
            {normalizedCardIds.map((_, index) => {
              const labels = [
                t('result.timeframes.past.label', 'Past'),
                t('result.timeframes.present.label', 'Present'),
                t('result.timeframes.future.label', 'Future')
              ]
              const isBlurLocked = index > 0 && !isUnlocked
              return (
              <div key={index} className="flex flex-col items-center gap-3">
                {/* Label */}
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
                    {/* Container for Card */}
                    <motion.div
                        className="w-full h-full relative preserve-3d"
                        initial={{ rotateY: 0 }}
                        animate={{
                            rotateY: revealed[index] ? 180 : 0,
                        }}
                        transition={{ duration: 0.8, ease: "easeInOut", delay: index * 0.8 }}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Back of Card */}
                        <div className="absolute inset-0 backface-hidden rounded-xl shadow-xl overflow-hidden">
                             <CardFace id={normalizedCardIds[index]} variant="slot" side="back" vertical={true} />
                        </div>
                        {/* Front of Card */}
                        <div
                            className="absolute inset-0 backface-hidden rounded-xl shadow-xl overflow-hidden"
                            style={{ transform: 'rotateY(180deg)' }}
                        >
                             <CardFace id={normalizedCardIds[index]} variant="slot" side="front" />
                             {/* Blur & Lock Overlay for Present & Future until unlocked */}
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

          {/* 2. Content Section (Freemium Layout) */}
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: revealed[2] ? 1 : 0 }}
             transition={{ duration: 1.0, delay: 2.4 }}
             className="w-full relative text-center"
          >
              {/* Simplified Title */}
              <h2
                onClick={handleTitleClick}
                className="text-2xl text-[#4A3B32] font-serif mb-8 tracking-wider leading-tight cursor-pointer select-none opacity-90"
              >
                {t('result.title', 'The Revelation')}
              </h2>

              {/* Free Content Section (PAST) */}
              <div className="mb-12">
                  {readingData?.past?.content?.summary && (
                    <p className="text-[#3E3025] font-serif italic text-center text-sm mb-8 opacity-80 leading-relaxed px-2">
                      {readingData.past.content.summary}
                    </p>
                  )}

                  <div className="text-[#3E3025] font-serif text-sm leading-8 text-left px-2">
                      <div className="flex justify-center mb-6">
                          <div className="w-16 h-[1px] bg-[#4A3B32]/20" />
                      </div>
                      <h3 className="text-center text-base font-serif text-[#4A3B32] mb-4 tracking-wider">{t('result.timeframes.past.label', 'PAST')}</h3>
                      <p className="mb-8 whitespace-pre-wrap">
                          {readingData?.past?.content?.interpretation || t('result.timeframes.past.description', "Your journey has led you here. Embrace the wisdom of the cards as they reveal the path ahead. Trust in their guidance, for they speak the language of your soul's deepest knowing.")}
                      </p>
                  </div>
              </div>

          {/* Premium Container: CTA + Paid Content (统一样式，避免割裂) */}
          <div className="relative mt-6">
            <div className="relative overflow-hidden rounded-2xl border border-[#D4A373]/25 bg-[#F7F2ED]/75 shadow-[0_22px_60px_-34px_rgba(43,31,22,0.5)] px-5 py-9 md:px-7 md:py-11 transition-all duration-700">
              {!isUnlocked && (
                <div className="absolute inset-0 bg-gradient-to-b from-[#F1E6D4]/88 via-[#E8DCC5]/78 to-[#E8DCC5]/86 backdrop-blur-md z-20 pointer-events-none" />
              )}

              <div className={`relative z-10 space-y-10 text-[#3E3025] font-serif text-sm leading-8 ${!isUnlocked ? 'filter blur-[3px]' : ''}`}>
                <div className="flex justify-center mb-2 mt-2">
                  <div className="w-16 h-[1px] bg-[#4A3B32]/15" />
                </div>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-center text-base font-serif text-[#4A3B32] mb-4 tracking-[0.22em]">{t('result.timeframes.present.label', 'PRESENT')}</h3>
                    <p className="mb-0 text-[#3E3025]/90 whitespace-pre-wrap">
                      {readingData?.present?.content?.interpretation || t('result.timeframes.present.description', 'The present moment holds infinite possibilities. Open your heart to receive the blessings around you now.')}
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-[1px] bg-[#4A3B32]/15" />
                    </div>
                    <h3 className="text-center text-base font-serif text-[#4A3B32] mb-4 tracking-[0.22em]">{t('result.timeframes.future.label', 'FUTURE')}</h3>
                    <p className="mb-0 text-[#3E3025]/90 whitespace-pre-wrap">
                      {readingData?.future?.content?.interpretation || t('result.timeframes.future.description', 'Trust your intuition and take the next step with confidence. Your destiny awaits.')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-30 mt-10 flex flex-col items-center gap-3">
                <button
                  onClick={isUnlocked ? () => navigate('/perfume', { state: { cardIds: normalizedCardIds, answers } }) : handleUnlock}
                  disabled={unlocking}
                  className={`group relative px-10 py-4 rounded-full font-serif tracking-widest text-[11px] uppercase transition-all duration-500 whitespace-nowrap ${isUnlocked ? 'bg-transparent text-[#2B1F16] border border-[#D4A373]/70 shadow-[0_10px_24px_-14px_rgba(43,31,22,0.35)] hover:-translate-y-0.5' : 'bg-[#2B1F16] text-[#E8DCC5] shadow-lg hover:shadow-xl hover:-translate-y-0.5'}`}
                >
                  <span className="relative z-10">
                    {isUnlocked ? t('journey.cta', 'Discover Your Fragrance') : unlocking ? t('draw.loading') + '...' : `${t('result.unlock', 'Unlock Full Reading')} - ${priceLabel}`}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-1000 ease-in-out rounded-full" />
                </button>

                <div className="flex flex-col items-center gap-1 text-center">
                  {orderError && <span className="text-xs text-red-800/80 animate-pulse font-serif">{orderError}</span>}
                </div>
              </div>

              {isUnlocked && (
                <div
                  className="absolute inset-0 z-40"
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </div>
          </div>

          </motion.div>
      </div>
    </div>
  )
}

export default Result
