import { useState, useRef } from 'react'
import { motion, useMotionValue, useSpring, type PanInfo } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import tarotData from '../assets/tarot_data.json'

type TarotCard = {
  id: number
  name_en?: string
  name_cn?: string
  image?: string
  meaning?: Record<string, string>
}

// Constants
const TOTAL_CARDS = 78
const WHEEL_SIZE = '160vw' // Large arc anchored toward left-center
const WHEEL_OFFSET_LEFT = '-30vw' // Shift wheel left to reveal arc
const CARD_RADIUS = '50vw' // Distance from center to cards
const VISIBLE_ANGLE = 120 // Degrees of the wheel visible/usable
const ANGLE_PER_CARD = 2.3 // Degrees between cards to prevent over-wrapping

export default function Draw() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const rippleId = useRef(0)
  
  const [selected, setSelected] = useState<TarotCard[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [scale, setScale] = useState(1)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  
  // Rotation Logic
  const rotation = useMotionValue(0)
  const smoothRotation = useSpring(rotation, { damping: 20, stiffness: 100 })
  
  // Zoom Logic (Pinch)
  const touchStartDist = useRef<number>(0)
  const startScale = useRef<number>(1)

  // Mock cards
  const mockCards: TarotCard[] = Array.from({ length: TOTAL_CARDS }, (_, i) => {
    const fallback: TarotCard = { id: i, name_en: `Card ${i}`, image: '/assets/card-back.jpg' }
    return (tarotData as TarotCard[])[i] || fallback
  })

  const handlePanStart = () => setIsDragging(true)
  
  const handlePanEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setTimeout(() => setIsDragging(false), 100) // Small delay to prevent click after drag
    
    // Add inertia
    const velocity = info.velocity.x
    const currentRotation = rotation.get()
    const targetRotation = currentRotation + velocity * 0.2
    
    // Boundary checks (optional, or let it spin freely)
    // For now, let's constrain it slightly so we don't lose the cards
    const maxRotation = 10
    const minRotation = -(TOTAL_CARDS * ANGLE_PER_CARD) + VISIBLE_ANGLE
    
    // Apply momentum with boundary
    if (targetRotation > maxRotation) {
      rotation.set(maxRotation)
    } else if (targetRotation < minRotation) {
      rotation.set(minRotation)
    } else {
      rotation.set(targetRotation)
    }
  }

  const handlePan = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Map horizontal drag to rotation
    // Dragging left (negative x) should rotate counter-clockwise (negative angle) to show more cards
    const delta = info.delta.x * 0.15
    rotation.set(rotation.get() + delta)
  }

  // Pinch to Zoom Handler
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      touchStartDist.current = dist
      startScale.current = scale
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const ratio = dist / touchStartDist.current
      const newScale = Math.min(Math.max(startScale.current * ratio, 0.8), 1.5)
      setScale(newScale)
    }
  }

  const selectCard = (card: TarotCard) => {
    if (isDragging) return
    if (selected.find(c => c.id === card.id)) return
    if (selected.length >= 3) return

    const newSelected = [...selected, card]
    setSelected(newSelected)

    if (navigator.vibrate) navigator.vibrate(50)

    if (newSelected.length === 3) {
      const cardIds = newSelected.map(c => c.id)
      localStorage.setItem('last_draw_ids', JSON.stringify(cardIds))
      setTimeout(() => {
        navigate('/result', { state: { cards: cardIds } })
      }, 1000)
    }
  }

  const createRipple = (clientX: number, clientY: number, rect: DOMRect) => {
    const id = rippleId.current++
    const x = clientX - rect.left
    const y = clientY - rect.top
    setRipples(prev => [...prev, { id, x, y }])
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id))
    }, 520)
  }

  const handleBackgroundTap = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    if ('touches' in e) {
      if (e.touches.length !== 1) return
      createRipple(e.touches[0].clientX, e.touches[0].clientY, rect)
    } else {
      createRipple(e.clientX, e.clientY, rect)
    }
  }

  return (
    <div
      className="relative min-h-screen bg-[#F7F2ED] overflow-hidden flex flex-col items-center touch-none px-4 pb-16"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onClick={handleBackgroundTap}
      onTouchEnd={handleBackgroundTap}
    >
      {/* Background Texture & Glow */}
      <div className="absolute inset-0 z-0 bg-[url('/assets/bg-home.png')] bg-cover bg-center opacity-[0.06] pointer-events-none" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_35%_12%,rgba(212,163,115,0.12),transparent_32%),radial-gradient(circle_at_78%_42%,rgba(113,92,72,0.08),transparent_45%),radial-gradient(circle_at_24%_78%,rgba(255,255,255,0.5),transparent_40%)]" />

      {/* Ripple feedback on blank taps */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {ripples.map(r => (
          <motion.span
            key={r.id}
            className="absolute w-16 h-16 rounded-full bg-[#D4A373]/25"
            style={{ left: r.x, top: r.y, marginLeft: -32, marginTop: -32 }}
            initial={{ scale: 0.2, opacity: 0.4 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-30 mt-10 text-center space-y-2">
        <h1 className="font-serif text-3xl text-[#2B1F16] tracking-wide drop-shadow-sm">
          {selected.length === 0
            ? t('draw.title_start', 'Draw Your Card')
            : selected.length === 1
              ? t('draw.title_present', 'The Present')
              : selected.length === 2
                ? t('draw.title_future', 'The Future')
                : t('draw.title_complete', 'Completing...')}
        </h1>
        <p className="text-[#6B5542] text-sm font-light">
          {t('draw.subtitle', 'Pinch to zoom the wheel, swipe to rotate, tap to pick')}
        </p>
        <p className="text-[#6B5542] text-sm uppercase tracking-[0.35em] mt-1">
          {selected.length}/3
        </p>
      </div>

      {/* Wheel Container */}
      <motion.div
        className="absolute top-[60%] -translate-y-1/2 z-30 flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{
          width: WHEEL_SIZE,
          height: WHEEL_SIZE,
          maxWidth: '150vh',
          maxHeight: '150vh',
          left: WHEEL_OFFSET_LEFT,
          scale,
        }}
        ref={containerRef}
      >
        {/* The Wheel Itself */}
        <motion.div
          className="w-full h-full relative rounded-full"
          style={{ rotate: smoothRotation }}
          onPan={handlePan}
          onPanStart={handlePanStart}
          onPanEnd={handlePanEnd}
        >
          {mockCards.map((card, i) => {
            // Distribute cards along the left edge of the circle
            const startAngle = 180 - (VISIBLE_ANGLE / 2)
            const angle = startAngle + (i * ANGLE_PER_CARD)

            return (
              <motion.div
                key={card.id || i}
                className="absolute top-1/2 left-1/2 w-0 h-0 flex items-center justify-center"
                style={{ rotate: `${angle}deg` }}
              >
                <motion.div
                  className="w-24 h-48 origin-center relative"
                  style={{
                    x: CARD_RADIUS, // Push card out to the radius (Positive because 180deg flips axis)
                    rotate: '90deg', // Rotate card to point outward
                  }}
                >
                  {!selected.find(c => c.id === card.id) && (
                    <motion.button
                      layoutId={`card-${card.id}`}
                      onClick={() => selectCard(card)}
                      className="w-full h-full rounded-xl relative overflow-hidden group transition-transform hover:-translate-x-3 focus:outline-none focus:ring-2 focus:ring-[#D4A373]/60"
                      style={{
                        boxShadow: '-4px 0 16px rgba(0,0,0,0.45)',
                      }}
                    >
                      {/* Card Back Design */}
                      <div className="absolute inset-0 bg-[#1a120d]">
                        {/* Texture Noise */}
                        <div className="absolute inset-0 opacity-20 bg-[url('/assets/noise.png')] mix-blend-overlay" />

                        {/* Gold Borders */}
                        <div className="absolute inset-0 border-[0.5px] border-[#D4A373]/40 rounded-xl" />
                        <div className="absolute inset-[4px] border border-[#D4A373]/20 rounded-lg" />

                        {/* Subtle Pattern/Logo */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                          <div className="w-9 h-9 rounded-full border border-[#D4A373]" />
                        </div>
                      </div>

                      {/* Hover Glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#D4A373]/18 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>
                  )}
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Center Decoration (glass ring) */}
        <div className="absolute inset-0 rounded-full border border-[#D4A373]/10 pointer-events-none shadow-[0_0_120px_rgba(212,163,115,0.12)]" />
      </motion.div>

      {/* Radial Gradient Overlay for Focus */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_18%_42%,rgba(247,242,237,0.78)_0%,rgba(247,242,237,0.9)_50%,rgba(247,242,237,1)_72%)]" />
    </div>
  )
}
