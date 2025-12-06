import React, { useState, useRef, useCallback, memo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionValueEvent, MotionValue, animate, useAnimation } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import { createPortal } from 'react-dom'

import { CardFace } from '../components/CardFace'
import drawBg from '../assets/draw_bg.jpg'
import { fetchCards } from '../api'

// --- Constants ---
const INITIAL_INDEX = 38
// REMOVED hardcoded TOTAL_CARDS

// --- Types ---
interface WheelProps {
  onCardSelect: (cardId: number, startRect: DOMRect, rotation: number) => void;
  selectedCards: (number | null)[];
  flyingCardId: number | null;
  totalCards: number;
}

interface WheelCardProps {
  absoluteIndex: number;
  scrollIndex: MotionValue<number>;
  cardId: number;
  onClick: (e: React.MouseEvent | React.TouchEvent, rotation: number) => void;
  isHidden: boolean;
  isInteracting: boolean;
}

// --- Components ---

const FlyingCard = ({
    cardId,
    startRect,
    targetRect,
    initialRotate = 0,
    onComplete
}: {
    cardId: number,
    startRect: DOMRect,
    targetRect: DOMRect,
    initialRotate?: number,
    onComplete?: () => void 
}) => {
    // Portal Strategy: Render to body to escape parent transforms.
    
    // Card Constants (Fixed dimensions to match WheelCard)
    const CARD_WIDTH = 80
    const CARD_HEIGHT = 120

    // Start Geometry (Center based)
    const startCenterX = startRect.left + startRect.width / 2
    const startCenterY = startRect.top + startRect.height / 2
    
    // Target Geometry (Center based)
    const targetCenterX = targetRect.left + targetRect.width / 2
    const targetCenterY = targetRect.top + targetRect.height / 2

    // Initial State
    // Center the 80x120 card over the start center
    const initialX = startCenterX - CARD_WIDTH / 2
    const initialY = startCenterY - CARD_HEIGHT / 2
    
    // Target State
    // Center the 80x120 card over the target center
    // FIX: Round to nearest pixel to avoid sub-pixel vibration when switching to static layout
    const targetX = Math.round(targetCenterX - CARD_WIDTH / 2)
    const targetY = Math.round(targetCenterY - CARD_HEIGHT / 2)

    // Scale Calculation
    // FIX: Disable scaling as requested. Keep card at natural 80x120 size.
    const scale = 1

    const controls = useAnimation()

    React.useEffect(() => {
        // 1. Set Initial State Immediately
        controls.set({
            position: 'fixed',
            top: 0,
            left: 0,
            x: initialX,
            y: initialY,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            rotate: initialRotate - 90, // Start as "Horizontal" (Vertical - 90)
            scale: 1,
            opacity: 1,
            zIndex: 99999,
        })

        // 2. Trigger Animation in next frame to ensure browser paints the initial state
        const timer = requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                controls.start({
                    x: targetX,
                    y: targetY,
                    rotate: 0, // Rotate to Vertical (Upright)
                    scale: scale,
                    transition: { 
                        duration: 0.8,
                        ease: "easeOut", // Snappy easeOut
                    }
                }).then(() => {
                    if (onComplete) onComplete()
                })
            })
        })

        return () => cancelAnimationFrame(timer)
    }, [controls, initialX, initialY, initialRotate, targetX, targetY, scale, onComplete])

    return createPortal(
        <motion.div
            animate={controls}
            className="pointer-events-none font-serif fixed z-[99999]"
            style={{ transformOrigin: 'center center' }}
        >
            <div className="w-full h-full relative shadow-[-5px_0px_10px_rgba(0,0,0,0.2)] rounded-lg bg-[#14100F]">
                 <CardFace id={cardId} variant="slot" vertical={true} side="back" />
            </div>
        </motion.div>,
        document.body
    )
}

const WheelCard = memo(({ absoluteIndex, scrollIndex, cardId, onClick, isHidden, isInteracting }: WheelCardProps) => {
    // Calculate distance from center
    const distance = useTransform(scrollIndex, (current: number) => {
        return absoluteIndex - current
    })

    // --- Visuals: Big Wheel Rotation Model ---
    
    // 1. Rotation: Negative angle for Right-Side Center (Counter-Clockwise stack)
    const anglePerCard = -3.0 // Reduced angle for smaller cards
    const rotateZ = useTransform(distance, (d) => d * anglePerCard)

    // 2. Z-Index: Stacking Order (Top cards overlap bottom ones)
    // FIX: Use a large base to prevent negative z-index, which causes occlusion issues.
    const zIndex = 2000 - absoluteIndex

    const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
        if (isHidden || isInteracting) return 
        const currentDist = absoluteIndex - scrollIndex.get()
        const currentRotation = currentDist * anglePerCard
        onClick(e, currentRotation)
    }

    return (
        <motion.div
            style={{
                rotateZ, 
                zIndex,
                rotateY: 0, 
                rotateX: 0,
                scale: 1,
                opacity: isHidden ? 0 : 1,
                // FIX: Center is on the RIGHT side (positive X)
                // Adjusted to 650px for a more visible arc (tighter curve)
                transformOrigin: "650px 50%", 
            }}
            // Position: 
            // transform-origin is 650px to the right.
            // Adjusting right position to bring the arc into view comfortably.
            className={clsx(
                "absolute top-[50%] right-[70px] -mt-[40px] w-[120px] h-[80px] origin-center will-change-transform",
                (isHidden || isInteracting) ? "cursor-default" : "cursor-pointer"
            )}
            onClick={handleClick}
        >
             {/* Inner container handles visual effects. 
                 REMOVED Hover Animation: No more pop-left or scale on hover.
             */}
             <motion.div 
                className="w-full h-full shadow-[-5px_0px_10px_rgba(0,0,0,0.2)] rounded-lg bg-[#14100F]"
                whileTap={{ scale: 0.95 }}
             >
                 <CardFace id={cardId} variant="slot" vertical={false} side="back" />
            </motion.div>
        </motion.div>
    )
})

const Wheel: React.FC<WheelProps> = ({ onCardSelect, selectedCards, flyingCardId, totalCards }) => {
  // --- Infinite Scroll State ---
  const scrollIndex = useMotionValue(INITIAL_INDEX)
  const isFlying = flyingCardId !== null // Derived state for blocking interaction
  
  React.useEffect(() => {
      scrollIndex.set(INITIAL_INDEX)
  }, [])

  const smoothIndex = useSpring(scrollIndex, { 
    stiffness: 150, 
    damping: 30, 
    mass: 1,
  })

  const [renderIndex, setRenderIndex] = useState(INITIAL_INDEX)
  const lastHapticIndex = useRef(INITIAL_INDEX)

  useMotionValueEvent(smoothIndex, "change", (latest) => {
    const rounded = Math.round(latest)
    if (rounded !== renderIndex) {
      setRenderIndex(rounded)
    }
    if (rounded !== lastHapticIndex.current) {
      // Removed haptic feedback
      lastHapticIndex.current = rounded
    }
  })

  // --- Interaction Handlers ---
  const handleWheel = useCallback((e: React.WheelEvent) => {
    const delta = e.deltaY * 0.005 
    scrollIndex.set(scrollIndex.get() + delta)
  }, [scrollIndex])

  const touchStartY = useRef(0)
  const isDragging = useRef(false)
  const lastTouchTime = useRef(0)
  const velocity = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    lastTouchTime.current = Date.now()
    isDragging.current = true
    velocity.current = 0
    scrollIndex.stop() 
  }, [scrollIndex])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return
    const currentY = e.touches[0].clientY
    const currentTime = Date.now()
    const deltaPixel = touchStartY.current - currentY
    const deltaTime = currentTime - lastTouchTime.current
    
    touchStartY.current = currentY
    lastTouchTime.current = currentTime

    const deltaIndex = deltaPixel / 60 
    scrollIndex.set(scrollIndex.get() + deltaIndex)

    if (deltaTime > 0) {
      velocity.current = deltaIndex / deltaTime
    }
  }, [scrollIndex])

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false
    const currentVelocity = velocity.current * 1000 
    animate(scrollIndex, scrollIndex.get() + currentVelocity * 0.6, {
      type: "decay",
      velocity: currentVelocity,
      timeConstant: 250, 
      power: 0.6, 
      restDelta: 0.001,
    })
  }, [scrollIndex])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    touchStartY.current = e.clientY
    lastTouchTime.current = Date.now()
    isDragging.current = true
    velocity.current = 0
    scrollIndex.stop()
  }, [scrollIndex])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    const currentY = e.clientY
    const currentTime = Date.now()
    const deltaPixel = touchStartY.current - currentY
    const deltaTime = currentTime - lastTouchTime.current

    touchStartY.current = currentY
    lastTouchTime.current = currentTime

    const deltaIndex = deltaPixel / 60
    scrollIndex.set(scrollIndex.get() + deltaIndex)

    if (deltaTime > 0) {
      velocity.current = deltaIndex / deltaTime
    }
  }, [scrollIndex])

  const handleMouseUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false
      const currentVelocity = velocity.current * 1000
      animate(scrollIndex, scrollIndex.get() + currentVelocity * 0.6, {
        type: "decay",
        velocity: currentVelocity,
        timeConstant: 250,
        power: 0.6,
        restDelta: 0.001
      })
    }
  }, [scrollIndex])

  const handleCardClick = useCallback((clickedAbsoluteIndex: number, e: React.MouseEvent | React.TouchEvent, rotation: number) => {
    // Immediate selection - No "scroll to center" check
    const cardId = ((clickedAbsoluteIndex % totalCards) + totalCards) % totalCards
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    onCardSelect(cardId, rect, rotation)
  }, [scrollIndex, onCardSelect, totalCards])

  // Reduce visible range
  const visibleRange = 20 
  const indices = []
  for (let i = renderIndex - visibleRange; i <= renderIndex + visibleRange; i++) {
    indices.push(i)
  }

  return (
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden bg-[#F7F2ED] cursor-grab active:cursor-grabbing z-0"
        style={{ touchAction: 'none', perspective: '1200px' }} 
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
            <img 
                src={drawBg} 
                alt="Background" 
                className="w-full h-full object-cover opacity-100"
            />
             {/* Optional: Overlay to ensure text/cards contrast if needed */}
             <div className="absolute inset-0 bg-black/20" /> 
        </div>
        
        {/* Scene Container */}
        <div className="absolute top-0 left-0 w-full h-full z-10">
             <AnimatePresence>
                {indices.map((index) => {
                   const cardId = ((index % totalCards) + totalCards) % totalCards
                   const isHidden = selectedCards.includes(cardId) || cardId === flyingCardId
                   return (
                     <WheelCard
                       key={index}
                       absoluteIndex={index}
                       scrollIndex={smoothIndex}
                       cardId={cardId}
                       onClick={(e, rot) => handleCardClick(index, e, rot)}
                       isHidden={isHidden}
                       isInteracting={isFlying}
                     />
                   )
                })}
             </AnimatePresence>
        </div>
      </div>
  )
}

const Draw: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation() as { state?: { answers?: Record<string, string> } }
  const { t, i18n } = useTranslation()
  const isZh = i18n.language === 'zh'
  const [selectedCards, setSelectedCards] = useState<(number | null)[]>([null, null, null])
  const [submitting, setSubmitting] = useState(false)

  // --- Dynamic Card State ---
  const [totalCards, setTotalCards] = useState<number>(0)
  const [shuffledDeck, setShuffledDeck] = useState<number[]>([])

  // Fetch cards on mount
  React.useEffect(() => {
     fetchCards().then(cards => {
         const count = cards.length
         setTotalCards(count)
         
         // Shuffle Logic (Fisher-Yates)
         const deck = Array.from({ length: count }, (_, i) => i)
         let m = deck.length, t, i;
         while (m) {
           i = Math.floor(Math.random() * m--);
           t = deck[m];
           deck[m] = deck[i];
           deck[i] = t;
         }
         console.log('Deck Shuffled:', deck.slice(0, 5), '...', count, 'cards total')
         setShuffledDeck(deck)
     }).catch(err => {
         console.error('Failed to fetch cards:', err)
         // Fallback? Ideally shouldn't fail if backend is up
     })
  }, [])

  // Animation State
  const [flyingCard, setFlyingCard] = useState<{ id: number, startRect: DOMRect, targetRect: DOMRect, targetIndex: number, initialRotate: number } | null>(null)
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])
  const animationTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleAnimationComplete = useCallback((completedCardId?: number, completedTargetIndex?: number) => {
      // Clear timer
      if (animationTimer.current) {
          clearTimeout(animationTimer.current)
          animationTimer.current = null
      }

      setFlyingCard(currentFlying => {
          if (!currentFlying) return null 
          
          const finalId = completedCardId ?? currentFlying.id
          const finalIndex = completedTargetIndex ?? currentFlying.targetIndex

          setSelectedCards(prev => {
              const newSelected = [...prev]
              newSelected[finalIndex] = finalId
              return newSelected
          })
          
          // Keep flying card for a moment to prevent flash
          return currentFlying 
      })

      // Unmount after a short delay to ensure the slot card is rendered
      setTimeout(() => {
          setFlyingCard(null)
      }, 50)
  }, [])

  const handleCardSelect = useCallback((cardId: number, startRect: DOMRect, rotation: number = 0) => {
    // Safety: Prevent concurrent animations
    if (flyingCard) return

    // Check if card is already selected (in any slot)
    const existingIndex = selectedCards.indexOf(cardId)
    if (existingIndex !== -1) {
      // If already selected, remove it
      setSelectedCards(prev => {
          const newSelected = [...prev]
          newSelected[existingIndex] = null
          return newSelected
      })
      return
    }

    // Determine target slot
    const filledIndices = selectedCards.map((id, idx) => id !== null ? idx : -1).filter(i => i !== -1)
    const maxFilled = filledIndices.length > 0 ? Math.max(...filledIndices) : -1
    
    let targetIndex = maxFilled + 1
    
    if (targetIndex > 2 || selectedCards[targetIndex] !== null) {
        targetIndex = selectedCards.indexOf(null)
    }

    if (targetIndex !== -1) {
        const targetSlot = slotRefs.current[targetIndex]
        
        if (targetSlot) {
            const targetRect = targetSlot.getBoundingClientRect()
            
            // Pass the raw targetRect to FlyingCard. 
            // FlyingCard will handle the scaling calculation based on its fixed dimensions.
            setFlyingCard({
                id: cardId,
                startRect,
                targetRect,
                targetIndex: targetIndex,
                initialRotate: rotation
            })

            // Force complete after 1550ms (1.5s animation + 0.05s buffer)
            if (animationTimer.current) clearTimeout(animationTimer.current)
            animationTimer.current = setTimeout(() => {
                handleAnimationComplete(cardId, targetIndex)
            }, 1550)

        } else {
            // Fallback if ref missing
            setSelectedCards(prev => {
                const newSelected = [...prev]
                newSelected[targetIndex] = cardId
                return newSelected
            })
        }
    }
  }, [selectedCards, flyingCard, handleAnimationComplete])

  const filledCount = selectedCards.filter(id => id !== null).length

  const handleContinue = useCallback(() => {
    if (filledCount !== 3 || submitting) return
    setSubmitting(true)
    
    // Filter out nulls for the result page (These are VISUAL IDs: 0, 1, 2...)
    const visualIds = selectedCards.filter((id): id is number => id !== null)
    
    // Save the Deck Mapping to localStorage so Result page can resolve Visual -> Real
    // shuffledDeck contains the REAL CARD IDs (or virtual IDs aligned with backend list indices)
    // Wait, shuffledDeck is just 0..N-1 shuffled. 
    // In our dynamic implementation, `shuffledDeck[visualId]` maps Visual ID to Real Index ID.
    // If backend returns 80 cards, shuffledDeck has 0..79 in random order.
    // Wheel renders 0..79 (Visual IDs).
    // When Wheel Card X is clicked, we get X.
    // Wait, `shuffledDeck` logic was:
    // const [shuffledDeck] = useState(() => { const deck = ... return deck })
    // It seems `shuffledDeck` was NOT used in previous code to MAP visual ID to result?
    // Let's check previous Draw.tsx:
    // `const [shuffledDeck] = useState(...)`
    // `const handleContinue = ...`
    // `localStorage.setItem('deck_mapping', JSON.stringify(shuffledDeck))`
    // Yes, it was saving it.
    // So the "Visual ID" selected from the wheel is actually an index into `shuffledDeck`?
    // NO. In `Wheel`, `cardId = ((index % TOTAL_CARDS) + TOTAL_CARDS) % TOTAL_CARDS`.
    // This `cardId` is 0..77.
    // Is this the Visual Position? Or the "Value"?
    // If I click card at pos 5, I get cardId 5?
    // If deck is shuffled, does position 5 mean card 5?
    // The previous code:
    // `const cardId = ...` (based on index)
    // `onCardSelect(cardId ...)`
    // So `cardId` IS the number on the card face / index.
    // Result page uses `cardIds[i]` as index into `deck_mapping`?
    // Result.tsx: `if (state.realCardIds ...)` else `cardIds.map(visualId => mapping[visualId])`
    // So visualId IS the index.
    
    // With dynamic deck:
    // `visualIds` are 0..Count-1.
    // `shuffledDeck` maps 0..Count-1 to "Real Index" (0..Count-1 but shuffled).
    // So if Visual Card 0 is selected, it maps to `shuffledDeck[0]`.
    // Valid.
    
    localStorage.setItem('deck_mapping', JSON.stringify(shuffledDeck))

    // Save Visual IDs to localStorage (for page reload recovery)
    localStorage.setItem('last_card_ids', JSON.stringify(visualIds))
    
    // Navigate with VISUAL IDs. Result page will handle the mapping for content.
    navigate('/result', { state: { cardIds: visualIds, answers: location.state?.answers } })
  }, [filledCount, submitting, selectedCards, navigate, location.state, shuffledDeck])

  // If loading, show nothing or spinner
  if (totalCards === 0) {
      return (
          <div className="min-h-screen w-full bg-[#14100F] flex items-center justify-center">
              <span className="text-[#D4A373] font-serif uppercase tracking-widest">{t('common.loading', 'Loading...')}</span>
          </div>
      )
  }

  return (
    <div 
      className="min-h-screen w-full bg-[#F7F2ED] text-[#4A4A4A] overflow-hidden relative font-serif"
    >
      
      {/* WHEEL BACKGROUND (Z-0) */}
      <Wheel onCardSelect={handleCardSelect} selectedCards={selectedCards} flyingCardId={flyingCard?.id ?? null} totalCards={totalCards} />

      {/* LEFT PANEL: Info & Slots (Z-10, Floating) */}
      {/* pointer-events-none allows clicks to pass through the empty space to the Wheel */}
      <div className="absolute top-0 left-0 h-full w-[34%] min-w-[130px] max-w-[320px] z-10 flex flex-col items-center justify-center p-6 pointer-events-none">
        
        {/* Content Container - pointer-events-auto to re-enable interaction for buttons/slots */}
        <div className="relative z-20 w-full flex flex-col items-center pointer-events-auto">
            {/* Header */}
            <div className="text-center mb-12">
            <h2 className="text-[#F7F2ED] text-lg md:text-xl font-serif tracking-[0.2em] uppercase mb-8 font-medium">{t('draw.yourSpread')}</h2>

            {/* Progress Indicator - Three Dots Only */}
            <div className="flex items-center justify-center gap-3">
                {[0, 1, 2].map((index) => (
                <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    selectedCards[index] !== null
                        ? 'bg-[#D4A373] shadow-[0_0_8px_rgba(212,163,115,0.6)]'
                        : 'bg-[#D4A373]/20'
                    }`}
                />
                ))}
            </div>
            </div>

            {/* Vertical Slots */}
            <div className="flex flex-col gap-6 mb-12 w-[84px]"> {/* Fixed width 84px (80 content + 4 border) */}
            {[0, 1, 2].map((index) => {
                const cardId = selectedCards[index]
                const slotNames = ['past', 'present', 'future']
                return (
                <div
                    key={index}
                    ref={el => slotRefs.current[index] = el}
                    className={clsx(
                        "relative w-full h-[124px] rounded-xl flex items-center justify-center border-2 border-[#D4A373]/40 bg-white/20 backdrop-blur-md shadow-[0_8px_24px_rgba(212,163,115,0.15)] transition-all duration-300", // Constant style
                        cardId === null 
                            ? "hover:border-[#D4A373]/60 hover:shadow-[0_12px_32px_rgba(212,163,115,0.25)]" 
                            : "" 
                    )}
                >
                    {/* Empty State - Breathing Animation */}
                    {cardId === null && (
                    <motion.div 
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <span className="text-[#D4A373] font-serif text-sm tracking-[0.2em] uppercase font-light">
                        {t(`draw.slots.${slotNames[index]}`)}
                        </span>
                    </motion.div>
                    )}

                    {/* Filled State */}
                    {cardId !== null && (
                        <div
                            className="absolute inset-0 w-full h-full z-10 flex items-center justify-center"
                            onClick={() => {
                            // Clear this specific slot
                            setSelectedCards(prev => {
                                const newSelected = [...prev]
                                newSelected[index] = null
                                return newSelected
                            })
                            }}
                        >
                            <div className="w-[80px] h-[120px]"> {/* Fixed size 80x120 to match FlyingCard, centered in slot */}
                                <CardFace id={cardId} variant="slot" vertical={true} />
                            </div>
                        </div>
                    )}
                </div>
                )
            })}
            </div>

            {/* Continue Text - Pre-rendered to prevent layout shift */}
            <div className={clsx(
                "transition-all duration-1000 ease-out",
                (filledCount === 3 && !flyingCard && !submitting) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            )}>
                <div
                    onClick={handleContinue}
                    className={clsx(
                        "text-sm text-[#F7F2ED]/60 animate-bounce uppercase tracking-widest cursor-pointer whitespace-nowrap",
                        isZh ? "w-full text-center" : "w-[84px] text-left pl-1"
                    )}
                >
                    {t('common.tapToContinue')}
                </div>
            </div>
        </div>
      </div>
      
      {/* Flying Card Overlay - MOVED TO BOTTOM FOR HIGHEST Z-STACKING */}
      {flyingCard && (
          <FlyingCard 
            key={flyingCard.id} // FIX: Add key to force remount and animation trigger
            cardId={flyingCard.id} 
            startRect={flyingCard.startRect} 
            targetRect={flyingCard.targetRect} 
            initialRotate={flyingCard.initialRotate}
            onComplete={() => handleAnimationComplete(flyingCard.id, flyingCard.targetIndex)}
          />
      )}
    </div>
  )
}

export default Draw