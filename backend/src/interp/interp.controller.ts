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
import { TAROT_POSITIONS, TAROT_CATEGORIES, DEFAULT_PAGE_SIZE } from '../constants/tarot';

import { PayService } from '../pay/pay.service';

@Controller('api/interp')
export class InterpretationController {
  constructor(
    private readonly service: InterpretationService,
    private readonly drawService: DrawService,
    @InjectRepository(Card) private cardRepo: Repository<Card>,
    private readonly payService: PayService,
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

  @Post('reading')
  async getReading(
    @Body()
    body: {
      card_indices: number[];
      answers?: Record<string, string>;
      orderId?: string;
      language?: string;
      category?: string;
    },
  ) {
    const { card_indices, orderId, language = 'en', category = 'Self', answers = {} } = body;

    if (!Array.isArray(card_indices) || card_indices.length !== 3) {
      return { error: 'Invalid cards' };
    }

    // Prefer Q4 (A/B/C) to decide category; fallback to provided category
    const mapQ4 = (val?: string) => {
      if (!val || typeof val !== 'string') return null;
      const first = val.trim().charAt(0).toUpperCase();
      if (first === 'A') return 'Self';
      if (first === 'B') return 'Career';
      if (first === 'C') return 'Love';
      return null;
    };

    const derivedCategory = mapQ4(answers['4']) || category;

    // 1. Resolve Cards
    const cardCodes = card_indices.map((idx) =>
      String((idx % 78) + 1).padStart(2, '0'),
    );
    const cards = await this.cardRepo.find({ where: { code: In(cardCodes) } });
    // Sort to match Past, Present, Future order
    const sortedCards = cardCodes
      .map((code) => cards.find((c) => c.code === code))
      .filter(Boolean) as Card[];

    if (sortedCards.length !== 3) {
      return { error: 'Cards not found' };
    }

    // 2. Get Raw Interpretations
    const rawInterps = await this.service.getInterpretationsForCards(
      sortedCards,
      derivedCategory,
      language,
    );

    // 3. Check Access
    let isUnlocked = false;
      if (orderId) {
        if (orderId === 'debug-unlocked') {
          isUnlocked = true;
        } else {
        // Use checkAndUpdateStatus to handle webhook delays
        const order = await this.payService.checkAndUpdateStatus(orderId);
        if (order && order.status === 'succeeded') {
          isUnlocked = true;
        }
      }
    }

    // 4. Construct Response
    const response: any = {
      is_unlocked: isUnlocked,
      past: null,
      present: null,
      future: null,
    };

    // Map rawInterps to response keys
    rawInterps.forEach((item) => {
      const key = item.position.toLowerCase(); // past, present, future
      const content = item.content;

      if (key === 'past') {
        // Past is always fully visible
        response.past = {
          ...content,
          is_locked: false,
        };
      } else {
        // Present & Future are locked unless paid
        if (isUnlocked) {
          response[key] = {
            ...content,
            is_locked: false,
          };
        } else {
          // Locked: only return null or limited data
          response[key] = {
            summary: null,
            interpretation: null,
            is_locked: true,
          };
        }
      }
    });

    return response;
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
    @Query('limit') limit = DEFAULT_PAGE_SIZE,
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
    @Body() body: { card_indices: number[]; answers?: Record<string, string>; language?: string; category?: string },
  ) {
    const cardIndices = Array.isArray(body.card_indices)
      ? body.card_indices.slice(0, 3)
      : [];
    if (cardIndices.length !== 3) return { rule: null };

    // 1) 将卡片下标映射为两位 code（01~78）
    const cardCodes = cardIndices
      .map((idx) => String((idx % 78) + 1).padStart(2, '0'))

    // 2) 用卡牌默认解读拼接合成结果
    const cards = await this.cardRepo.find({
      where: { code: In(cardCodes) },
    });
    const sortedCards = cardCodes.map((code) =>
      cards.find((c) => c.code === code),
    );
    const category = body.category || TAROT_CATEGORIES[0]; // Default to Self
    const interpretations = await Promise.all(
      sortedCards.map((card, i) =>
        card
          ? this.service.findOne({
              card_name: card.name_en,
              position: TAROT_POSITIONS[i],
              language: body.language || 'en',
              category,
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
        const label = TAROT_POSITIONS[idx];
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
