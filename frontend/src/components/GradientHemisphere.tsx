import React from 'react'

const GradientHemisphere: React.FC = () => {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse 180% 120% at center bottom, rgba(212, 163, 115, 0.2) 0%, rgba(168, 123, 81, 0.15) 30%, rgba(92, 64, 51, 0.08) 60%, transparent 100%)',
      }}
    />
  )
}

export default GradientHemisphere
