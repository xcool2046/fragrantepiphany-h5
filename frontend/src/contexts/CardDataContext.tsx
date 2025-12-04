import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { fetchCards, Card } from '../api'

interface CardDataContextType {
  cards: Card[]
  loading: boolean
  getCardImageUrl: (id: number) => string | null
}

const CardDataContext = createContext<CardDataContextType | null>(null)

// 简单的内存缓存
let cachedCards: Card[] | null = null
let fetchPromise: Promise<Card[]> | null = null

export function CardDataProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<Card[]>(cachedCards || [])
  const [loading, setLoading] = useState(!cachedCards)

  useEffect(() => {
    if (cachedCards) {
      setCards(cachedCards)
      setLoading(false)
      return
    }

    // 避免重复请求
    if (!fetchPromise) {
      fetchPromise = fetchCards()
    }

    fetchPromise
      .then((data) => {
        cachedCards = data
        setCards(data)
      })
      .catch((err) => {
        console.error('Failed to fetch cards:', err)
      })
      .finally(() => {
        setLoading(false)
        fetchPromise = null
      })
  }, [])

  // 根据卡牌 ID 获取图片 URL
  // ID 是 0-77 (数组索引)，对应 code 01-78
  const getCardImageUrl = (id: number): string | null => {
    const code = String(id + 1).padStart(2, '0')
    const card = cards.find((c) => c.code === code)
    return card?.image_url || null
  }

  return (
    <CardDataContext.Provider value={{ cards, loading, getCardImageUrl }}>
      {children}
    </CardDataContext.Provider>
  )
}

export function useCardData() {
  const context = useContext(CardDataContext)
  if (!context) {
    throw new Error('useCardData must be used within CardDataProvider')
  }
  return context
}
