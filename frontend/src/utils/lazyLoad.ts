import { lazy, useState, useEffect, useRef } from 'react'
import type { LazyExoticComponent, ComponentType } from 'react'

/**
 * 懒加载工具函数，带有自定义 loading 状态
 */
export function lazyLoad<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(factory)
}

// 图片懒加载 Hook
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '')
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!imgRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const actualSrc = img.dataset.src
            
            if (actualSrc) {
              const tempImg = new Image()
              tempImg.onload = () => {
                setImageSrc(actualSrc)
                setIsLoaded(true)
              }
              tempImg.src = actualSrc
            }
            
            observer.unobserve(img)
          }
        })
      },
      { rootMargin: '50px' }
    )

    observer.observe(imgRef.current)

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current)
      }
    }
  }, [src])

  return { imageSrc, isLoaded, imgRef }
}
