import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { PerfumeService } from './perfume.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from '../entities/card.entity';
import { Repository, In } from 'typeorm';

@Controller('api/perfume')
export class PerfumeController {
  constructor(
    private readonly perfumeService: PerfumeService,
    @InjectRepository(Card) private readonly cardRepo: Repository<Card>,
  ) {}

  /**
   * GET /api/perfume/chapters?card_indices=0,1,2
   * OR
   * GET /api/perfume/chapters?cardIds=1,2,3 (Legacy/Direct ID support)
   * scentAnswer (optional): 用户香气偏好答案（用于 Excel 映射）
   */
  @Get('chapters')
  async getChapters(
    @Query('cardIds') cardIds?: string,
    @Query('card_indices') cardIndices?: string,
    @Query('language') language = 'zh',
    @Query('scentAnswer') scentAnswer?: string,
  ) {
    let ids: number[] = [];

    // 1. Try resolving from indices (Frontend 0-77)
    if (cardIndices) {
      const indices = cardIndices
        .split(',')
        .map((v) => Number(v.trim()))
        .filter((v) => Number.isInteger(v));

      if (indices.length > 0) {
        // Map indices to codes (0->01, 77->78)
        const codes = indices.map((idx) =>
          String((idx % 78) + 1).padStart(2, '0'),
        );
        const cards = await this.cardRepo.find({ where: { code: In(codes) } });
        // Map back to IDs, preserving order relative to input indices not strictly required but good practice
        // actually service sorts by card_id/order anyway.
        ids = cards.map((c) => c.id);
      }
    }

    // 2. Fallback to direct IDs if no indices resolved
    if (ids.length === 0 && cardIds) {
      ids = cardIds
        .split(',')
        .map((v) => Number(v.trim()))
        .filter((v) => Number.isInteger(v) && v > 0);
    }

    if (ids.length === 0) {
      // If we had input but resolved nothing, that's an issue. 
      // But to avoid breaking errors, return empty.
      return { chapters: [] };
    }

    // Normalize language
    const lang = language.toLowerCase().startsWith('zh') ? 'zh' : 'en';

    const chapters = await this.perfumeService.getChapters(ids, lang, scentAnswer);
    return { chapters };
  }
}
