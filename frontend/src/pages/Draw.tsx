import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, animate, AnimatePresence } from 'framer-motion'
import { useGesture } from '@use-gesture/react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import tarotData from '../assets/tarot_data.json'
import { tapSpring } from '../utils/interactionPresets'
import BackgroundBubbles from '../components/BackgroundBubbles'
import ClickBubbles from '../components/ClickBubbles'
import { PageTransitionOverlay } from '../components/PageTransitionOverlay'
import axios from 'axios'

type TarotCard = {
  id: number
  code?: string
  name_en?: string
  name_cn?: string
  image?: string
  meaning?: Record<string, string>
}

// Constants - V10 (Refined & Restrained)
const BASE_WHEEL_RADIUS = 850
const BASE_CENTER_X_OFFSET = 700
const BASE_ANGLE_PER_CARD = 2.8
const VISIBLE_ANGLE_THRESHOLD = 35

export default function Draw() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [cards, setCards] = useState<any[]>([])
  const [selected, setSelected] = useState<TarotCard[]>([])
  const isDragging = useRef(false)
  const [focusedCardId, setFocusedCardId] = useState<number | null>(null)
  const [flippingCardId, setFlippingCardId] = useState<number | null>(null)
  const [displayingCardId, setDisplayingCardId] = useState<number | null>(null)  // Apple: Stage 3
  const [flyingCardId, setFlyingCardId] = useState<number | null>(null)  // Apple: Stage 4
  const [clickPosition, setClickPosition] = useState<{x: number, y: number} | null>(null)  // For ripple
  const [isExiting, setIsExiting] = useState(false) // Transition state
  
  const rotation = useMotionValue(0)
  const smoothRotation = useSpring(rotation, { damping: 18, stiffness: 140 })  // V10: Smoother + snappier
  
  const containerRef = useRef<HTMLDivElement>(null)

  // 卡牌数据：优先后端 /api/content/cards，失败则回退本地 tarot_data
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await axios.get('/api/content/cards')
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((c: any, idx: number) => ({
            id: idx,
            code: c.code,
            name_en: c.name_en,
            name_cn: c.name_zh || c.name_en,
            image: c.image_url || `/assets/cards/${c.code}.png`,
            meaning: {
              past: c.default_meaning_en || '',
              present: c.default_meaning_en || '',
              future: c.default_meaning_en || '',
            },
          })) as TarotCard[]
          setCards(mapped)
          localStorage.setItem('card_cache', JSON.stringify(mapped))
          return
        }
      } catch (e) {
        console.warn('fetch cards failed, fallback to local tarot data', e)
      }
      const fallbackCards: TarotCard[] = Array.from({ length: (tarotData as any[]).length }, (_, i) => {
        const data = (tarotData as any[])[i] as any
        return {
          id: i,
          code: data.image ? data.image.replace(/\.[^.]+$/, '') : `card_${i}`,
          name_en: data.name_en || `Card ${i}`,
          name_cn: data.name_cn || data.name_en,
          image: data.image ? `/assets/cards/${data.image}` : '/assets/card-back.png',
          meaning: data.meaning_en || data.meaning || {},
        }
      })
      setCards(fallbackCards)
      localStorage.setItem('card_cache', JSON.stringify(fallbackCards))
    }
    fetchCards()
  }, [])

  const totalCards = cards.length || 78
  const MIN_ROTATION = 180 - ((totalCards - 1) * BASE_ANGLE_PER_CARD)
  const MAX_ROTATION = 180
  const INITIAL_ROTATION = 180 - (Math.floor(totalCards / 2) * BASE_ANGLE_PER_CARD)

  useEffect(() => {
    rotation.set(INITIAL_ROTATION)
  }, [INITIAL_ROTATION, rotation])

  const bubbles = [
    { size: 220, x: '10%', y: '15%', color: 'rgba(155, 126, 189, 0.1)', blur: 60, opacity: 0.4, duration: 20, xOffset: 20, yOffset: 15 },
    { size: 180, x: '85%', y: '80%', color: 'rgba(212, 163, 115, 0.1)', blur: 50, opacity: 0.4, duration: 18, xOffset: -15, yOffset: -20 },
  ]

  const snapToGrid = (velocity: number = 0) => {
    const currentRotation = rotation.get()
    const rawIndex = (180 - currentRotation) / BASE_ANGLE_PER_CARD
    let targetIndex = Math.round(rawIndex)
    targetIndex = Math.max(0, Math.min(totalCards - 1, targetIndex))

    const targetRotation = 180 - (targetIndex * BASE_ANGLE_PER_CARD)
    const finalRotation = Math.max(MIN_ROTATION, Math.min(MAX_ROTATION, targetRotation))

    const distanceToBoundary = Math.min(
      targetIndex,  // Distance to start
      (totalCards - 1) - targetIndex  // Distance to end
    )
    let dampingValue = 18  // Default smooth
    if (distanceToBoundary <= 5) dampingValue = 27  // Getting heavier
    if (distanceToBoundary <= 1) dampingValue = 36  // Much heavier
    
    // V10: Velocity-based damping (fast vs slow swipe)
    const speedFactor = Math.abs(velocity)
    if (speedFactor > 50) dampingValue = 15  // Fast swipe = more fluid
    
    animate(rotation, finalRotation, {
      type: "spring",
      stiffness: 140,
      damping: dampingValue,
      velocity: velocity,
      onUpdate: (v) => {
        const currentIndex = Math.round((180 - v) / BASE_ANGLE_PER_CARD)
        const validIndex = Math.max(0, Math.min(totalCards - 1, currentIndex))
        setFocusedCardId(cards[validIndex]?.id || null)
      },
      onComplete: () => {
        // V10: Removed snap haptic (too frequent)
      }
    })
    
    if (targetIndex === 0 || targetIndex === totalCards - 1) {
      if (navigator.vibrate) navigator.vibrate(50)
    }
  }

  useGesture(
    {
      onDrag: ({ delta: [, dy], movement: [, my] }) => {
        isDragging.current = Math.abs(my) > 3
        const rotateDelta = dy * -0.25
        const newRotation = rotation.get() + rotateDelta
        
        // V9: Soft boundary constraint
        const constrainedRotation = Math.max(MIN_ROTATION - 20, Math.min(MAX_ROTATION + 20, newRotation))
        rotation.set(constrainedRotation)
      },
      onDragStart: () => {
        // V10: Removed drag start haptic (interferes with slide feel)
      },
      onDragEnd: ({ velocity: [, vy], direction: [, dy] }) => {
        setTimeout(() => { isDragging.current = false }, 10)
        const velocity = vy * dy * -50
        snapToGrid(velocity)
      },
    },
    {
      target: containerRef,
      drag: { 
        from: () => [0, rotation.get()]
      },
    }
  )

  useEffect(() => {
    if (cards.length > 0) {
      snapToGrid()
    }
  }, [cards])

  const handleCardClick = (card: TarotCard, event?: any) => {
    if (isDragging.current) return

    if (focusedCardId !== card.id) {
      const index = cards.findIndex(c => c.id === card.id)
      const targetRotation = 180 - (index * BASE_ANGLE_PER_CARD)
      animate(rotation, targetRotation, { type: "spring", stiffness: 60, damping: 20 })
      return
    }

    if (selected.find(c => c.id === card.id)) return
    if (selected.length >= 3) return

    // Apple Style: Five-Stage Flow
    // Stage 1: Lock Confirmation (0.2s) - Ripple + Press
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect()
      setClickPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    }
    if (navigator.vibrate) navigator.vibrate(100)  // Taptic feedback
    
    // Stage 2: Flip Animation (0.5s)
    setFlippingCardId(card.id)
    setTimeout(() => setClickPosition(null), 600)  // Clear ripple
    
    // Stage 3: Display Emphasis (0.8s) - Show real card image
    setTimeout(() => {
      setDisplayingCardId(card.id)
      setFlippingCardId(null)
    }, 500)
    
    // Stage 4: Fly to Target (0.6s)
    setTimeout(() => {
      setDisplayingCardId(null)
      setFlyingCardId(card.id)
    }, 1300)  // 0.5 + 0.8
    
    // Stage 5: Merge & Disappear (0.3s)
    setTimeout(() => {
      setFlyingCardId(null)
      const newSelected = [...selected, card]
      setSelected(newSelected)

      if (newSelected.length === 3) {
        if (navigator.vibrate) navigator.vibrate(150)
        const cardCodes = newSelected.map(c => c.code || c.id)
        localStorage.setItem('last_draw_codes', JSON.stringify(cardCodes))
        localStorage.setItem('card_cache', JSON.stringify(cards))
        
        // Optimizing Transition:
        // 1. Wait only 300ms (was 800ms)
        // 2. Trigger fade out
        // 3. Navigate after fade out
        setTimeout(() => {
          setIsExiting(true)
          setTimeout(() => {
            navigate('/result', { state: { cardCodes } })
          }, 500) // Wait for fade out
        }, 300)
      }
    }, 2200)  // 0.5 + 0.8 + 0.6 + 0.3
  }

  if (cards.length === 0) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <motion.div 
      className="relative min-h-screen bg-background overflow-hidden flex flex-col touch-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      <PageTransitionOverlay show={isExiting} variant="maskUp" />

      {/* Blurred Asset Background - Enhanced Detail */}
      <div className="absolute inset-0 z-0 bg-[url('/assets/bg-mystic.png')] bg-cover bg-center blur-[12px] opacity-25 pointer-events-none" />
      
      {/* Second Layer: Subtle Pattern Texture */}
      <div className="absolute inset-0 z-0 bg-[url('/assets/noise.png')] bg-repeat opacity-[0.08] pointer-events-none mix-blend-overlay" />
      
      {/* Ambient Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#D4A373]/10 via-transparent to-[#D4A373]/5" />

      {/* Background Bubbles */}
      <div className="opacity-40">
        <BackgroundBubbles bubbles={bubbles} />
      </div>
      <ClickBubbles />
      
      {/* Apple: Backdrop Blur when displaying card */}
      {displayingCardId !== null && (
        <motion.div
          className="absolute inset-0 z-40 bg-black/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {/* Apple: Radial Ripple Effect */}
      <AnimatePresence>
        {clickPosition && (
          <motion.div
            className="absolute z-50 pointer-events-none"
            style={{
              left: clickPosition.x,
              top: clickPosition.y,
              width: 200,
              height: 200,
              marginLeft: -100,
              marginTop: -100,
            }}
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="w-full h-full rounded-full border-2 border-[#D4A373] bg-gradient-radial from-[#D4A373]/30 to-transparent blur-[4px]" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* V10: Header - Left Aligned with Vertical Progress */}
      <div className="relative z-[100] flex flex-col items-start pl-6 pt-5 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="text-[#D4A373] text-lg">★</span>
          <h1 className="font-serif text-2xl text-[#2B1F16] tracking-[0.2em] drop-shadow-sm uppercase">
            {t('draw.title_start', 'Draw')}
          </h1>
        </div>
        <p className="text-xs text-[#2B1F16]/60 mt-1 tracking-wide">
          Choose Your Destiny
        </p>
        
        {/* V10: Removed bottom card slots (progress dots are sufficient) */}
        <div className="mt-10 flex flex-col gap-5">
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className={`w-[6px] h-[6px] rounded-full transition-all duration-400 ${
                i < selected.length 
                  ? 'bg-gradient-to-br from-[#D4A373] to-[#B8936C] shadow-[0_0_8px_#D4A373]' 
                  : 'bg-transparent border border-[#D4A373]/50'
              }`} 
            />
          ))}
        </div>
      </div>

      {/* Wheel Interaction Area */}
      <div 
        ref={containerRef}
        className="absolute inset-0 z-30 cursor-grab active:cursor-grabbing touch-none"
      >
        <AnimatePresence>
          {cards.map((card, i) => {
            const isSelected = selected.find(c => c.id === card.id)
            const isFlipping = flippingCardId === card.id
            const isDisplaying = displayingCardId === card.id
            const isFlying = flyingCardId === card.id
            
            return !isSelected && (
              <CardItem 
                key={card.id} 
                index={i} 
                card={card} 
                rotation={smoothRotation} 
                isFocused={focusedCardId === card.id}
                isFlipping={isFlipping}
                isDisplaying={isDisplaying}
                isFlying={isFlying}
                selectedCount={selected.length}
                onSelect={(e) => handleCardClick(card, e)}
              />
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function CardItem({ index, card, rotation, isFocused, isFlipping, isDisplaying, isFlying, selectedCount, onSelect }: { 
  index: number, 
  card: TarotCard, 
  rotation: any, 
  isFocused: boolean,
  isFlipping: boolean,
  isDisplaying: boolean,
  isFlying: boolean,
  selectedCount: number,
  onSelect: (e?: React.MouseEvent) => void 
}) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  
  const transform = useMotionValue('')
  const opacity = useMotionValue(0)
  const pointerEvents = useMotionValue('none')
  const zIndex = useMotionValue(0)
  const filter = useMotionValue('brightness(1)')
  const boxShadow = useMotionValue('none')

  useEffect(() => {
    if (isFlipping) {
      setIsPressed(true)  // Apple: Press down
      setTimeout(() => setIsPressed(false), 100)  // Release
      setTimeout(() => setIsFlipped(true), 250)  // Switch at 90deg
    }
  }, [isFlipping])

  const updatePosition = () => {
    const latestAngle = rotation.get()
    
    const currentRadius = BASE_WHEEL_RADIUS
    const currentXOffset = BASE_CENTER_X_OFFSET

    const cardAngle = latestAngle + (index * BASE_ANGLE_PER_CARD)
    const rad = (cardAngle * Math.PI) / 180
    
    const xFromCenter = currentRadius * Math.cos(rad)
    const yFromCenter = currentRadius * Math.sin(rad)
    
    const rightPos = -(xFromCenter + currentXOffset)
    const topPos = yFromCenter
    
    const normalizedAngle = ((cardAngle % 360) + 360) % 360
    const distFromCenter = Math.abs(normalizedAngle - 180)
    
    if (distFromCenter > VISIBLE_ANGLE_THRESHOLD) {
      opacity.set(0)
      pointerEvents.set('none')
    } else {
      opacity.set(1)
      pointerEvents.set('auto')
      zIndex.set(100 - Math.floor(distFromCenter))
      
      const focusFactor = Math.max(0, 1 - (distFromCenter / 20))
      
      // V10: Natural brightness (35%-95%, 2.7x contrast, easeOut curve)
      const easedFocus = 1 - Math.pow(1 - focusFactor, 2)  // easeOut curve
      const brightness = 0.35 + (0.6 * easedFocus)
      
      // V10: Restrained sizing (70%-115%, 1.64x ratio)
      const sizeScale = 0.7 + (0.45 * focusFactor)
      
      // V10: Softer shadows
      const shadowIntensity = focusFactor * 0.6
      const shadowBlur = 6 + (focusFactor * 18)  // Up to 24px
      
      // V10: Gentler edge blur
      const edgeBlur = Math.max(0, (distFromCenter - 25) / 20)
      
      filter.set(`brightness(${brightness}) blur(${edgeBlur}px)`)
      boxShadow.set(`0 ${shadowBlur}px ${shadowBlur * 3}px rgba(0,0,0,${shadowIntensity})`)
      
      const rotateDeg = cardAngle + 90
      transform.set(`translate3d(-${rightPos}px, ${topPos}px, 0) rotate(${rotateDeg}deg) scale(${sizeScale})`)
    }
  }

  useEffect(() => {
    updatePosition()
    const unsubscribeRot = rotation.on('change', updatePosition)
    return () => {
      unsubscribeRot()
    }
  }, [rotation, index])

  const handleClick = (e: React.MouseEvent) => {
    if (!isFlipping && !isDisplaying && !isFlying) {
      onSelect(e)
    }
  }

  // Apple: Display Stage - Center and enlarge
  if (isDisplaying) {
    const imageSrc = card.image?.startsWith('/assets/cards/') ? card.image : `/assets/cards/${card.image}`
    return (
      <motion.div
        className="fixed top-1/2 left-1/2 z-[200] w-[280px] h-[480px] -ml-[140px] -mt-[240px]"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.42, 0, 0.58, 1] }}
      >
        <div className="absolute inset-0 bg-[#D4A373]/20 blur-[40px] rounded-full" />
        <div className="relative w-full h-full rounded-2xl overflow-hidden border-[4px] border-[#D4A373] shadow-2xl">
           <img 
              src={imageSrc} 
              alt={card.name_en}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none" />
        </div>
        <motion.div 
          className="absolute -inset-10 z-[-1]"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
           <div className="absolute top-0 left-1/2 w-1 h-1 bg-[#D4A373] rounded-full blur-[1px]" />
           <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-[#D4A373] rounded-full blur-[1px]" />
           <div className="absolute top-1/2 left-0 w-1 h-1 bg-[#D4A373] rounded-full blur-[1px]" />
        </motion.div>
      </motion.div>
    )
  }

  // Apple: Flying Stage - Fly to progress dot
  if (isFlying) {
    const imageSrc = card.image?.startsWith('/assets/cards/') ? card.image : `/assets/cards/${card.image}`
    const targetX = 27
    const targetY = 110 + (selectedCount * 26)
    return (
      <motion.div
        className="fixed z-[150] w-[100px] h-[170px] origin-top-left"
        initial={{ top: '50%', left: '50%', x: -50, y: -85, scale: 2.8 }}
        animate={{ top: 0, left: 0, x: targetX, y: targetY, scale: 0.05, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 180, mass: 0.8 }}
      >
         <div className="w-full h-full rounded-xl overflow-hidden border-[2px] border-[#D4A373]">
            <img src={imageSrc} alt={card.name_en} className="w-full h-full object-cover" />
         </div>
      </motion.div>
    )
  }

  const imageSrc = card.image?.startsWith('/assets/cards/') ? card.image : `/assets/cards/${card.image}`

  return (
    <motion.div
      className="absolute top-1/2 right-0 w-[100px] h-[170px] origin-center -mt-[85px] -mr-[50px]"
      style={{ 
        right: 0,
        transform: transform,
        opacity,
        zIndex: isFlipping ? 200 : zIndex,  // Lift during flip
        pointerEvents,
        filter: isFlipping ? 'brightness(1) blur(0px)' : filter,  // Clear during flip
        boxShadow,
        perspective: 1000,
        scale: isPressed ? 0.98 : 1  // Apple: Press feedback
      }}
      animate={isPressed ? { scale: [0.98, 1.02, 1.0] } : {}}  // Apple: Bounce back
      transition={{ duration: 0.2 }}
    >
      <motion.button
        {...tapSpring}
        onClick={handleClick}
        className={`w-full h-full rounded-xl relative overflow-visible group transition-all duration-300 focus:outline-none ${
          isFocused ? 'ring-2 ring-[#D4A373]/80' : ''
        }`}
        animate={isFlipping ? { rotateY: 180 } : { rotateY: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}  // V10: Faster flip
        style={{ 
          transformStyle: 'preserve-3d',
          // V10: Extended click area (removed to fix overlap)
          padding: '0px'
        }}
      >
        {/* Card Back */}
        <div 
          className="absolute inset-0 rounded-xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* V9: Improved card background (#4A3527 for better contrast) */}
          <div className="absolute inset-0 bg-[#4A3527] rounded-xl">
            <div className="absolute inset-0 opacity-[0.06] bg-[url('/assets/noise.png')] mix-blend-overlay" />
            
            {/* V9: Enhanced borders (2px, /75 opacity) */}
            <div className="absolute inset-[4px] border-[2px] border-[#D4A373]/75 rounded-lg" />
            <div className="absolute inset-[8px] border-[1px] border-[#D4A373]/35 rounded-md" />
            
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
               <div className="w-10 h-10 border border-[#D4A373] rotate-45" />
            </div>
            
            {/* V9: Improved mirror reflection */}
            <div 
              className="absolute inset-0 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)'
              }}
            />
            
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#D4A373]/8 to-transparent rounded-xl" />
            
            {isFocused && (
               <motion.div 
                 className="absolute inset-0 bg-[#D4A373]/15 rounded-xl"
                 animate={{ 
                   opacity: [0.75, 1.0, 0.75],
                   y: [-2, 0, -2]
                 }}
                 transition={{
                   duration: 2.5,
                   repeat: Infinity,
                   ease: 'easeInOut'
                 }}
               />
            )}
          </div>
        </div>

        {/* Card Front */}
        {isFlipped && (
          <div 
            className="absolute inset-0 rounded-xl overflow-hidden border-[4px] border-[#D4A373]"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <img 
              src={imageSrc} 
              alt={card.name_en}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* V10: Removed multi-layer ripple, using central radial effect instead */}
      </motion.button>
    </motion.div>
  )
}
