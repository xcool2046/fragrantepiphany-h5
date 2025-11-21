import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Interpretation } from '../entities/interpretation.entity'

@Injectable()
export class InterpretationService {
  constructor(
    @InjectRepository(Interpretation) private repo: Repository<Interpretation>,
  ) {}

  async findOne(query: { card_name: string; category?: string; position: string; language?: string }) {
    const lang = (query.language || 'en').toLowerCase()
    const alt = lang === 'en' ? 'zh' : 'en'
    const record = await this.repo.findOne({ where: { card_name: query.card_name, category: query.category, position: query.position } })
    if (!record) return null
    const pick = (field: string) => (record as any)[`${field}_${lang}`] ?? (record as any)[`${field}_${alt}`] ?? null
    return {
      card_name: record.card_name,
      category: record.category,
      position: record.position,
      language: lang,
      summary: pick('summary'),
      interpretation: pick('interpretation'),
      action: pick('action'),
      future: pick('future'),
      recommendation: pick('recommendation'),
    }
  }

  async drawThree(): Promise<Interpretation[]> {
    // placeholder: random 3 distinct rows
    const all = await this.repo.find({ take: 100 })
    const shuffled = all.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 3)
  }

  async importMany(items: Partial<Interpretation>[]) {
    const mapped = items.map((item) => {
      const lang = (item as any).language || 'en'
      const base = {
        card_name: item.card_name,
        category: item.category,
        position: item.position,
        summary_en: null,
        summary_zh: null,
        interpretation_en: null,
        interpretation_zh: null,
        action_en: null,
        action_zh: null,
        future_en: null,
        future_zh: null,
        recommendation_en: null,
        recommendation_zh: null,
      } as any
      const prefix = lang.toLowerCase() === 'zh' ? '_zh' : '_en'
      base[`summary${prefix}`] = (item as any).summary ?? null
      base[`interpretation${prefix}`] = (item as any).interpretation ?? null
      base[`action${prefix}`] = (item as any).action ?? null
      base[`future${prefix}`] = (item as any).future ?? null
      base[`recommendation${prefix}`] = (item as any).recommendation ?? null
      return base
    })
    const entities = this.repo.create(mapped)
    return this.repo.save(entities)
  }

  async findAll(page = 1, limit = 10, filters: any = {}) {
    const qb = this.repo.createQueryBuilder('i')
    if (filters.card_name) qb.andWhere('i.card_name = :card', { card: filters.card_name })
    if (filters.category) qb.andWhere('i.category = :cat', { cat: filters.category })
    if (filters.position) qb.andWhere('i.position = :pos', { pos: filters.position })
    if (filters.language) {
      const lang = filters.language.toLowerCase()
      qb.andWhere(`(i.summary_${lang} IS NOT NULL OR i.interpretation_${lang} IS NOT NULL)`)
    }
    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('i.id', 'DESC')
      .getManyAndCount()
    return { items, total, page, limit }
  }

  async create(data: Partial<Interpretation>) {
    const entity = this.repo.create(data)
    return this.repo.save(entity)
  }

  async update(id: number, data: Partial<Interpretation>) {
    await this.repo.update(id, data)
    return this.repo.findOne({ where: { id } })
  }

  async remove(id: number) {
    return this.repo.delete(id)
  }

  exportAll() {
    return this.repo.find()
  }
}
