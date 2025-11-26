import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { PerfumeService } from './perfume.service';

@Controller('api/perfume')
export class PerfumeController {
  constructor(private readonly perfumeService: PerfumeService) {}

  /**
   * GET /api/perfume/chapters?cardIds=1,2,3
   * 返回按 cardIds 顺序排列的香水章节（scene_choice 作为区分）
   */
  @Get('chapters')
  async getChapters(@Query('cardIds') cardIds?: string) {
    if (!cardIds) {
      throw new BadRequestException('cardIds is required');
    }
    const ids = cardIds
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((v) => Number.isInteger(v) && v > 0);

    if (ids.length === 0) {
      throw new BadRequestException('cardIds is empty');
    }

    const chapters = await this.perfumeService.getChapters(ids);
    return { chapters };
  }
}
