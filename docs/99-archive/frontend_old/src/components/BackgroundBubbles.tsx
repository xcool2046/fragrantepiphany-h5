import { motion } from 'framer-motion'

type Bubble = {
  size: number
  x: string
  y: string
  color: string
  blur: number
  opacity: number
  duration: number
  xOffset: number
  yOffset: number
}

type BackgroundBubblesProps = {
  bubbles: Bubble[]
}

export default function BackgroundBubbles({ bubbles }: BackgroundBubblesProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {bubbles.map((bubble, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: bubble.x,
            top: bubble.y,
            background: bubble.color,
            filter: `blur(${bubble.blur}px)`,
            opacity: bubble.opacity,
          }}
          animate={{
            x: [0, bubble.xOffset, 0],
            y: [0, bubble.yOffset, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: bubble.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
