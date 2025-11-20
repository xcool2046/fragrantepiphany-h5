import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function About() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F9F5F1] text-text font-sans pt-20 px-6 pb-10">
      {/* Nav */}
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
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-gold rounded-full opacity-80 blur-xl"></div>
          <h1 className="text-4xl font-serif text-text relative z-10 -mt-12">Fragrant Epiphany</h1>
          <p className="text-gold uppercase tracking-[0.2em] text-sm font-medium">About Us</p>
        </div>

        {/* Content */}
        <div className="prose prose-stone mx-auto text-center">
          <p className="text-lg font-light leading-relaxed text-text/80">
            Fragrant Epiphany is not just a tarot reading; it is a journey into the soul. 
            We combine ancient wisdom with modern aesthetics to provide you with clarity, 
            guidance, and a touch of magic in your daily life.
          </p>
          <p className="text-lg font-light leading-relaxed text-text/80 mt-6">
            Our readings are designed to be intuitive, empowering, and deeply personal. 
            Whether you seek answers about love, career, or self-discovery, 
            our cards hold the mirror to your inner truth.
          </p>
        </div>

        {/* Decorative Image */}
        <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-card">
          <img src="/assets/bg-home.png" alt="About" className="absolute inset-0 w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
        </div>

      </motion.div>
    </div>
  )
}
