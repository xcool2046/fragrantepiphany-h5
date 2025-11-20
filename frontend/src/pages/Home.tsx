import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center text-center bg-[#1a1a1a]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/bg-home.png" 
          alt="Background" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 max-w-md mx-auto flex flex-col items-center">
        
        {/* App Name */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xs text-gold/90 uppercase tracking-[0.3em] mb-6 font-medium"
        >
          {t('common.appName')}
        </motion.p>
        
        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-5xl font-serif text-white mb-4 leading-tight drop-shadow-lg"
        >
          {t('home.title')}
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-white/80 mb-12 font-light italic text-lg tracking-wide"
        >
          {t('home.subtitle')}
        </motion.p>

        {/* Start Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 1.2 }}
          onClick={() => navigate('/quiz')}
          className="px-10 py-4 bg-gradient-gold text-white rounded-full shadow-glow text-lg font-medium tracking-widest uppercase relative overflow-hidden group"
        >
          <span className="relative z-10">{t('common.start')}</span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </motion.button>

        {/* Learn More (Minimal) */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          whileHover={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          onClick={() => navigate('/about')}
          className="mt-8 text-white/60 text-sm tracking-widest uppercase border-b border-transparent hover:border-gold/50 transition-all pb-1"
        >
          {t('common.learnMore')}
        </motion.button>
      </div>
    </div>
  )
}
