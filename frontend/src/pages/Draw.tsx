import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { fetchDraw } from '../api'

type Card = { id: number; label: string; image?: string }
// Generate 78 cards
const mockCards: Card[] = Array.from({ length: 78 }, (_, i) => ({ 
  id: i + 1, 
  label: `Card ${i + 1}`,
  // In a real app, map to actual assets
}))

export default function Draw() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const presetAnswers = (location.state as any)?.answers
  
  const [selected, setSelected] = useState<Card[]>([])
  const [serverCards, setServerCards] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [focusedCard, setFocusedCard] = useState<Card | null>(null)

  // Wheel rotation state
  const rotation = useMotionValue(0)
  const constraintsRef = useRef(null)

  useEffect(() => {
    fetchDraw(presetAnswers?.q1, i18n.language.startsWith('zh') ? 'zh' : 'en')
      .then((data) => setServerCards(data))
      .catch(() => console.error('Draw failed'))
  }, [presetAnswers, i18n.language])

  const handleCardClick = (card: Card) => {
    if (selected.find((c) => c.id === card.id)) return
    setFocusedCard(card)
  }

  const confirmSelection = () => {
    if (!focusedCard) return
    const next = [...selected, focusedCard]
    setSelected(next)
    setFocusedCard(null)

    if (next.length === 3) {
      setLoading(true)
      setTimeout(() => {
        navigate('/result', { state: { answers: presetAnswers, cards: next, serverCards } })
      }, 1000)
    }
  }

  // Calculate card position on the semi-circle

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#F7F0E5] flex flex-col items-center">
      {/* Top Hint */}
      <div className="absolute top-8 z-10 text-center px-4">
        <h2 className="text-xl font-serif text-[#2B1F16]">{t('draw.title')}</h2>
        <p className="text-sm text-[#6B5542] mt-1">{t('draw.tipTop')}</p>
      </div>

      {/* Slots (Past / Now / Future) */}
      <div className="absolute top-24 left-4 flex flex-col gap-4 z-10">
        {[t('draw.slots.past'), t('draw.slots.now'), t('draw.slots.future')].map((label, idx) => (
          <div 
            key={idx} 
            className="w-20 h-32 rounded-lg border-2 border-dashed border-[#D4A373] bg-white/50 flex items-center justify-center relative overflow-hidden"
          >
            {selected[idx] ? (
              <motion.div 
                initial={{ opacity: 0, scale: 1.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full bg-[#2B1F16] text-[#F3E6D7] flex items-center justify-center text-xs p-1 text-center"
              >
                {selected[idx].label}
              </motion.div>
            ) : (
              <span className="text-xs text-[#6B5542]">{label}</span>
            )}
          </div>
        ))}
      </div>

      {/* Wheel Container */}
      {/* Mobile: Smaller wheel, positioned lower to show more cards. Desktop: Larger. */}
      <div className="absolute bottom-[-150px] md:bottom-[-300px] w-[350px] h-[350px] md:w-[800px] md:h-[800px] rounded-full flex justify-center items-start" ref={constraintsRef}>
        <motion.div
          className="relative w-full h-full"
          style={{ rotate: rotation }}
          drag="x"
          dragConstraints={{ left: -1000, right: 1000 }} // Simplified constraints
          onDrag={(_e, info) => {
            // Convert drag x to rotation
            const newRotate = rotation.get() + info.delta.x * 0.5
            rotation.set(newRotate)
          }}
        >
          {mockCards.map((card, index) => {
            // Only render if not selected
            if (selected.find(c => c.id === card.id)) return null

            const angle = index * 5 - 90 // Spread cards
            return (
              <motion.div
                key={card.id}
                className="absolute top-0 left-1/2 w-24 h-40 bg-[#2B1F16] border border-[#D4A373] rounded-lg origin-bottom-center cursor-pointer shadow-lg"
                style={{
                  x: '-50%',
                  rotate: angle,
                  transformOrigin: '50% 175px', // Mobile radius (350/2)
                }}
                // Override for desktop via media query if needed, or use JS window width. 
                // For simplicity, let's use a responsive style approach or just stick to a smaller wheel for all since it's H5 first.
                // Actually, let's make transformOrigin dynamic or just optimized for mobile.
                // A 350px wheel means 175px radius.
                onClick={() => handleCardClick(card)}
                whileHover={{ y: -20 }}
              >
                {/* Card Back Pattern */}
                <div className="w-full h-full opacity-20 bg-[url('/assets/pattern.png')]"></div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Focused Card Overlay */}
      <AnimatePresence>
        {focusedCard && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="w-64 h-96 bg-[#2B1F16] rounded-xl border-4 border-[#D4A373] shadow-2xl flex items-center justify-center">
                 <span className="text-[#F3E6D7] text-2xl font-serif">{focusedCard.label}</span>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={confirmSelection}
                  className="px-8 py-3 bg-[#D4A373] text-[#2B1F16] rounded-full font-bold shadow-lg hover:bg-[#C49BA3] transition"
                >
                  {t('draw.confirm')}
                </button>
                <button 
                  onClick={() => setFocusedCard(null)}
                  className="px-8 py-3 bg-white text-[#6B5542] rounded-full font-bold shadow-lg hover:bg-gray-100 transition"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-[60] bg-[#F7F0E5] flex items-center justify-center">
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }} 
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-2xl font-serif text-[#2B1F16]"
          >
            {t('draw.loading')}...
          </motion.div>
        </div>
      )}
    </div>
  )
}
