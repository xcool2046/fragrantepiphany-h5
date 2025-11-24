import React, { useState, useRef, useCallback, memo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionValueEvent, MotionValue } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

// --- Constants ---
const TOTAL_CARDS = 78

const INITIAL_INDEX = 39

// --- Types ---
interface WheelProps {
  onCardSelect: (cardId: number) => void;
}

interface WheelCardProps {
  absoluteIndex: number;
  scrollIndex: MotionValue<number>;
  cardId: number;
  onClick: () => void;
}

// --- Components ---

import { CardFace } from '../components/CardFace'

const WheelCard = memo(({ absoluteIndex, scrollIndex, cardId, onClick }: WheelCardProps) => {
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
    
    // 7. Brightness/Darkness: Darken distant cards
    const darkOverlayOpacity = useTransform(distance, [-8, 0, 8], [0.6, 0, 0.6])

    // 8. Glow: Only center card glows
    const glowOpacity = useTransform(distance, (d) => {
        const absD = Math.abs(d)
        return Math.max(0, 1 - absD * 0.5) 
    })

    return (
        <motion.div
            style={{
                x,
                y,
                scale,
                opacity,
                zIndex,
                rotateZ: rotate, // Explicitly rotate Z
            }}
            // Adjusted top to 46% to align better with "Present" slot
            className="absolute top-[46%] left-[15%] -translate-y-1/2 w-[120px] h-[76px] origin-center cursor-pointer will-change-transform"
            onClick={onClick}
        >
            {/* Hero Glow (Behind card) */}
            <motion.div 
                style={{ opacity: glowOpacity }}
                className="absolute inset-0 -z-10 bg-[#F5D0A9]/60 blur-[30px] scale-125 rounded-full"
            />
            
            <CardFace id={cardId} variant="wheel" />

            {/* Brightness/Darkness Overlay */}
            <motion.div 
                style={{ opacity: darkOverlayOpacity }}
                className="absolute inset-0 bg-black pointer-events-none rounded-lg transition-opacity duration-300"
            />
        </motion.div>
    )
})

const Wheel: React.FC<WheelProps> = ({ onCardSelect }) => {
  // --- Infinite Scroll State ---
  const scrollIndex = useMotionValue(INITIAL_INDEX)
  
  const smoothIndex = useSpring(scrollIndex, { 
    stiffness: 150, 
    damping: 20, 
    mass: 0.8,
    restDelta: 0.001 
  })

  const [renderIndex, setRenderIndex] = useState(INITIAL_INDEX)
  const lastHapticIndex = useRef(INITIAL_INDEX)

  useMotionValueEvent(smoothIndex, "change", (latest) => {
    const rounded = Math.round(latest)
    if (rounded !== renderIndex) {
      setRenderIndex(rounded)
    }
    if (rounded !== lastHapticIndex.current) {
      lastHapticIndex.current = rounded
    }
  })

  // --- Interaction Handlers ---
  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Invert deltaY for natural scrolling (scroll down = move down list = index decreases? No, usually scroll down = view lower items = index increases)
    // Let's stick to standard: scroll down (positive delta) -> increase index -> move cards up
    const delta = e.deltaY * 0.005 
    scrollIndex.set(scrollIndex.get() + delta)
  }, [scrollIndex])

  const touchStartY = useRef(0)
  const isDragging = useRef(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    isDragging.current = true
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return
    const currentY = e.touches[0].clientY
    const deltaPixel = touchStartY.current - currentY
    touchStartY.current = currentY
    // Drag up (positive delta) -> move cards up -> increase index
    const deltaIndex = deltaPixel / 60 // More sensitive than before
    scrollIndex.set(scrollIndex.get() + deltaIndex)
  }, [scrollIndex])

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false
    const current = scrollIndex.get()
    const target = Math.round(current)
    scrollIndex.set(target)
  }, [scrollIndex])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    touchStartY.current = e.clientY
    isDragging.current = true
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    const currentY = e.clientY
    const deltaPixel = touchStartY.current - currentY
    touchStartY.current = currentY
    const deltaIndex = deltaPixel / 60
    scrollIndex.set(scrollIndex.get() + deltaIndex)
  }, [scrollIndex])

  const handleMouseUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false
      const current = scrollIndex.get()
      const target = Math.round(current)
      scrollIndex.set(target)
    }
  }, [scrollIndex])

  const handleCardClick = useCallback((clickedAbsoluteIndex: number) => {
    const current = scrollIndex.get()
    const distance = Math.abs(current - clickedAbsoluteIndex)
    
    if (distance > 0.5) {
      scrollIndex.set(clickedAbsoluteIndex)
      return
    }

    const cardId = ((clickedAbsoluteIndex % TOTAL_CARDS) + TOTAL_CARDS) % TOTAL_CARDS
    onCardSelect(cardId)
  }, [scrollIndex, onCardSelect])

  // Increase visible range for vertical stack
  const visibleRange = 14 
  const indices = []
  for (let i = renderIndex - visibleRange; i <= renderIndex + visibleRange; i++) {
    indices.push(i)
  }

  return (
      <div 
        className="flex-1 min-w-0 h-screen relative overflow-hidden bg-[#F7F2ED] cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Ambient Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 right-0 w-[800px] h-[800px] bg-[#D4A373]/10 rounded-full blur-[80px] transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,#F7F2ED_100%)]"></div>
        </div>
        
        {/* Scene Container */}
        <div className="absolute top-0 left-0 w-full h-full">
             <AnimatePresence>
                {indices.map((index) => {
                   const cardId = ((index % TOTAL_CARDS) + TOTAL_CARDS) % TOTAL_CARDS
                   return (
                     <WheelCard 
                       key={index}
                       absoluteIndex={index}
                       scrollIndex={smoothIndex}
                       cardId={cardId}
                       onClick={() => handleCardClick(index)}
                     />
                   )
                })}
             </AnimatePresence>
          
          {/* Center Highlight / Selection Zone (Visual Guide) */}
          <div className="absolute top-1/2 left-[15%] -translate-x-1/2 -translate-y-1/2 w-[140px] h-[90px] pointer-events-none z-0">
             {/* Optional: Add a subtle bracket or indicator if needed, currently kept minimal */}
          </div>
        </div>
      </div>
  )
}

const Draw: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation() as { state?: { answers?: Record<string, string> } }
  const { t } = useTranslation()
  const [selectedCards, setSelectedCards] = useState<number[]>([])
  const [submitting, setSubmitting] = useState(false)
  
  const handleCardSelect = useCallback((cardId: number) => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards(prev => prev.filter(id => id !== cardId))
    } else {
      if (selectedCards.length < 3) {
        setSelectedCards(prev => [...prev, cardId])
      }
    }
  }, [selectedCards])

  const handleContinue = () => {
    if (selectedCards.length !== 3 || submitting) return
    setSubmitting(true)
    // 保留手动跳转，附带问卷答案
    navigate('/result', { state: { cardIds: selectedCards, answers: location.state?.answers } })
  }

  return (
    <div className="min-h-screen w-full bg-[#F7F2ED] text-[#4A4A4A] overflow-hidden flex flex-row font-serif">
      
      {/* LEFT PANEL: Info & Slots (35% width) */}
      <div className="w-[34%] min-w-[130px] max-w-[320px] h-screen flex flex-col items-center justify-center p-4 z-20 relative bg-white/40 border-r border-[#8B5A2B]/10 shadow-xl backdrop-blur-md">
        
        {/* Header */}
        <div className="text-center mb-10">
           <h2 className="text-[#8B5A2B] text-sm tracking-[0.3em] uppercase mb-3 drop-shadow-sm">{t('draw.yourSpread')}</h2>
           <p className="text-xs text-[#8B5A2B]/60 font-sans tracking-wide">{t('draw.instruction')}</p>
        </div>
        
        {/* Vertical Slots */}
        <div className="flex flex-col gap-5 mb-10 w-full max-w-[180px]">
          {[0, 1, 2].map((index) => {
            const cardId = selectedCards[index]
            const slotNames = ['past', 'present', 'future']
            return (
              <div 
                key={index}
                className="relative w-full aspect-[2/3] rounded-lg border border-dashed border-[#8B5A2B]/30 flex items-center justify-center bg-white/10 shadow-inner overflow-hidden group"
              >
                {/* Empty State */}
                {cardId === undefined && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[#8B5A2B]/30 font-serif text-sm tracking-widest uppercase group-hover:text-[#8B5A2B]/50 transition-colors">
                      {t(`draw.slots.${slotNames[index]}`)}
                    </span>
                  </div>
                )}

                {/* Filled State */}
                <AnimatePresence>
                  {cardId !== undefined && (
                    <motion.div
                      layoutId={`card-slot-${cardId}`} 
                      className="absolute inset-0 w-full h-full z-10 flex items-center justify-center"
                      initial={{ opacity: 0, scale: 1.2, y: 50, rotate: 90 }}
                      animate={{ opacity: 1, scale: 1.7, y: 0, rotate: 90 }} // Scale up to fill the slot (76px width -> ~130px slot width)
                      exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)", rotate: 90 }}
                      transition={{ type: "spring", stiffness: 120, damping: 20 }}
                      onClick={() => {
                        setSelectedCards(prev => prev.filter(id => id !== cardId))
                      }}
                    >
                       <div className="w-[120px] h-[76px]"> {/* Wrapper to maintain aspect ratio while rotated */}
                           <CardFace id={cardId} variant="slot" />
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Continue Button */}
        <button
          disabled={selectedCards.length !== 3}
          onClick={handleContinue}
          className={clsx(
            "w-full max-w-[160px] h-12 mt-8 rounded-full font-serif border transition-all duration-500 tracking-[0.2em] text-[10px] uppercase relative overflow-hidden shadow-lg",
            selectedCards.length === 3 && !submitting
              ? "bg-text text-white border-transparent shadow-xl"
              : "bg-text/10 text-text/30 border-transparent cursor-not-allowed"
          )}
        >
          <span className="relative z-10">
            {submitting ? t('draw.loading') : t('common.continue')}
          </span>
        </button>
      </div>

      {/* RIGHT PANEL: Wheel */}
      <Wheel onCardSelect={handleCardSelect} />
    </div>
  )
}

export default Draw
