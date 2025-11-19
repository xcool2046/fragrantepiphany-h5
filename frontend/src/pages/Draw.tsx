import { useTranslation } from 'react-i18next'
import { motion, useAnimation } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { fetchDraw } from '../api'

type Card = { id: number; label: string; image?: string }
// Generate 78 cards
const mockCards: Card[] = Array.from({ length: 78 }, (_, i) => ({ 
  id: i + 1, 
  label: `Card ${i + 1}`,
}))

export default function Draw() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const presetAnswers = (location.state as any)?.answers
  
  const [selected, setSelected] = useState<Card[]>([])
  const [serverCards, setServerCards] = useState<any | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const controls = useAnimation()

  useEffect(() => {
    fetchDraw(presetAnswers?.q1, i18n.language.startsWith('zh') ? 'zh' : 'en')
      .then((data) => setServerCards(data))
      .catch(() => console.error('Draw failed'))
  }, [presetAnswers, i18n.language])

  const spinWheel = async () => {
    if (isSpinning || selected.length >= 3) return

    setIsSpinning(true)
    
    // Random rotation: at least 3 full spins (1080) + random offset
    const randomOffset = Math.random() * 360
    const targetRotation = 1080 + randomOffset

    await controls.start({
      rotate: targetRotation,
      transition: { 
        duration: 3, 
        ease: [0.1, 0, 0.2, 1], // Custom ease out
      }
    })

    // Select a random card (simulated)
    const availableCards = mockCards.filter(c => !selected.find(s => s.id === c.id))
    const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)]
    
    const next = [...selected, randomCard]
    setSelected(next)
    setIsSpinning(false)
    
    controls.set({ rotate: targetRotation % 360 })

    if (next.length === 3) {
      setLoading(true)
      setTimeout(() => {
        navigate('/result', { state: { answers: presetAnswers, cards: next, serverCards } })
      }, 1500)
    }
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#F9F5F1] flex flex-col">
      {/* Top Hint */}
      <div className="absolute top-8 left-0 right-0 z-10 text-center px-4">
        <h2 className="text-2xl font-serif text-text mb-2">{t('draw.title')}</h2>
        <p className="text-sm text-subtext font-light tracking-wide">
          {selected.length === 0 && t('draw.slots.past')}
          {selected.length === 1 && t('draw.slots.now')}
          {selected.length === 2 && t('draw.slots.future')}
          {selected.length === 3 && t('draw.loading')}
        </p>
      </div>

      {/* Left Slots (Past / Now / Future) */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 md:left-12 flex flex-col gap-6 z-10">
        {[t('draw.slots.past'), t('draw.slots.now'), t('draw.slots.future')].map((label, idx) => (
          <div 
            key={idx} 
            className="w-24 h-36 md:w-32 md:h-48 rounded-xl border border-black/5 bg-black/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] flex items-center justify-center relative overflow-hidden"
          >
            {selected[idx] ? (
              <motion.div 
                initial={{ x: 200, opacity: 0, rotate: 180 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 20 }}
                className="w-full h-full bg-gradient-to-br from-[#2B1F16] to-[#1a120d] border border-gold/30 rounded-xl flex items-center justify-center relative"
              >
                <div className="absolute inset-0 opacity-20 bg-[url('/assets/pattern.png')] bg-cover mix-blend-overlay"></div>
                <div className="absolute inset-0 border border-white/10 rounded-xl"></div>
                <span className="absolute text-gold/80 text-xs font-serif tracking-widest uppercase">{selected[idx].label}</span>
              </motion.div>
            ) : (
              <span className="text-xs text-subtext/50 font-medium uppercase tracking-[0.2em]">{label}</span>
            )}
          </div>
        ))}
      </div>

      {/* Right Wheel Container */}
      <div className="absolute top-1/2 -translate-y-1/2 right-[-120px] md:right-[-250px] w-[300px] h-[300px] md:w-[500px] md:h-[500px] flex items-center justify-center z-20">
        {/* Pointer */}
        <div className="absolute left-[-24px] z-20 text-gold text-5xl drop-shadow-lg">
          ◀
        </div>

        {/* Spinning Wheel */}
        <motion.div
          className="w-full h-full rounded-full border-[12px] border-[#2B1F16] bg-[#1a120d] relative shadow-2xl"
          animate={controls}
        >
          {/* Decorative Inner Circle */}
          <div className="absolute inset-4 rounded-full border border-gold/20"></div>
          <div className="absolute inset-16 rounded-full border border-gold/10"></div>
          
          {/* Cards on the wheel (Visual only) */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-12 h-20 bg-gradient-to-b from-[#4A3728] to-[#2B1F16] border border-gold/20 rounded-sm shadow-md"
              style={{
                transform: `translate(-50%, -50%) rotate(${i * 30}deg) translate(120px, 0) rotate(90deg)`, // Push out to edge
              }}
            >
               <div className="w-full h-full opacity-30 bg-[url('/assets/pattern.png')] mix-blend-overlay"></div>
            </div>
          ))}
        </motion.div>

        {/* Center Draw Button */}
        <button
          onClick={spinWheel}
          disabled={isSpinning || selected.length >= 3}
          className="absolute z-30 w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-gold text-white font-serif font-bold text-xl shadow-glow flex items-center justify-center hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 border-4 border-[#2B1F16]"
        >
          {isSpinning ? (
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          ) : (
            t('draw.confirm')
          )}
        </button>
      </div>

      {/* Fallback Draw Button (Mobile Friendly - Crystal Ball Style) */}
      <button
        onClick={spinWheel}
        disabled={isSpinning || selected.length >= 3}
        className="fixed bottom-8 right-8 z-50 md:hidden w-20 h-20 rounded-full shadow-glow flex items-center justify-center active:scale-95 transition-transform overflow-hidden group bg-gradient-gold"
        aria-label="Draw Card"
      >
        {/* Inner Glow / Reflection */}
        <div className="absolute top-2 left-4 w-6 h-3 bg-white/40 blur-sm rounded-full transform -rotate-12"></div>
        <div className="absolute bottom-2 right-4 w-8 h-8 bg-white/10 blur-md rounded-full"></div>
        
        {/* Icon / Text */}
        <span className="relative z-10 text-2xl animate-pulse">✨</span>
        
        {/* Breathing Ring */}
        <div className="absolute inset-0 border-2 border-white/50 rounded-full animate-[ping_3s_ease-in-out_infinite] opacity-30"></div>
      </button>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-[60] bg-[#F9F5F1]/90 backdrop-blur-md flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-[3px] border-gold/30 border-t-gold"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
            </div>
          </div>
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-xl font-serif text-text tracking-widest uppercase"
          >
            {t('draw.loading')}...
          </motion.div>
        </div>
      )}
    </div>
  )
}
