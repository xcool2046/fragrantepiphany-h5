import type { MotionProps } from 'framer-motion'

// 轻触反馈：用于需要与 Quiz 选项保持一致的点击缩放/压感动效
export const tapSpring: MotionProps = {
  whileTap: {
    scale: 0.97,
    opacity: 0.96,
    transition: { duration: 0.08, ease: 'easeOut' },
  },
}
