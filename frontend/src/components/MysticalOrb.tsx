import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import FlowingTexture from './FlowingTexture'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  opacity: number
  orbitRadius: number
  angle: number
}

const MysticalOrb: React.FC = () => {
  // 生成微粒数据
  const particles = useMemo(() => {
    const particleCount = 35 // 减少微粒数量，让画面更清爽
    const generatedParticles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      // 只在半圆范围内生成粒子（0 到 π）
      const angle = Math.random() * Math.PI
      const orbitRadius = 180 + Math.random() * 120 // 轨道半径
      const size = 1 + Math.random() * 2.5 // 1-3.5px，稍微减小

      generatedParticles.push({
        id: i,
        x: Math.cos(angle) * orbitRadius,
        y: Math.sin(angle) * orbitRadius,
        size,
        duration: 18 + Math.random() * 22, // 18-40s
        delay: Math.random() * 5,
        opacity: 0.4 + Math.random() * 0.6, // 0.4-1
        orbitRadius,
        angle,
      })
    }

    return generatedParticles
  }, [])

  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] pointer-events-none overflow-hidden">
      {/* 半球容器 - 剪裁为半圆形 */}
      <div className="absolute inset-0 rounded-t-full overflow-hidden pointer-events-none">
        {/* 流动纹理层 - 极淡 */}
        <div className="absolute inset-0 opacity-30 mix-blend-soft-light">
          <FlowingTexture />
        </div>

        {/* 顶部高光光晕 - 仅保留顶部光辉，不遮挡主体 */}
        <motion.div
          className="absolute inset-0 rounded-t-full"
          animate={{ opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="absolute inset-0 rounded-t-full bg-[radial-gradient(circle_at_center_top,rgba(255,250,240,0.25)_0%,rgba(212,163,115,0.15)_25%,transparent_65%)] blur-[90px]" />
        </motion.div>

        {/* 氛围光晕 - 金色呼吸感 */}
        <motion.div
          className="absolute inset-0 rounded-t-full"
          animate={{
            opacity: [0.15, 0.3, 0.15],
            scale: [0.92, 1.12, 0.92]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="absolute inset-0 rounded-t-full bg-[radial-gradient(circle_at_center_75%,rgba(212,163,115,0.2),transparent_55%)] blur-[110px]" />
        </motion.div>
      </div>

      {/* 微粒系统 - 漂浮的光点 */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white"
            style={{
              width: particle.size,
              height: particle.size,
              left: '50%',
              top: '50%',
              marginLeft: -particle.size / 2,
              marginTop: -particle.size / 2,
            }}
            animate={{
              x: [
                Math.cos(particle.angle) * particle.orbitRadius,
                Math.cos(particle.angle + Math.PI * 0.25) * particle.orbitRadius,
                Math.cos(particle.angle + Math.PI * 0.5) * particle.orbitRadius,
                Math.cos(particle.angle + Math.PI * 0.75) * particle.orbitRadius,
                Math.cos(particle.angle) * particle.orbitRadius,
              ],
              y: [
                Math.sin(particle.angle) * particle.orbitRadius,
                Math.sin(particle.angle + Math.PI * 0.25) * particle.orbitRadius,
                Math.sin(particle.angle + Math.PI * 0.5) * particle.orbitRadius,
                Math.sin(particle.angle + Math.PI * 0.75) * particle.orbitRadius,
                Math.sin(particle.angle) * particle.orbitRadius,
              ],
              opacity: [
                particle.opacity * 0.5,
                particle.opacity,
                particle.opacity * 0.7,
                particle.opacity,
                particle.opacity * 0.5,
              ],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* 第二层微粒 - 较大、较慢的粒子 */}
      <div className="absolute inset-0">
        {particles.slice(0, 15).map((particle) => (
          <motion.div
            key={`large-${particle.id}`}
            className="absolute rounded-full"
            style={{
              width: particle.size * 2,
              height: particle.size * 2,
              left: '50%',
              top: '50%',
              marginLeft: (-particle.size * 2) / 2,
              marginTop: (-particle.size * 2) / 2,
              background: `radial-gradient(circle, rgba(212,163,115,0.5), transparent)`,
            }}
            animate={{
              x: [
                Math.cos(particle.angle) * (particle.orbitRadius * 0.6),
                Math.cos(particle.angle + Math.PI * 0.5) * (particle.orbitRadius * 0.6),
                Math.cos(particle.angle) * (particle.orbitRadius * 0.6),
              ],
              y: [
                Math.sin(particle.angle) * (particle.orbitRadius * 0.6),
                Math.sin(particle.angle + Math.PI * 0.5) * (particle.orbitRadius * 0.6),
                Math.sin(particle.angle) * (particle.orbitRadius * 0.6),
              ],
              opacity: [
                particle.opacity * 0.15,
                particle.opacity * 0.35,
                particle.opacity * 0.15,
              ],
            }}
            transition={{
              duration: particle.duration * 1.5,
              delay: particle.delay + 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default MysticalOrb
