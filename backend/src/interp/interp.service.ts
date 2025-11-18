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

  exportAll() {
    return this.repo.find()
  }
}
