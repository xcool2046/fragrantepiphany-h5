import { PerfumeChapter } from '../api'

export const mockPerfumeChapters: PerfumeChapter[] = [
  {
    id: 1,
    order: 1,
    cardName: 'The Lovers',
    sceneChoice: 'A. Rose Garden',
    brandName: 'Jo Malone',
    productName: 'Red Roses Cologne',
    tags: ['Fresh', 'Floral', 'Light'],
    notes: {
      top: 'Fresh red rose, olive leaf, pink pepper',
      heart: 'Rose petals, peony, magnolia',
      base: 'White musk, amber, cedarwood',
    },
    description:
      'Lovers drawn to this are experiencing the genuine opening of new feelings. This perfume brings with it the clarity of fresh rose petals at dawn, bringing pure emotional experience to the initial stage of love or reconnection, allowing that tender heart feeling to be shown by the initial love or re-purchase good fragrance.',
    quote: 'The fragrance of true beginnings',
    imageUrl: '/src/assets/web/07296560-77c6-4ef6-9797-d84d25347096.png',
  },
  {
    id: 2,
    order: 2,
    cardName: 'The Magician',
    sceneChoice: 'B. Warm Wood',
    brandName: 'Diptyque',
    productName: 'Eau Capitale',
    tags: ['Woody', 'Warm', 'Sophisticated'],
    notes: {
      top: 'Pepper, ginger, cardamom',
      heart: 'Rose, cinnamon, clove',
      base: 'Cedarwood, sandalwood, vetiver',
    },
    description:
      'The Magician embodies transformation and power. This warm woody scent brings confidence and presence, creating an aura of sophistication around you. It\'s perfect for those who are manifesting their desires and need to feel grounded in their personal power.',
    quote: 'Power lies in transformation',
    imageUrl: '/src/assets/web/7a62202d-0ab3-4899-b037-cf676229c36c.png',
  },
  {
    id: 3,
    order: 3,
    cardName: 'The Hermit',
    sceneChoice: 'C. Coffee House',
    brandName: 'Byredo',
    productName: 'Rose Noir',
    tags: ['Mysterious', 'Deep', 'Introspective'],
    notes: {
      top: 'Black rose, coffee, labdanum',
      heart: 'Dark chocolate, tobacco, leather',
      base: 'Oud, sandalwood, musk',
    },
    description:
      'The Hermit seeks wisdom in solitude. This mysterious dark floral guides you inward, inviting contemplation and deep self-discovery. The depth of this scent mirrors the journey of finding your own light within, revealing hidden truths and inner wisdom.',
    quote: 'Wisdom blooms in stillness',
    imageUrl: '/src/assets/web/9aa28f50-b479-4eaa-b05d-e7287130c5ca.png',
  },
]
