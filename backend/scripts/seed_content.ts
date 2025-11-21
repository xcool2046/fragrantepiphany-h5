import 'dotenv/config'
import path from 'path'
import fs from 'fs'
import { DataSource } from 'typeorm'
import { Question } from '../src/entities/question.entity'
import { Card } from '../src/entities/card.entity'

type LocaleQuiz = {
  quiz: {
    q1: string
    q1Options: string[]
    q2: string
    q2Options: string[]
    q3: string
    q3Options: string[]
  }
}

type TarotCard = {
  id: number
  image: string
  name_en: string
  name_cn?: string
  meaning?: { past?: string; present?: string; future?: string }
  meaning_en?: { past?: string; present?: string; future?: string }
}

async function loadJson<T>(p: string): Promise<T> {
  const abs = path.resolve(p)
  const raw = await fs.promises.readFile(abs, 'utf-8')
  return JSON.parse(raw) as T
}

async function main() {
  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgresql://tarot:tarot@localhost:5432/tarot',
    entities: [Question, Card],
    synchronize: false,
  })
  await ds.initialize()
  const questionRepo = ds.getRepository(Question)
  const cardRepo = ds.getRepository(Card)

  // 1) Questions from locales
  const enLocale = await loadJson<LocaleQuiz>(path.join(__dirname, '../../frontend/src/locales/en.json'))
  const zhLocale = await loadJson<LocaleQuiz>(path.join(__dirname, '../../frontend/src/locales/zh.json'))
  const qs = [
    { key: 'q1', optionsKey: 'q1Options' },
    { key: 'q2', optionsKey: 'q2Options' },
    { key: 'q3', optionsKey: 'q3Options' },
  ]
  for (let idx = 0; idx < qs.length; idx++) {
    const { key, optionsKey } = qs[idx] as { key: keyof LocaleQuiz['quiz']; optionsKey: keyof LocaleQuiz['quiz'] }
    const title_en = (enLocale.quiz as any)[key] as string
    const title_zh = (zhLocale.quiz as any)[key] as string
    const options_en = (enLocale.quiz as any)[optionsKey] as string[]
    const options_zh = (zhLocale.quiz as any)[optionsKey] as string[]
    const existing = await questionRepo.findOne({ where: { title_en } })
    if (existing) {
      existing.title_zh = title_zh
      existing.options_en = options_en
      existing.options_zh = options_zh
      existing.weight = idx * 10
      existing.active = true
      await questionRepo.save(existing)
    } else {
      await questionRepo.save(
        questionRepo.create({
          title_en,
          title_zh,
          options_en,
          options_zh,
          active: true,
          weight: idx * 10,
        }),
      )
    }
  }
  console.log('Seeded questions')

  // 2) Cards from tarot_data.json
  const tarotPath = path.join(__dirname, '../../frontend/src/assets/tarot_data.json')
  const tarotCards = await loadJson<TarotCard[]>(tarotPath)
  let created = 0
  let updated = 0
  for (const tc of tarotCards) {
    const code = tc.image ? tc.image.replace(path.extname(tc.image), '') : `card_${tc.id}`
    const image_url = tc.image ? `/assets/cards/${tc.image}` : null
    const default_meaning_en = tc.meaning_en?.present || tc.meaning_en?.past || tc.meaning_en?.future || null
    const default_meaning_zh = tc.meaning?.present || tc.meaning?.past || tc.meaning?.future || null
    const existing = await cardRepo.findOne({ where: { code } })
    if (existing) {
      Object.assign(existing, {
        name_en: tc.name_en,
        name_zh: tc.name_cn || tc.name_en,
        image_url: image_url || existing.image_url,
        default_meaning_en: default_meaning_en || existing.default_meaning_en,
        default_meaning_zh: default_meaning_zh || existing.default_meaning_zh,
        enabled: true,
      })
      await cardRepo.save(existing)
      updated++
    } else {
      await cardRepo.save(
        cardRepo.create({
          code,
          name_en: tc.name_en,
          name_zh: tc.name_cn || tc.name_en,
          image_url,
          default_meaning_en,
          default_meaning_zh,
          enabled: true,
        }),
      )
      created++
    }
  }
  console.log(`Seeded cards: created ${created}, updated ${updated}`)

  await ds.destroy()
}

main()
  .then(() => {
    console.log('Seed complete')
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
