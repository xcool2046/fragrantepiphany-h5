import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

// 优雅的四角星 SVG 组件
const StarIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    style={{ overflow: 'visible' }} // 允许光晕溢出
  >
    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
  </svg>
)

// 单个星星组件，负责自己的生命周期（出现 -> 消失 -> 换个位置重生）
const SingleStar = () => {
  // 每次 cycle 变化都会重新生成随机参数
  const [cycle, setCycle] = React.useState(0)
  
  const config = useMemo(() => {
    const isFlare = Math.random() > 0.6
    return {
      id: Math.random(), // 强制刷新 key
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: isFlare ? 8 + Math.random() * 10 : 2 + Math.random() * 3,
      opacity: 0.1 + Math.random() * 0.4, // 稍微调高一点上限
      duration: 2 + Math.random() * 3, // 单次闪烁时长
      delay: cycle === 0 ? Math.random() * 5 : Math.random() * 2, // 首次随机延迟长一点，后续短一点
      type: isFlare ? 'flare' : 'dot' as const
    }
  }, [cycle])

  return (
    <motion.div
      key={config.id} // 关键：key 变化会触发组件重载，确保动画重置
      className="absolute text-[#D4A373]"
      style={{
        left: `${config.x}%`,
        top: `${config.y}%`,
        width: config.size,
        height: config.size,
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: [0, config.opacity, 0],
        scale: config.type === 'flare' ? [0.8, 1.2, 0.8] : [0.8, 1, 0.8],
        rotate: config.type === 'flare' ? [0, 45] : 0, // 星芒轻微旋转
      }}
      transition={{
        duration: config.duration,
        ease: "easeInOut",
        delay: config.delay,
      }}
      onAnimationComplete={() => setCycle(c => c + 1)} // 动画结束后进入下一个循环（重生）
    >
      {config.type === 'flare' ? (
        <div className="relative w-full h-full">
          <StarIcon className="w-full h-full drop-shadow-[0_0_2px_rgba(212,163,115,0.6)]" />
          <div className="absolute inset-0 bg-[#D4A373] rounded-full blur-[4px] opacity-30" />
        </div>
      ) : (
        <div className="w-full h-full rounded-full bg-current opacity-60 blur-[0.5px]" />
      )}
    </motion.div>
  )
}

const StarryBackground: React.FC = () => {
  // 生成固定数量的星星槽位，每个槽位独立运作
  const starSlots = useMemo(() => Array.from({ length: 40 }), [])

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {starSlots.map((_, i) => (
        <SingleStar key={i} />
      ))}
    </div>
  )
}

export default StarryBackground
