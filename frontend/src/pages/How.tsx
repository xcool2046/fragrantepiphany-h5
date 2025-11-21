import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { tapSpring } from '../utils/interactionPresets'

export default function How() {
  const navigate = useNavigate()

  const steps = [
    { title: 'Focus', desc: 'Take a deep breath and focus on your question.' },
    { title: 'Draw', desc: 'Select 3 cards from the deck using your intuition.' },
    { title: 'Reveal', desc: 'Uncover the hidden meanings of your Past, Present, and Future.' },
  ]

  return (
    <div className="min-h-screen bg-[#F9F5F1] text-text font-sans pt-20 px-6 pb-10">
      <button 
        onClick={() => navigate('/')} 
        className="fixed top-6 left-6 z-50 w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border border-black/5 flex items-center justify-center shadow-sm hover:scale-105 transition"
      >
        <i className="fas fa-arrow-left text-text/60"></i>
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-12"
      >
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif text-text">How It Works</h1>
          <p className="text-subtext font-light">A simple guide to your spiritual journey</p>
        </div>

        <div className="space-y-8">
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              className="flex items-start gap-6 bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-serif font-bold text-lg shrink-0">
                {i + 1}
              </div>
              <div>
                <h3 className="text-xl font-serif text-text mb-2">{step.title}</h3>
                <p className="text-subtext font-light leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center pt-8">
          <motion.button 
            {...tapSpring}
            onClick={() => navigate('/quiz')}
            className="px-8 py-3 bg-gradient-gold text-white rounded-full font-medium shadow-glow hover:scale-105 transition-transform"
          >
            Start Your Journey
          </motion.button>
        </div>

      </motion.div>
    </div>
  )
}
