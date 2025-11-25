import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import { InterpretationService } from './interp.service';
import { AuthGuard } from '@nestjs/passport';
import { DrawService } from './draw.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Rule } from '../entities/rule.entity';
import { Card } from '../entities/card.entity';
import { Question } from '../entities/question.entity';

@Controller('api/interp')
export class InterpretationController {
  constructor(
    private readonly service: InterpretationService,
    private readonly drawService: DrawService,
    @InjectRepository(Rule) private ruleRepo: Repository<Rule>,
    @InjectRepository(Card) private cardRepo: Repository<Card>,
    @InjectRepository(Question) private questionRepo: Repository<Question>,
  ) {}

  @Get()
  async getOne(
    @Query('card_name') card_name: string,
    @Query('category') category: string,
    @Query('position') position: string,
    @Query('language') language: string,
  ) {
    return this.service.findOne({ card_name, category, position, language });
  }

  @Get('draw')
  async draw(
    @Query('category') category?: string,
    @Query('language') language = 'en',
  ) {
    return this.drawService.draw(category, language);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('import')
  async importData(@Body() body: { items: any[] }) {
    return this.service.importMany(body.items);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('export')
  async exportData() {
    return this.service.exportAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('list')
  async list(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('card_name') card_name?: string,
    @Query('category') category?: string,
    @Query('position') position?: string,
    @Query('language') language?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.service.findAll(Number(page), Number(limit), {
      card_name,
      category,
      position,
      language,
      keyword,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('update/:id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(Number(id), body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('delete/:id')
  async remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }

  // 根据三张牌 + 问卷答案匹配规则（按 priority ASC, id ASC）
  @Post('rule-match')
  async matchRule(
    @Body() body: { card_indices: number[]; answers?: Record<string, string> },
  ) {
    const cardIndices = Array.isArray(body.card_indices)
      ? body.card_indices.slice(0, 3)
      : [];
    if (cardIndices.length !== 3) return { rule: null };

    // 1) 将卡片下标映射为两位 code（01~78）
    const cardCodes = cardIndices
      .map((idx) => String((idx % 78) + 1).padStart(2, '0'))
      .sort();

    // 2) 取当前 question 列表（按 weight 升序、id 升序），将 answers 顺序映射到 question_id
    const questions = await this.questionRepo.find({
      order: { weight: 'ASC', id: 'ASC' },
    });
    const answerKeys = body.answers ? Object.keys(body.answers).sort() : [];
    const questionId = questions[0]?.id || null;
    if (!questionId) return { rule: null };

    // 3) 先匹配指定 question_id + card_codes 完全匹配，按 priority/id 排序
    const rule = await this.ruleRepo
      .createQueryBuilder('r')
      .where('r.question_id = :qid', { qid: questionId })
      .andWhere('r.card_codes = :codes', { codes: cardCodes })
      .andWhere('r.enabled = true')
      .orderBy('r.priority', 'ASC')
      .addOrderBy('r.id', 'ASC')
      .getOne();

    return { rule };
  }
}
