import React, { useEffect, useRef } from 'react'

const MoonHemisphere: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match window
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const centerX = width / 2
    const centerY = height * 0.8 // Position moon lower

    // Moon radius - smaller
    const moonRadius = Math.min(width, height) * 0.25

    // Draw moon hemisphere with particle texture
    drawMoonWithParticles(ctx, centerX, centerY, moonRadius, width, height)
  }, [])

  const drawMoonWithParticles = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    width: number,
    height: number
  ) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Base gradient - lighter colors
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius
    )
    gradient.addColorStop(0, '#FFFAF5')
    gradient.addColorStop(0.3, '#F5EFE8')
    gradient.addColorStop(0.7, '#E8DCD8')
    gradient.addColorStop(1, '#D9CCC0')

    // Draw lower hemisphere only
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw particle texture
    const particleCount = Math.floor(radius * radius * 0.08)
    for (let i = 0; i < particleCount; i++) {
      // Random distribution across moon surface
      const angle = Math.random() * Math.PI * 2
      const distance = Math.sqrt(Math.random()) * radius
      const x = centerX + Math.cos(angle) * distance
      const y = centerY + Math.sin(angle) * distance

      // Skip upper half
      if (y <= centerY) continue

      // Very small particles (0.3-0.7px)
      const particleSize = Math.random() * 0.5 + 0.3

      // Fade out towards bottom
      const bottomFade = Math.max(0, 1 - (y - centerY) / (radius * 1.2))

      const alpha = bottomFade * 0.5

      ctx.fillStyle = `rgba(180, 165, 140, ${alpha})`
      ctx.beginPath()
      ctx.arc(x, y, particleSize, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[70vh] pointer-events-none"
      style={{ aspectRatio: 'auto' }}
    />
  )
}

export default MoonHemisphere
