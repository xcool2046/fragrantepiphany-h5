import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CardFace } from '../components/CardFace'
import { useTranslation } from 'react-i18next'
import { createCheckout, getOrder, matchRule } from '../api'

// Import assets (Arbitrary assignment, to be verified by user)

interface LocationState {
  cardIds?: number[]
  answers?: Record<string, string>
}

interface RuleMatch {
  interpretation_full?: {
    en?: string
    zh?: string
  } | null
  summary_free?: {
    en?: string
    zh?: string
  } | null
}

type MatchStatus = 'idle' | 'loading' | 'success' | 'error'

const Result: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()

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
  const [ruleMatch, setRuleMatch] = useState<RuleMatch | null>(null)
  const [, setMatchStatus] = useState<MatchStatus>('idle')
  const [unlockedByOrder, setUnlockedByOrder] = useState(false)
  
  // Hardcoded price for simplified UI
  const priceLabel = "$5.00"

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

  // 规则匹配：根据三张牌 + 问卷答案（如有）尝试获取定制解读
  const normalizedCardIds = useMemo(() => {
    return cardIds.map((id) => {
      if (id >= 1 && id <= 78) return id - 1
      if (id >= 0 && id < 78) return id
      return 0
    })
  }, [cardIds])

  useEffect(() => {
    if (normalizedCardIds.length !== 3) return
    setMatchStatus('loading')
    matchRule({ card_indices: normalizedCardIds, answers })
      .then((res) => {
        setRuleMatch(res.rule || null)
        setMatchStatus('success')
      })
      .catch((err) => {
        console.error('rule match failed', err)
        setRuleMatch(null)
        setMatchStatus('error')
      })
  }, [normalizedCardIds, answers])

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
      })
      .catch((err) => {
        console.error('order check failed', err)
      })
  }, [searchParams])

  const isUnlocked = useMemo(() => {
      const debug = searchParams.get('debug');
      const orderId = searchParams.get('orderId');
      const status = searchParams.get('status');
      return (debug === 'unlocked') || unlockedByOrder || (!!orderId && (status === 'paid' || status === 'succeeded'));
  }, [searchParams, unlockedByOrder]);

  const ruleText = useMemo(() => {
    if (!ruleMatch) return null
    return (
      ruleMatch.interpretation_full?.en ||
      ruleMatch.interpretation_full?.zh ||
      ruleMatch.summary_free?.en ||
      ruleMatch.summary_free?.zh ||
      null
    )
  }, [ruleMatch])

  const handleUnlock = async () => {
    setUnlocking(true)
    setOrderError(null)
    try {
      // Create checkout session with hardcoded USD currency
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
                  {ruleText && (
                    <p className="text-[#3E3025] font-serif italic text-center text-sm mb-8 opacity-80 leading-relaxed px-2">
                      {ruleText}
                    </p>
                  )}

                  <div className="text-[#3E3025] font-serif text-sm leading-8 text-left px-2">
                      <div className="flex justify-center mb-6">
                          <div className="w-16 h-[1px] bg-[#4A3B32]/20" />
                      </div>
                      <h3 className="text-center text-base font-serif text-[#4A3B32] mb-4 tracking-wider">{t('result.timeframes.past.label', 'PAST')}</h3>
                      <p className="mb-8">
                          {t('result.timeframes.past.description', "Your journey has led you here. Embrace the wisdom of the cards as they reveal the path ahead. Trust in their guidance, for they speak the language of your soul's deepest knowing.")}
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
                    <p className="mb-0 text-[#3E3025]/90">
                      {t('result.timeframes.present.description', 'The present moment holds infinite possibilities. Open your heart to receive the blessings around you now.')}
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-[1px] bg-[#4A3B32]/15" />
                    </div>
                    <h3 className="text-center text-base font-serif text-[#4A3B32] mb-4 tracking-[0.22em]">{t('result.timeframes.future.label', 'FUTURE')}</h3>
                    <p className="mb-0 text-[#3E3025]/90">
                      {t('result.timeframes.future.description', 'Trust your intuition and take the next step with confidence. Your destiny awaits.')}
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
                    {isUnlocked ? t('journey.cta', 'Discover Your Fragrance') : unlocking ? t('draw.loading') + '...' : t('result.unlock', 'Unlock Full Reading')}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-1000 ease-in-out rounded-full" />
                </button>

                <div className="flex flex-col items-center gap-1 text-center">
                  {!isUnlocked && <span className="font-serif text-sm text-[#D4A373]">{priceLabel}</span>}
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
