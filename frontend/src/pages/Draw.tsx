import React, { useState, useRef, useCallback, memo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionValueEvent, MotionValue, animate } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

// --- Constants ---
const TOTAL_CARDS = 78

const INITIAL_INDEX = 38

// --- Types ---
// --- Types ---
interface WheelProps {
  onCardSelect: (cardId: number, startRect: DOMRect, rotation: number) => void;
  selectedCards: (number | null)[];
  flyingCardId: number | null;
}

interface WheelCardProps {
  absoluteIndex: number;
  scrollIndex: MotionValue<number>;
  cardId: number;
  onClick: (e: React.MouseEvent | React.TouchEvent, rotation: number) => void;
  isHidden: boolean;
}

// --- Components ---

import { CardFace } from '../components/CardFace'
import drawBg from '../assets/draw_bg.jpg'

import { createPortal } from 'react-dom'

// Flying Card Component for Animation
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
    onComplete: () => void 
}) => {
    // Portal Strategy: Render to body to escape parent transforms.

    // Fixed Dimensions for the card (must match WheelCard size)
    const CARD_WIDTH = 120
    const CARD_HEIGHT = 180

    // Start Geometry (Center based)
    const startCenterX = startRect.left + startRect.width / 2
    const startCenterY = startRect.top + startRect.height / 2
    
    // Target Geometry (Center based)
    const targetCenterX = targetRect.left + targetRect.width / 2
    const targetCenterY = targetRect.top + targetRect.height / 2

    // Initial State: Center the fixed-size card on the start rect's center
    // We ignore startRect.width/height to avoid "rotated bounding box" expansion issues
    const initialTop = startCenterY - CARD_HEIGHT / 2
    const initialLeft = startCenterX - CARD_WIDTH / 2
    
    // Target State: Use TARGET dimensions (or fixed) centered at TARGET position
    const targetWidth = targetRect.width
    const targetHeight = targetRect.height
    const targetTop = targetCenterY - targetHeight / 2
    const targetLeft = targetCenterX - targetWidth / 2

    return createPortal(
        <motion.div
            initial={{ 
                position: 'fixed',
                top: initialTop,
                left: initialLeft,
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                rotate: initialRotate, 
                scale: 1,
                opacity: 1,
                zIndex: 99999, 
            }}
            animate={{ 
                top: targetTop,
                left: targetLeft,
                width: targetWidth,
                height: targetHeight,
                rotate: 0,
                scale: 1,
            }}
            transition={{ 
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1], // Smooth easeOut
            }}
            onAnimationComplete={onComplete}
            className="pointer-events-none font-serif fixed z-[99999]"
            style={{ transformOrigin: 'center center' }}
        >
            <div className="w-full h-full relative shadow-2xl">
                 <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.8, 0] }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-[#D4A373] blur-xl rounded-lg"
                 />
                 {/* Use 'slot' variant but let width/height driver determine aspect ratio */}
                 <CardFace id={cardId} variant="slot" vertical={true} side="back" />
            </div>
        </motion.div>,
        document.body
    )
}

const WheelCard = memo(({ absoluteIndex, scrollIndex, cardId, onClick, isHidden }: WheelCardProps) => {
    const [isHovered, setIsHovered] = useState(false)

    // Calculate distance from center
    const distance = useTransform(scrollIndex, (current: number) => {
        return absoluteIndex - current
    })

    // --- Visuals: Vertical Stack, Horizontal Cards ---

    // 1. Rotation: Fanning out clockwise
    const anglePerCard = -6 
    const rotateZ = useTransform(distance, (d) => d * anglePerCard)

    // 2. Y Position: Waterfall flow (Vertical spacing)
    // Adjusted spacing for horizontal cards (shorter height = less spacing needed potentially, or more)
    const y = useTransform(distance, (d) => d * 65)

    // 3. X Position: Arc
    const x = useTransform(distance, (d) => {
        return Math.pow(d, 2) * 2.0
    })

    // 4. Z-Index: Stacking Order
    const zIndex = isHovered ? 9999 : absoluteIndex

    const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
        if (isHidden) return
        const currentDist = absoluteIndex - scrollIndex.get()
        const currentRotation = currentDist * anglePerCard
        onClick(e, currentRotation)
    }

    return (
        <motion.div
            style={{
                x,
                y,
                rotateZ, 
                zIndex,
                rotateY: 0, 
                rotateX: 0,
                scale: 1,
                opacity: isHidden ? 0 : 1,
                transformOrigin: "center center", 
            }}
            // Position: Right side
            // Rotate 90deg to make card horizontal
            className="absolute top-[35%] right-[15%] w-[120px] h-[180px] origin-center cursor-pointer will-change-transform"
            onClick={handleClick}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
             {/* Inner container handles the 90deg rotation and hover effects */}
             <motion.div 
                className="w-full h-full shadow-[-5px_0px_10px_rgba(0,0,0,0.2)] rounded-lg bg-[#14100F]"
                style={{ rotate: 90 }} // Permanent 90deg rotation
                animate={{
                    // Rotated 90deg CW: 
                    // Local X+ (Right) -> Global Y+ (Down)
                    // Local Y+ (Down) -> Global X- (Left)
                    // We want to move Global Left (pop out). So we need Positive Local Y.
                    y: isHovered ? 40 : 0, 
                    x: 0,
                    scale: isHovered ? 1.1 : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                whileTap={{ scale: 0.95 }}
             >
                 <CardFace id={cardId} variant="slot" vertical={true} side="back" />
            </motion.div>
        </motion.div>
    )
})

const Wheel: React.FC<WheelProps> = ({ onCardSelect, selectedCards, flyingCardId }) => {
  // --- Infinite Scroll State ---
  const scrollIndex = useMotionValue(INITIAL_INDEX)
  
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
      if (navigator.vibrate) navigator.vibrate(5)
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
    const cardId = ((clickedAbsoluteIndex % TOTAL_CARDS) + TOTAL_CARDS) % TOTAL_CARDS
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    onCardSelect(cardId, rect, rotation)
  }, [scrollIndex, onCardSelect])

  // Reduce visible range
  const visibleRange = 10 
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
                   const cardId = ((index % TOTAL_CARDS) + TOTAL_CARDS) % TOTAL_CARDS
                   const isHidden = selectedCards.includes(cardId) || cardId === flyingCardId
                   return (
                     <WheelCard
                       key={index}
                       absoluteIndex={index}
                       scrollIndex={smoothIndex}
                       cardId={cardId}
                       onClick={(e, rot) => handleCardClick(index, e, rot)}
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
  const [flyingCard, setFlyingCard] = useState<{ id: number, startRect: DOMRect, targetRect: DOMRect, targetIndex: number, initialRotate: number } | null>(null)
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])
  // containerRef removed as we use Portal

  const handleCardSelect = useCallback((cardId: number, startRect: DOMRect, rotation: number = 0) => {
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
                targetIndex: targetIndex,
                initialRotate: rotation
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
    <div 
      className="min-h-screen w-full bg-[#F7F2ED] text-[#4A4A4A] overflow-hidden relative font-serif"
    >
      
      {/* WHEEL BACKGROUND (Z-0) */}
      <Wheel onCardSelect={handleCardSelect} selectedCards={selectedCards} flyingCardId={flyingCard?.id ?? null} />

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
            <div className="flex flex-col gap-6 mb-12 w-full max-w-[180px]">
            {[0, 1, 2].map((index) => {
                const cardId = selectedCards[index]
                const slotNames = ['past', 'present', 'future']
                return (
                <div
                    key={index}
                    ref={el => slotRefs.current[index] = el}
                    className="relative w-full aspect-[2/3] rounded-xl border-2 border-[#D4A373]/40 flex items-center justify-center bg-white/20 backdrop-blur-md shadow-[0_8px_24px_rgba(212,163,115,0.15)] overflow-hidden group transition-all duration-300 hover:border-[#D4A373]/60 hover:shadow-[0_12px_32px_rgba(212,163,115,0.25)]"
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
      </div>
      
      {/* Flying Card Overlay - MOVED TO BOTTOM FOR HIGHEST Z-STACKING */}
      {flyingCard && (
          <FlyingCard 
            cardId={flyingCard.id} 
            startRect={flyingCard.startRect} 
            targetRect={flyingCard.targetRect} 
            initialRotate={flyingCard.initialRotate}
            onComplete={handleAnimationComplete} 
          />
      )}
    </div>
  )
}

export default Draw
