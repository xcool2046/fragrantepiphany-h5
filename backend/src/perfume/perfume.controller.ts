import { Controller, Get, Query } from '@nestjs/common';
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
    @Query('card_indices') cardIndices?: string,
    @Query('cardIds') cardIdsParam?: string,
    @Query('language') language: string = 'zh',
    @Query('scentAnswer') scentAnswer?: string,
    @Query('category') categoryParam: string = 'Self',
    @Query('q4Answer') q4Answer?: string,
  ) {
    let ids: number[] = [];
    let indicesResolved: number[] = [];

    // 1. Try resolving from indices (Frontend 0-77)
    if (cardIndices) {
      indicesResolved = cardIndices
        .split(',')
        .map((v) => Number(v.trim()))
        .filter((v) => Number.isInteger(v));

      if (indicesResolved.length > 0) {
        // Map indices to codes (0->01, 77->78)
        const codes = indicesResolved.map((idx) =>
          String((idx % 78) + 1).padStart(2, '0'),
        );
        const cards = await this.cardRepo.find({ where: { code: In(codes) } });
        ids = cards.map((c) => c.id);

        // Fallback: 如果按 code 查不到，退回用 index+1 作为卡 ID（数据库通常按 1-78 自增）
        if (ids.length === 0) {
          ids = indicesResolved.map((idx) => (idx % 78) + 1);
        }
      }
    }

    // 2. Fallback to direct IDs if no indices resolved
    if (ids.length === 0 && cardIdsParam) {
      ids = cardIdsParam
        .split(',')
        .map((v) => Number(v.trim()))
        .filter((v) => Number.isInteger(v) && v > 0);
    }

    // REMOVED: Early return if ids is empty.
    // We want to call the service even with empty IDs so the fallback logic (default perfume) can trigger.
    // if (ids.length === 0) {
    //   return { chapters: [] };
    // }

    // Normalize language
    const lang = language.toLowerCase().startsWith('zh') ? 'zh' : 'en';

    // Derive Category from Q4 or param
    let category = categoryParam;
    if (q4Answer) {
      const first = q4Answer.trim().charAt(0).toUpperCase();
      if (first === 'A') category = 'Self';
      else if (first === 'B') category = 'Career';
      else if (first === 'C') category = 'Love';
    }

    const result = await this.perfumeService.getChapters(
      ids,
      lang,
      scentAnswer,
      category,
    ); // Pass derived 'category'
    if (result.length > 0) {
      console.log(
        'DEBUG: First Perfume Chapter:',
        JSON.stringify(result[0], null, 2),
      );
    }
    return { chapters: result }; // Wrap result in an object with 'chapters' key
  }
}
