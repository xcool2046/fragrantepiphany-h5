import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Interpretation } from '../entities/interpretation.entity'

type DrawResult = {
  past: Interpretation | null
  now: Interpretation | null
  future: Interpretation | null
}

@Injectable()
export class DrawService {
  constructor(@InjectRepository(Interpretation) private repo: Repository<Interpretation>) {}

  async draw(category?: string, language = 'en'): Promise<DrawResult> {
    const qb = this.repo.createQueryBuilder('i').where('i.language = :language', { language })
    if (category) qb.andWhere('i.category = :category', { category })
    const all = await qb.getMany()
    if (all.length < 3) return { past: null, now: null, future: null }
    const shuffled = all.sort(() => Math.random() - 0.5)
    const pick = (pos: string) => shuffled.find((c) => c.position.toLowerCase() === pos.toLowerCase())
    return {
      past: pick('Past') || pick('past') || shuffled[0],
      now: pick('Now') || pick('now') || shuffled[1],
      future: pick('Future') || pick('future') || shuffled[2],
    }
  }
}
