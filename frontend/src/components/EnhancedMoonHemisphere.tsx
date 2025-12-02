import React, { useEffect, useRef } from 'react'

const EnhancedMoonHemisphere: React.FC = () => {
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

    // Draw moon hemisphere with advanced stippling effect
    drawAdvancedMoonStippling(ctx, centerX, centerY, moonRadius, width, height)
  }, [])

  const drawAdvancedMoonStippling = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    width: number,
    height: number
  ) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw lower hemisphere only with stippling
    drawStippledHemisphere(ctx, centerX, centerY, radius)
  }

  const drawStippledHemisphere = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
  ) => {
    // Color palette: cool grey-beige tones
    const colorPalette = [
      { color: 'rgba(232, 224, 216, 0.8)', size: 0.6 },   // Very light beige
      { color: 'rgba(216, 208, 200, 0.7)', size: 0.8 },   // Light grey-beige
      { color: 'rgba(200, 192, 184, 0.6)', size: 1.0 },   // Medium grey-beige
      { color: 'rgba(184, 176, 168, 0.5)', size: 1.2 },   // Darker grey-beige
      { color: 'rgba(168, 160, 152, 0.4)', size: 1.4 },   // Deep grey-beige
    ]

    // Generate points in a grid-like pattern for stippling
    const pointDensity = 0.15 // Points per pixel area
    const estimatedPoints = Math.floor(radius * radius * Math.PI * pointDensity)

    // Use seeded distribution for more natural look
    for (let i = 0; i < estimatedPoints; i++) {
      // Use Fibonacci sphere-like distribution for better coverage
      const angle = Math.random() * Math.PI * 2
      const distanceRatio = Math.sqrt(Math.random())
      const distance = distanceRatio * radius

      const x = centerX + Math.cos(angle) * distance
      const y = centerY + Math.sin(angle) * distance

      // Only draw in lower hemisphere
      if (y <= centerY) continue

      // Calculate depth/distance from center for shading
      const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
      const depthRatio = distFromCenter / radius

      // Calculate vertical fade (bottom fades out)
      const verticalFade = Math.max(0, 1 - (y - centerY) / (radius * 1.3))

      // Select color based on depth and position
      const colorIndex = Math.min(
        Math.floor(depthRatio * colorPalette.length),
        colorPalette.length - 1
      )
      const selectedColor = colorPalette[colorIndex]

      // Modulate opacity with vertical fade
      const finalOpacity = verticalFade * (0.6 + depthRatio * 0.4)
      const colorWithOpacity = selectedColor.color.replace(
        /[\d.]+\)$/,
        `${finalOpacity})`
      )

      // Size varies with position
      const sizeVariation = 0.7 + Math.random() * 0.6
      const finalSize = selectedColor.size * sizeVariation * (0.8 + verticalFade * 0.4)

      // Draw point
      ctx.fillStyle = colorWithOpacity
      ctx.beginPath()
      ctx.arc(x, y, finalSize, 0, Math.PI * 2)
      ctx.fill()
    }

    // Add soft edge glow
    const glowGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      radius * 0.8,
      centerX,
      centerY,
      radius * 1.2
    )
    glowGradient.addColorStop(0, 'rgba(232, 224, 216, 0.1)')
    glowGradient.addColorStop(1, 'rgba(232, 224, 216, 0)')

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 1.2, Math.PI, Math.PI * 2)
    ctx.fillStyle = glowGradient
    ctx.fill()
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[70vh] pointer-events-none"
      style={{ aspectRatio: 'auto' }}
    />
  )
}

export default EnhancedMoonHemisphere
