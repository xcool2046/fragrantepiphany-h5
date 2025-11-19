import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Interpretation } from '../entities/interpretation.entity'

@Injectable()
export class InterpretationService {
  constructor(
    @InjectRepository(Interpretation) private repo: Repository<Interpretation>,
  ) {}

  findOne(query: { card_name: string; category: string; position: string; language: string }) {
    return this.repo.findOne({ where: query })
  }

  async drawThree(): Promise<Interpretation[]> {
    // placeholder: random 3 distinct rows
    const all = await this.repo.find({ take: 100 })
    const shuffled = all.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 3)
  }

  async importMany(items: Partial<Interpretation>[]) {
    const entities = this.repo.create(items)
    return this.repo.save(entities)
  }

  async findAll(page = 1, limit = 10, filters: any = {}) {
    const where: any = {}
    if (filters.card_name) where.card_name = filters.card_name
    if (filters.category) where.category = filters.category
    if (filters.position) where.position = filters.position
    if (filters.language) where.language = filters.language

    const [items, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    })
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
