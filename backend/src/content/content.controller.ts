import { Controller, Get } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Question } from '../entities/question.entity'
import { Card } from '../entities/card.entity'

@Controller('api/content')
export class ContentController {
  constructor(
    @InjectRepository(Question) private questions: Repository<Question>,
    @InjectRepository(Card) private cards: Repository<Card>,
  ) {}

  @Get('questions')
  async listQuestions() {
    const items = await this.questions.find({ where: { active: true }, order: { weight: 'ASC', id: 'ASC' } })
    return items
  }

  @Get('cards')
  async listCards() {
    const items = await this.cards.find({ where: { enabled: true }, order: { code: 'ASC' } })
    return items
  }
}
