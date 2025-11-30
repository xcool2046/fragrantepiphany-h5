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
import { Perfume } from '../entities/perfume.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from '@fast-csv/parse';
import { format } from '@fast-csv/format';
import type { Response } from 'express';
import { Res } from '@nestjs/common';
import type { Express } from 'express';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  title_en!: string;

  @IsOptional()
  @IsString()
  title_zh?: string | null;

  @IsOptional()
  options_en?: string[] | null;

  @IsOptional()
  options_zh?: string[] | null;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsInt()
  weight?: number;
}

import { PartialType } from '@nestjs/swagger';

class UpdateQuestionDto extends PartialType(CreateQuestionDto) {}

class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  name_en!: string;

  @IsOptional()
  @IsString()
  name_zh?: string | null;

  @IsOptional()
  @IsString()
  image_url?: string | null;

  @IsOptional()
  @IsString()
  default_meaning_en?: string | null;

  @IsOptional()
  @IsString()
  default_meaning_zh?: string | null;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

class UpdateCardDto extends CreateCardDto {}
@Controller('api/admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
    @InjectRepository(Card)
    private cardRepo: Repository<Card>,
    @InjectRepository(Perfume)
    private perfumeRepo: Repository<Perfume>,
  ) {}

  // ========== Questions ==========
  @Get('questions')
  async listQuestions() {
    const items = await this.questionRepo.find({
      order: { weight: 'ASC', id: 'ASC' },
    });
    return { items };
  }

  @Post('questions')
  async createQuestion(@Body() body: CreateQuestionDto) {
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
  async updateQuestion(
    @Param('id') id: string,
    @Body() body: UpdateQuestionDto,
  ) {
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

  // ========== Perfumes ==========
  @Get('perfumes')
  async listPerfumes(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('keyword') keyword?: string,
  ) {
    const take = Math.min(100, Math.max(1, Number(pageSize) || 20));
    const skip = (Math.max(1, Number(page) || 1) - 1) * take;
    const qb = this.perfumeRepo.createQueryBuilder('p').orderBy('p.id', 'DESC');

    if (keyword) {
      const kw = `%${keyword.trim()}%`;
      qb.andWhere(
        '(p.brand_name ILIKE :kw OR p.product_name ILIKE :kw OR p.card_name ILIKE :kw)',
        { kw },
      );
    }

    const [items, total] = await qb.skip(skip).take(take).getManyAndCount();
    return { items, total, page: Number(page), pageSize: take };
  }

  @Post('perfumes')
  async createPerfume(@Body() body: any) {
    // Basic validation
    if (!body.card_id || !body.brand_name || !body.product_name) {
      throw new BadRequestException('card_id, brand_name, product_name are required');
    }
    const entity = this.perfumeRepo.create(body);
    return await this.perfumeRepo.save(entity);
  }

  @Patch('perfumes/:id')
  async updatePerfume(@Param('id') id: string, @Body() body: any) {
    const p = await this.perfumeRepo.findOne({ where: { id: Number(id) } });
    if (!p) throw new NotFoundException('Perfume not found');
    
    // Allow updating any field passed in body
    Object.assign(p, body);
    return await this.perfumeRepo.save(p);
  }

  @Delete('perfumes/:id')
  async deletePerfume(@Param('id') id: string) {
    await this.perfumeRepo.delete({ id: Number(id) });
    return { ok: true };
  }

  // ========== Cards ==========
  @Get('cards')
  async listCards(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('keyword') keyword?: string,
    @Query('onlyEnabled') onlyEnabled?: string,
  ) {
    // 允许前端用较大 pageSize 一次取全量，但限制为 500 以防过载
    const take = Math.min(500, Math.max(1, Number(pageSize) || 20));
    const skip = (Math.max(1, Number(page) || 1) - 1) * take;
    const qb = this.cardRepo
      .createQueryBuilder('card')
      .orderBy('card.code', 'ASC');
    if (keyword) {
      const kw = `%${keyword.trim()}%`;
      qb.andWhere(
        '(card.code ILIKE :kw OR card.name_en ILIKE :kw OR card.name_zh ILIKE :kw)',
        { kw },
      );
    }
    if (onlyEnabled === 'true') {
      qb.andWhere('card.enabled = true');
    }
    const [items, total] = await qb.skip(skip).take(take).getManyAndCount();
    return { items, total, page: Number(page), pageSize: take };
  }

  @Post('cards')
  async createCard(@Body() body: CreateCardDto) {
    if (!body.code || !body.name_en)
      throw new BadRequestException('code and name_en are required');
    const existing = await this.cardRepo.findOne({
      where: { code: body.code },
    });
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
  async updateCard(@Param('id') id: string, @Body() body: UpdateCardDto) {
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
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Unsupported file type');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File too large');
    }
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir))
      fs.mkdirSync(uploadsDir, { recursive: true });
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
    const rows: any[] = [];
    await new Promise<void>((resolve, reject) => {
      const stream = parse({ headers: true })
        .on('error', reject)
        .on('data', (row) => rows.push(row))
        .on('end', () => resolve());
      stream.write(file.buffer);
      stream.end();
    });
    let created = 0;
    let updated = 0;
    for (const [idx, r] of rows.entries()) {
      const code = (r.code || '').trim();
      const name_en = (r.name_en || '').trim();
      const name_zh = r.name_zh?.trim?.() || null;
      if (!code || !name_en) {
        throw new BadRequestException(
          `Row ${idx + 2}: code and name_en are required`,
        );
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(code))
        throw new BadRequestException(`Row ${idx + 2}: invalid code`);
      const payload: Partial<Card> = {
        code,
        name_en,
        name_zh,
        image_url: r.image_url?.trim?.() || null,
        default_meaning_en: r.default_meaning_en?.trim?.() || null,
        default_meaning_zh: r.default_meaning_zh?.trim?.() || null,
      };
      const existing = await this.cardRepo.findOne({ where: { code } });
      if (existing) {
        Object.assign(
          existing,
          Object.fromEntries(Object.entries(payload).filter(([, v]) => v)),
        );
        await this.cardRepo.save(existing);
        updated++;
      } else {
        const entity = this.cardRepo.create({ ...payload, enabled: true });
        await this.cardRepo.save(entity);
        created++;
      }
    }
    return { created, updated };
  }

  @Get('cards/export')
  async exportCards(@Res() res: Response) {
    const data = await this.cardRepo.find({ order: { code: 'ASC' } });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="cards.csv"');
    const csvStream = format({ headers: true });
    csvStream.pipe(res);
    data.forEach((item) => {
      csvStream.write({
        code: item.code,
        name_en: item.name_en,
        name_zh: item.name_zh ?? '',
        image_url: item.image_url ?? '',
        default_meaning_en: item.default_meaning_en ?? '',
        default_meaning_zh: item.default_meaning_zh ?? '',
      });
    });
    csvStream.end();
  }
}
