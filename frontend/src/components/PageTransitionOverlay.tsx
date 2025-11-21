import { AnimatePresence, motion } from 'framer-motion'

type Variant = 'goldenGlow' | 'maskUp'

export function PageTransitionOverlay({ show, variant = 'goldenGlow', duration = 0.5 }: { show: boolean; variant?: Variant; duration?: number }) {
  return (
    <AnimatePresence>
      {show && variant === 'goldenGlow' && (
        <motion.div
          className="fixed inset-0 z-[140] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-[#F7F2ED]/0 via-[#D4A373]/12 to-[#F7F2ED]/0"
            initial={{ scaleY: 0.9, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 1.05, opacity: 0 }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-radial from-[#D4A373]/16 via-transparent to-transparent blur-[60px]"
            initial={{ scale: 0.85, opacity: 0.4 }}
            animate={{ scale: 1.05, opacity: 0.7 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ duration: duration + 0.05, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      )}

      {show && variant === 'maskUp' && (
        <motion.div
          className="fixed inset-0 z-[160] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="absolute inset-0 bg-[#F7F2ED]"
            initial={{ y: '60%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-10%', opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-[#FFFFFF]/60 via-[#F7F2ED]/70 to-[#D4A373]/12 backdrop-blur-[6px]"
            initial={{ y: '60%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-5%', opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
