import React, { useState, useRef, useCallback, memo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionValueEvent, MotionValue, animate } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

// --- Constants ---
const TOTAL_CARDS = 78

const INITIAL_INDEX = 39

// --- Types ---
// --- Types ---
interface WheelProps {
  onCardSelect: (cardId: number, startRect: DOMRect) => void;
  selectedCards: (number | null)[];
  flyingCardId: number | null;
}

interface WheelCardProps {
  absoluteIndex: number;
  scrollIndex: MotionValue<number>;
  cardId: number;
  onClick: (e: React.MouseEvent | React.TouchEvent) => void;
  isHidden: boolean;
}

// --- Components ---

import { CardFace } from '../components/CardFace'

// Flying Card Component for Animation
const FlyingCard = ({ 
    cardId, 
    startRect, 
    targetRect, 
    onComplete 
}: { 
    cardId: number, 
    startRect: DOMRect, 
    targetRect: DOMRect, 
    onComplete: () => void 
}) => {
    // Calculate deltas
    // We render fixed at top-left 0,0 and translate
    
    return (
        <motion.div
            initial={{ 
                position: 'fixed',
                top: startRect.top,
                left: startRect.left,
                width: startRect.width,
                height: startRect.height,
                rotate: 90, // Wheel cards are rotated 90deg visually (horizontal)
                scale: 1,
                zIndex: 200,
                opacity: 1
            }}
            animate={{ 
                top: targetRect.top,
                left: targetRect.left,
                width: targetRect.width,
                height: targetRect.height,
                rotate: 0, // Slot cards are vertical 0deg
                scale: 1,
            }}
            transition={{ 
                duration: 0.5, // Snappier flight
                ease: [0.16, 1, 0.3, 1], // Apple-style easeOut
            }}
            onAnimationComplete={onComplete}
            className="pointer-events-none"
        >
            <div className="w-full h-full relative shadow-2xl">
                 {/* Add a glow effect during flight */}
                 <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.8, 0] }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-[#D4A373] blur-xl rounded-lg"
                 />
                 <CardFace id={cardId} variant="slot" vertical={true} side="back" />
            </div>
        </motion.div>
    )
}

const WheelCard = memo(({ absoluteIndex, scrollIndex, cardId, onClick, isHidden }: WheelCardProps) => {
    // Calculate distance from center (0 means centered)
    const distance = useTransform(scrollIndex, (current: number) => {
        return absoluteIndex - current
    })

    // --- Layout: Vertical Curved Wheel (Rolodex Style) ---
    // 1. Y-axis: Linear vertical distribution
    const ySpacing = 42 // Slightly increased spacing
    const y = useTransform(distance, (d) => d * ySpacing)

    // 2. X-axis: Linear + Parabolic (Diagonal curve to top corner)
    const xCurveFactor = 0.6 // Reduced parabolic curve
    const xLinearFactor = 12 // Linear shift to right
    const xOffset = 0 
    const x = useTransform(distance, (d) => {
        const absD = Math.abs(d)
        return xOffset + (Math.pow(absD, 2) * xCurveFactor) + (absD * xLinearFactor)
    })

    // 3. Rotation: Stronger fan out effect
    const rotateFactor = 7 // Increased rotation
    const rotate = useTransform(distance, (d) => d * rotateFactor)

    // 4. Scale: Larger center, faster decay
    const scale = useTransform(distance, (d) => {
        const absD = Math.abs(d)
        return Math.max(0.8, 1.28 - (absD * 0.05))
    })

    // 5. Opacity: Fade out distant cards
    const opacity = useTransform(distance, [-12, -3, 0, 3, 12], [0, 0.9, 1, 0.9, 0])
    
    // 6. Z-Index: Center on top
    const zIndex = useTransform(distance, (d) => 100 - Math.round(Math.abs(d)))
    
    // NOTE: Darkening/Spotlight effect is now handled by a global overlay in the parent Wheel component.

    return (
        <motion.div
            style={{
                x,
                y,
                scale,
                opacity: isHidden ? 0 : opacity,
                zIndex,
                rotateZ: rotate, // Explicitly rotate Z
                pointerEvents: isHidden ? 'none' : 'auto',
            }}
            // Added whileTap for instant feedback
            whileTap={{ scale: 0.95 }}
            // Adjusted top to 46% to align better with "Present" slot
            className="absolute top-[46%] left-[15%] -translate-y-1/2 w-[120px] h-[76px] origin-center cursor-pointer will-change-transform"
            onClick={isHidden ? undefined : onClick}
        >
            <CardFace id={cardId} variant="wheel" />

            {/* Shadow for depth - Simpler box-shadow or use a PNG asset if needed. 
                Here we use a very subtle localized shadow that moves with the card 
            */}
            <div className="absolute inset-0 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.3)] pointer-events-none" />
        </motion.div>
    )
})

const Wheel: React.FC<WheelProps> = ({ onCardSelect, selectedCards, flyingCardId }) => {
  // --- Infinite Scroll State ---
  const scrollIndex = useMotionValue(INITIAL_INDEX)
  
  // Use a spring for smooth visual updates
  // Tweak physics for "Heavy" feel: Higher damping, Higher mass.
  const smoothIndex = useSpring(scrollIndex, { 
    stiffness: 200, 
    damping: 40, 
    mass: 1,
    restDelta: 0.001 
  })

  const [renderIndex, setRenderIndex] = useState(INITIAL_INDEX)
  const lastHapticIndex = useRef(INITIAL_INDEX)

  useMotionValueEvent(smoothIndex, "change", (latest) => {
    const rounded = Math.round(latest)
    if (rounded !== renderIndex) {
      setRenderIndex(rounded)
    }
    // Haptic Feedback: Trigger when passing an index threshold
    if (rounded !== lastHapticIndex.current) {
      if (navigator.vibrate) {
         // Short, crisp vibration for "tick" feel
         navigator.vibrate(5)
      }
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
    scrollIndex.stop() // Stop any ongoing animation
  }, [scrollIndex])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return
    const currentY = e.touches[0].clientY
    const currentTime = Date.now()
    const deltaPixel = touchStartY.current - currentY
    const deltaTime = currentTime - lastTouchTime.current
    
    touchStartY.current = currentY
    lastTouchTime.current = currentTime

    // Adjust sensitivity
    const deltaIndex = deltaPixel / 60 
    scrollIndex.set(scrollIndex.get() + deltaIndex)

    // Calculate velocity (pixels per ms, converted to index change)
    if (deltaTime > 0) {
      // Weighted average for smoother velocity
      const newVelocity = deltaIndex / deltaTime
      velocity.current = velocity.current * 0.8 + newVelocity * 0.2
    }
  }, [scrollIndex])

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false
    
    // Apply momentum/inertia
    // We use a simple decay animation on the motion value
    const currentVelocity = velocity.current * 1000 // Scale up for usable units
    
    animate(scrollIndex, scrollIndex.get() + currentVelocity * 0.6, {
      type: "decay",
      velocity: currentVelocity,
      timeConstant: 250, // Quicker stop = heavier feel
      power: 0.6, // Less distance = heavier feel
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

  const handleCardClick = useCallback((clickedAbsoluteIndex: number, e: React.MouseEvent | React.TouchEvent) => {
    const current = scrollIndex.get()
    const distance = Math.abs(current - clickedAbsoluteIndex)
    
    if (distance > 0.5) {
      // Smooth scroll to card if it's far
      animate(scrollIndex, clickedAbsoluteIndex, {
        type: "spring",
        stiffness: 200,
        damping: 40
      })
      return
    }

    const cardId = ((clickedAbsoluteIndex % TOTAL_CARDS) + TOTAL_CARDS) % TOTAL_CARDS
    
    // Get click coordinates for animation
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    onCardSelect(cardId, rect)
  }, [scrollIndex, onCardSelect])

  // Reduce visible range for better performance on mobile
  // 8 cards either side is enough for the viewport
  const visibleRange = 8 
  const indices = []
  for (let i = renderIndex - visibleRange; i <= renderIndex + visibleRange; i++) {
    indices.push(i)
  }

  return (
      <div 
        className="flex-1 min-w-0 h-screen relative overflow-hidden bg-[#1a1614] cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }} // Critical for smooth touch handling
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* 1. Ambient Background - Updated for "Film/Noise" Feel */}
        {/* Deep mystical background with noise texture */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,#2B1F16_0%,#130F11_100%)]" />
        
        {/* Noise Texture - Subtle Grain */}
        <div 
            className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay z-0"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`
            }}
        />

        {/* 2. Stage Spotlight Effect (Global Overlay) */}
        <div className="absolute inset-0 pointer-events-none z-[90] bg-[radial-gradient(circle_at_30%_46%,transparent_60px,#0F0B0A_360px)] opacity-90" />
        
        {/* Scene Container */}
        <div className="absolute top-0 left-0 w-full h-full z-10">
             <AnimatePresence>
                {indices.map((index) => {
                   const cardId = ((index % TOTAL_CARDS) + TOTAL_CARDS) % TOTAL_CARDS
                   const isHidden = selectedCards.includes(cardId) || cardId === flyingCardId
                   return (
                     <WheelCard
                       key={index}
                       absoluteIndex={index}
                       scrollIndex={smoothIndex}
                       cardId={cardId}
                       onClick={(e) => handleCardClick(index, e)}
                       isHidden={isHidden}
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
  const { t } = useTranslation()
  const [selectedCards, setSelectedCards] = useState<(number | null)[]>([null, null, null])
  const [submitting, setSubmitting] = useState(false)
  
  // Animation State
  const [flyingCard, setFlyingCard] = useState<{ id: number, startRect: DOMRect, targetRect: DOMRect, targetIndex: number } | null>(null)
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleCardSelect = useCallback((cardId: number, startRect: DOMRect) => {
    // Check if card is already selected (in any slot)
    const existingIndex = selectedCards.indexOf(cardId)
    if (existingIndex !== -1) {
      // If already selected, remove it from that specific slot
      setSelectedCards(prev => {
          const newSelected = [...prev]
          newSelected[existingIndex] = null
          return newSelected
      })
      return
    }

    // Determine target slot
    // Rule: "Default downwards, don't fly into cancelled slot"
    // Logic: Try to fill (maxFilledIndex + 1). If that's not possible (full or out of bounds), fall back to first empty.
    
    const filledIndices = selectedCards.map((id, idx) => id !== null ? idx : -1).filter(i => i !== -1)
    const maxFilled = filledIndices.length > 0 ? Math.max(...filledIndices) : -1
    
    let targetIndex = maxFilled + 1
    
    // If target is out of bounds (e.g. we filled slot 2) or already filled (unlikely given max logic but possible if we skipped slots?), 
    // fall back to the first empty slot (wrapping around).
    if (targetIndex > 2 || selectedCards[targetIndex] !== null) {
        targetIndex = selectedCards.indexOf(null)
    }

    if (targetIndex !== -1) {
        // Trigger Fly Animation to this specific slot
        const targetSlot = slotRefs.current[targetIndex]
        
        if (targetSlot) {
            const targetRect = targetSlot.getBoundingClientRect()
            setFlyingCard({
                id: cardId,
                startRect,
                targetRect,
                targetIndex: targetIndex
            })
        } else {
            // Fallback if ref missing
            setSelectedCards(prev => {
                const newSelected = [...prev]
                newSelected[targetIndex] = cardId
                return newSelected
            })
        }
    }
  }, [selectedCards])

  const handleAnimationComplete = useCallback(() => {
      if (flyingCard) {
          setSelectedCards(prev => {
              const newSelected = [...prev]
              newSelected[flyingCard.targetIndex] = flyingCard.id
              return newSelected
          })
          setFlyingCard(null)
      }
  }, [flyingCard])

  const filledCount = selectedCards.filter(id => id !== null).length

  const handleContinue = () => {
    if (filledCount !== 3 || submitting) return
    setSubmitting(true)
    // Filter out nulls for the result page
    const finalIds = selectedCards.filter((id): id is number => id !== null)
    navigate('/result', { state: { cardIds: finalIds, answers: location.state?.answers } })
  }

  return (
    <div className="min-h-screen w-full bg-[#F7F2ED] text-[#4A4A4A] overflow-hidden flex flex-row font-serif">
      
      {/* LEFT PANEL: Info & Slots (35% width) */}
      <div className="w-[34%] min-w-[130px] max-w-[320px] h-screen flex flex-col items-center justify-center p-6 z-20 relative bg-white/40 border-r border-[#8B5A2B]/10 shadow-xl backdrop-blur-md">

        {/* Header */}
        <div className="text-center mb-12">
           <h2 className="text-[#2B1F16] text-lg md:text-xl font-serif tracking-[0.2em] uppercase mb-8 font-medium">{t('draw.yourSpread')}</h2>

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
        <div className="flex flex-col gap-6 mb-12 w-full max-w-[180px]">
          {[0, 1, 2].map((index) => {
            const cardId = selectedCards[index]
            const slotNames = ['past', 'present', 'future']
            return (
              <div
                key={index}
                ref={el => slotRefs.current[index] = el}
                className="relative w-full aspect-[2/3] rounded-xl border-2 border-[#D4A373]/40 flex items-center justify-center bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm shadow-[0_8px_24px_rgba(212,163,115,0.15)] overflow-hidden group transition-all duration-300 hover:border-[#D4A373]/60 hover:shadow-[0_12px_32px_rgba(212,163,115,0.25)]"
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
                <AnimatePresence>
                  {cardId !== null && (
                    <>
                      {/* Ripple/Impact Effect when card lands - BRIGHT FLASH */}
                      <motion.div
                         initial={{ scale: 0.9, opacity: 0.9 }}
                         animate={{ scale: 1.6, opacity: 0 }}
                         transition={{ duration: 0.8, ease: "easeOut" }}
                         className="absolute inset-0 bg-[#FFD700] rounded-xl z-0 mix-blend-screen"
                      />
                      
                      <motion.div
                        layoutId={`card-slot-${cardId}`} 
                        className="absolute inset-0 w-full h-full z-10 flex items-center justify-center"
                        initial={{ opacity: 0, scale: 1.2, y: 0, rotate: 0 }}
                        animate={{ opacity: 1, scale: 1.1, y: 0, rotate: 0 }} // Portrait layout无需旋转
                        exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)", rotate: 0 }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                        onClick={() => {
                          // Clear this specific slot
                          setSelectedCards(prev => {
                              const newSelected = [...prev]
                              newSelected[index] = null
                              return newSelected
                          })
                        }}
                      >
                         <div className="w-[80px] h-[120px]"> {/* 竖版卡片：直接使用纵向比例，无需旋转 */}
                             <CardFace id={cardId} variant="slot" vertical />
                         </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Continue Button */}
        <button
          disabled={filledCount !== 3 || submitting}
          onClick={handleContinue}
          className={clsx(
            "group relative overflow-hidden w-full max-w-[180px] px-10 py-4 rounded-full transition-all duration-500 text-[11px] uppercase tracking-[0.2em] font-medium whitespace-nowrap",
            filledCount === 3 && !submitting
              ? "bg-[#2B1F16] text-[#F7F2ED] shadow-[0_16px_32px_rgba(43,31,22,0.3)] hover:-translate-y-0.5 hover:shadow-[0_20px_36px_rgba(43,31,22,0.35)]"
              : "bg-[#2B1F16]/30 text-[#2B1F16]/40 cursor-not-allowed shadow-[0_8px_16px_rgba(43,31,22,0.1)]"
          )}
        >
          {filledCount === 3 && !submitting && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-[#2B1F16] via-[#3E2D20] to-[#2B1F16] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[radial-gradient(circle_at_center,white,transparent)] blur-xl transition-opacity duration-500" />
            </>
          )}
          <span className="relative z-10 flex items-center justify-center">
            {submitting ? t('draw.loading') : t('common.continue')}
          </span>
        </button>
      </div>

      {/* RIGHT PANEL: Wheel */}
      <Wheel onCardSelect={handleCardSelect} selectedCards={selectedCards} flyingCardId={flyingCard?.id ?? null} />

      {/* Flying Card Overlay - MOVED TO BOTTOM FOR HIGHEST Z-STACKING */}
      {flyingCard && (
          <FlyingCard 
            cardId={flyingCard.id} 
            startRect={flyingCard.startRect} 
            targetRect={flyingCard.targetRect} 
            onComplete={handleAnimationComplete} 
          />
      )}
    </div>
  )
}

export default Draw
