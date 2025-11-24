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
    const qb = this.repo.createQueryBuilder('i')
    if (category) qb.where('i.category = :category', { category })

    const past = await qb.clone().andWhere('LOWER(i.position) = LOWER(:p)', { p: 'Past' }).getMany()
    const now = await qb.clone().andWhere('LOWER(i.position) = LOWER(:p)', { p: 'Now' }).getMany()
    const future = await qb.clone().andWhere('LOWER(i.position) = LOWER(:p)', { p: 'Future' }).getMany()
    if (past.length === 0 || now.length === 0 || future.length === 0) {
      return { past: null, now: null, future: null }
    }
    const pickOne = (arr: Interpretation[]) => arr[Math.floor(Math.random() * arr.length)]
    return {
      past: pickOne(past),
      now: pickOne(now),
      future: pickOne(future),
    }
  }
}
