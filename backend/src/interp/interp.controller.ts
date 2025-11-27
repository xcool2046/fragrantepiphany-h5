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
import { Card } from '../entities/card.entity';

@Controller('api/interp')
export class InterpretationController {
  constructor(
    private readonly service: InterpretationService,
    private readonly drawService: DrawService,
    @InjectRepository(Card) private cardRepo: Repository<Card>,
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

    // 2) 用卡牌默认解读拼接合成结果
    const cards = await this.cardRepo.find({
      where: { code: In(cardCodes) },
    });
    const sortedCards = cardCodes.map((code) =>
      cards.find((c) => c.code === code),
    );
    const positions = ['Past', 'Present', 'Future'];
    const interpretations = await Promise.all(
      sortedCards.map((card, i) =>
        card
          ? this.service.findOne({
              card_name: card.name_en,
              position: positions[i],
              language: 'en',
            })
          : null,
      ),
    );

    if (!interpretations.some((i) => i !== null)) {
      return { rule: null };
    }

    const summary =
      interpretations[1]?.summary ||
      interpretations[0]?.summary ||
      interpretations[2]?.summary ||
      '';
    const interpretationText = interpretations
      .map((i, idx) => {
        if (!i?.interpretation) return '';
        const label = positions[idx];
        return `${label}: ${i.interpretation}`;
      })
      .filter(Boolean)
      .join('\n\n');

    const syntheticRule = {
      id: 0,
      question_id: 0,
      card_codes: cardCodes,
      priority: 999,
      enabled: true,
      summary_free: {
        en: summary,
        zh: summary,
      },
      interpretation_full: {
        en: interpretationText,
        zh: interpretationText,
      },
      recommendations: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    return { rule: syntheticRule };
  }
}
