import { Body, Controller, Get, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../entities/question.entity';

@Controller('api/questionnaire')
export class QuestionnaireController {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
  ) {}

  @Get('questions')
  async getQuestions() {
    return this.questionRepo.find({
      where: { active: true },
      order: { weight: 'ASC', id: 'ASC' },
    });
  }

  @Post()
  async submit(@Body() body: { q1: string; q2: string; q3: string }) {
    // No persistence for now; echo back
    return { received: body };
  }
}
