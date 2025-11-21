import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  NotFoundException,
  Query,
  Param,
  Patch,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { AuthGuard } from '@nestjs/passport';
import { Question } from '../entities/question.entity';
import { Card } from '../entities/card.entity';
import { Rule } from '../entities/rule.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from '@fast-csv/parse';
import { format } from '@fast-csv/format';
import type { Response } from 'express';
import { Res } from '@nestjs/common';
import type { Express } from 'express';
// Feature flags default to off; enable via env when customer付费后再开放
const ORDERS_ENABLED = process.env.FEATURE_ADMIN_ORDERS === 'true';
const PRICING_ENABLED = process.env.FEATURE_ADMIN_PRICING === 'true';

@Controller('api/admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
    @InjectRepository(Card)
    private cardRepo: Repository<Card>,
    @InjectRepository(Rule)
    private ruleRepo: Repository<Rule>,
  ) {}

  @Get('orders')
  async getOrders() {
    if (!ORDERS_ENABLED) {
      throw new NotFoundException('Orders management is disabled');
    }
    return this.orderRepo.find({
      order: { created_at: 'DESC' },
      take: 100, // Limit to last 100 for now
    });
  }

  @Get('config')
  getConfig() {
    if (!PRICING_ENABLED) {
      throw new NotFoundException('Pricing management is disabled');
    }
    return { price_cny: 1500, price_usd: 500 };
  }

  @Post('config')
  saveConfig(@Body() body: any) {
    if (!PRICING_ENABLED) {
      throw new NotFoundException('Pricing management is disabled');
    }
    return {
      price_cny: Number(body.price_cny),
      price_usd: Number(body.price_usd),
    };
  }

  // ========== Questions ==========
  @Get('questions')
  async listQuestions() {
    const items = await this.questionRepo.find({ order: { weight: 'ASC', id: 'ASC' } });
    return { items };
  }

  @Post('questions')
  async createQuestion(@Body() body: Partial<Question>) {
    if (!body.title_en) throw new BadRequestException('title_en is required');
    const entity = this.questionRepo.create({
      title_en: body.title_en,
      title_zh: body.title_zh ?? null,
      options_en: body.options_en ?? null,
      options_zh: body.options_zh ?? null,
      active: body.active ?? true,
      weight: body.weight ?? 0,
    });
    return await this.questionRepo.save(entity);
  }

  @Patch('questions/:id')
  async updateQuestion(@Param('id') id: string, @Body() body: Partial<Question>) {
    const q = await this.questionRepo.findOne({ where: { id: Number(id) } });
    if (!q) throw new NotFoundException('Question not found');
    Object.assign(q, {
      title_en: body.title_en ?? q.title_en,
      title_zh: body.title_zh ?? q.title_zh,
      options_en: body.options_en ?? q.options_en,
      options_zh: body.options_zh ?? q.options_zh,
      active: body.active ?? q.active,
      weight: body.weight ?? q.weight,
    });
    return await this.questionRepo.save(q);
  }

  @Delete('questions/:id')
  async deleteQuestion(@Param('id') id: string) {
    await this.questionRepo.delete({ id: Number(id) });
    return { ok: true };
  }

  // ========== Cards ==========
  @Get('cards')
  async listCards(@Query('page') page = '1', @Query('pageSize') pageSize = '20') {
    const take = Math.min(100, Math.max(1, Number(pageSize) || 20));
    const skip = (Math.max(1, Number(page) || 1) - 1) * take;
    const [items, total] = await this.cardRepo.findAndCount({ order: { code: 'ASC' }, skip, take });
    return { items, total, page: Number(page), pageSize: take };
  }

  @Post('cards')
  async createCard(@Body() body: Partial<Card>) {
    if (!body.code || !body.name_en) throw new BadRequestException('code and name_en are required');
    const existing = await this.cardRepo.findOne({ where: { code: body.code } });
    if (existing) throw new BadRequestException('code already exists');
    const entity = this.cardRepo.create({
      code: body.code,
      name_en: body.name_en,
      name_zh: body.name_zh ?? null,
      image_url: body.image_url ?? null,
      default_meaning_en: body.default_meaning_en ?? null,
      default_meaning_zh: body.default_meaning_zh ?? null,
      enabled: body.enabled ?? true,
    });
    return await this.cardRepo.save(entity);
  }

  @Patch('cards/:id')
  async updateCard(@Param('id') id: string, @Body() body: Partial<Card>) {
    const card = await this.cardRepo.findOne({ where: { id: Number(id) } });
    if (!card) throw new NotFoundException('Card not found');
    Object.assign(card, {
      name_en: body.name_en ?? card.name_en,
      name_zh: body.name_zh ?? card.name_zh,
      image_url: body.image_url ?? card.image_url,
      default_meaning_en: body.default_meaning_en ?? card.default_meaning_en,
      default_meaning_zh: body.default_meaning_zh ?? card.default_meaning_zh,
      enabled: body.enabled ?? card.enabled,
    });
    return await this.cardRepo.save(card);
  }

  @Delete('cards/:id')
  async deleteCard(@Param('id') id: string) {
    await this.cardRepo.delete({ id: Number(id) });
    return { ok: true };
  }

  @Post('cards/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCardImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file');
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const ext = path.extname(file.originalname) || '.bin';
    const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
    const filepath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(filepath, file.buffer);
    const url = `/uploads/${filename}`;
    return { url };
  }

  @Post('cards/import')
  @UseInterceptors(FileInterceptor('file'))
  async importCards(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file');
    const rows: any[] = []
    await new Promise<void>((resolve, reject) => {
      parse({ headers: true })
        .on('error', reject)
        .on('data', (row) => rows.push(row))
        .on('end', () => resolve())
        .write(file.buffer)
    })
    let created = 0
    let updated = 0
    for (const [idx, r] of rows.entries()) {
      const code = (r.code || '').trim()
      const name_en = (r.name_en || '').trim()
      const name_zh = r.name_zh?.trim?.() || null
      if (!code || !name_en) {
        throw new BadRequestException(`Row ${idx + 2}: code and name_en are required`)
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(code)) throw new BadRequestException(`Row ${idx + 2}: invalid code`)
      const payload: Partial<Card> = {
        code,
        name_en,
        name_zh,
        image_url: r.image_url?.trim?.() || null,
        default_meaning_en: r.default_meaning_en?.trim?.() || null,
        default_meaning_zh: r.default_meaning_zh?.trim?.() || null,
      }
      const existing = await this.cardRepo.findOne({ where: { code } })
      if (existing) {
        Object.assign(existing, Object.fromEntries(Object.entries(payload).filter(([, v]) => v)))
        await this.cardRepo.save(existing)
        updated++
      } else {
        const entity = this.cardRepo.create({ ...payload, enabled: true })
        await this.cardRepo.save(entity)
        created++
      }
    }
    return { created, updated }
  }

  @Get('cards/export')
  async exportCards(@Res() res: Response) {
    const data = await this.cardRepo.find({ order: { code: 'ASC' } })
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="cards.csv"')
    const csvStream = format({ headers: true })
    csvStream.pipe(res)
    data.forEach((item) => {
      csvStream.write({
        code: item.code,
        name_en: item.name_en,
        name_zh: item.name_zh ?? '',
        image_url: item.image_url ?? '',
        default_meaning_en: item.default_meaning_en ?? '',
        default_meaning_zh: item.default_meaning_zh ?? '',
      })
    })
    csvStream.end()
  }

  // ========== Rules ==========
  @Get('rules')
  async listRules(
    @Query('question_id') questionId?: string,
    @Query('card_code') cardCode?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    const take = Math.min(100, Math.max(1, Number(pageSize) || 20));
    const skip = (Math.max(1, Number(page) || 1) - 1) * take;
    const qb = this.ruleRepo
      .createQueryBuilder('rule')
      .leftJoinAndSelect('rule.question', 'question')
      .orderBy('rule.priority', 'ASC')
      .addOrderBy('rule.id', 'ASC')
      .skip(skip)
      .take(take);
    if (questionId) qb.andWhere('rule.question_id = :qid', { qid: Number(questionId) });
    if (cardCode) qb.andWhere(':code = ANY(rule.card_codes)', { code: cardCode });
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page: Number(page), pageSize: take };
  }

  private normalizeCodes(codes: string[]) {
    if (!Array.isArray(codes) || codes.length !== 3) throw new BadRequestException('card_codes must be an array of 3 codes');
    const cleaned = codes.map((c) => (c || '').trim()).filter(Boolean);
    if (cleaned.length !== 3) throw new BadRequestException('card_codes must contain 3 non-empty codes');
    return [...cleaned].sort();
  }

  @Post('rules')
  async createRule(@Body() body: any) {
    if (!body.question_id) throw new BadRequestException('question_id is required');
    const codes = this.normalizeCodes(body.card_codes || body.cards || []);
    const payload = this.ruleRepo.create({
      question_id: Number(body.question_id),
      card_codes: codes,
      priority: body.priority ?? 100,
      summary_free: body.summary_free ?? null,
      interpretation_full: body.interpretation_full ?? null,
      recommendations: body.recommendations ?? null,
      enabled: body.enabled ?? true,
    });
    try {
      return await this.ruleRepo.save(payload);
    } catch (e) {
      if ((e as any).code === '23505') throw new BadRequestException('Rule already exists for this question + card combo');
      throw e;
    }
  }

  @Patch('rules/:id')
  async updateRule(@Param('id') id: string, @Body() body: any) {
    const rule = await this.ruleRepo.findOne({ where: { id: Number(id) } });
    if (!rule) throw new NotFoundException('Rule not found');
    const codes = body.card_codes ? this.normalizeCodes(body.card_codes) : rule.card_codes;
    Object.assign(rule, {
      card_codes: codes,
      priority: body.priority ?? rule.priority,
      summary_free: body.summary_free ?? rule.summary_free,
      interpretation_full: body.interpretation_full ?? rule.interpretation_full,
      recommendations: body.recommendations ?? rule.recommendations,
      enabled: body.enabled ?? rule.enabled,
    });
    try {
      return await this.ruleRepo.save(rule);
    } catch (e) {
      if ((e as any).code === '23505') throw new BadRequestException('Rule already exists for this question + card combo');
      throw e;
    }
  }

  @Delete('rules/:id')
  async deleteRule(@Param('id') id: string) {
    await this.ruleRepo.delete({ id: Number(id) });
    return { ok: true };
  }
}
