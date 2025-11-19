import React from 'react'
import { useLazyImage } from '../utils/lazyLoad'

interface LazyImageProps {
  src: string
  alt: string
  placeholder?: string
  className?: string
  style?: React.CSSProperties
}

const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E',
  className = '',
  style = {}
}) => {
  const { imageSrc, isLoaded, imgRef } = useLazyImage(src, placeholder)

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      data-src={src}
      alt={alt}
      className={`lazy-image ${isLoaded ? 'loaded' : 'loading'} ${className}`}
      style={style}
      loading="lazy"
    />
  )
}

export default LazyImage
