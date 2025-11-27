import React from 'react'
import './loading.css'

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  className?: string
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  variant = 'text', 
  width = '100%', 
  height,
  className = ''
}) => {
  const defaultHeight = variant === 'text' ? '1em' : variant === 'circular' ? '40px' : '200px'
  
  return (
    <div 
      className={`skeleton skeleton-${variant} ${className}`}
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : defaultHeight
      }}
    />
  )
}

export default Skeleton
