import perfumeImg from '../assets/perfume_sample.png'
import homeImg from '../assets/journey/home.png'

export type JourneyChapterId = 'perfume' | 'home' | 'signature'

export type JourneyChapter = {
  id: JourneyChapterId
  order: number
  keyPrefix: string
  image: string
}

export const journeyChapters: JourneyChapter[] = [
  {
    id: 'perfume',
    order: 1,
    keyPrefix: 'journey.perfume',
    image: perfumeImg,
  },
  {
    id: 'home',
    order: 2,
    keyPrefix: 'journey.home',
    image: homeImg,
  },
  {
    id: 'signature',
    order: 3,
    keyPrefix: 'journey.signature',
    image: perfumeImg,
  },
]

export const chapterById = Object.fromEntries(journeyChapters.map((c) => [c.id, c]))

export const getNextChapter = (id: JourneyChapterId) => {
  const current = chapterById[id]
  if (!current) return null
  const next = journeyChapters.find((c) => c.order === current.order + 1)
  return next || null
}

export const getPrevChapter = (id: JourneyChapterId) => {
  const current = chapterById[id]
  if (!current) return null
  const prev = journeyChapters.find((c) => c.order === current.order - 1)
  return prev || null
}
