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

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsOptional()
  name_en?: string;

  @IsString()
  @IsOptional()
  name_zh?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class UpdateCardDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  name_en?: string;

  @IsString()
  @IsOptional()
  name_zh?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
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

  // Helper to download image
  private async downloadImage(url: string): Promise<string | null> {
    try {
      // Check if it's a Google Drive link
      // Format: https://drive.google.com/file/d/1oLl3qfdEgsuxoFixrY3VaAfKM0XswmJL/view?usp=drive_link
      const driveRegex = /\/file\/d\/([^\/]+)\//;
      const match = url.match(driveRegex);
      let downloadUrl = url;

      if (match && match[1]) {
        const fileId = match[1];
        downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      } else if (url.includes('drive.google.com') && url.includes('id=')) {
        // Already a direct link format? keep it
      } else if (!url.startsWith('http')) {
        return url; // Local path or invalid
      }

      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir))
        fs.mkdirSync(uploadsDir, { recursive: true });

      const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}.jpg`; // Assume jpg/png, sharp can handle
      const filepath = path.join(uploadsDir, filename);

      // Use fetch to download
      const response = await fetch(downloadUrl);
      if (!response.ok)
        throw new Error(
          `Failed to fetch ${downloadUrl}: ${response.statusText}`,
        );

      const buffer = await response.arrayBuffer();

      // Use sharp to optimize and save
      const sharp = require('sharp');
      await sharp(Buffer.from(buffer))
        .resize({ width: 800, withoutEnlargement: true })
        .toFile(filepath);

      return `/uploads/${filename}`;
    } catch (e) {
      console.error(`Failed to download image from ${url}:`, e);
      return null; // Keep original or null? If failed, maybe keep original so user sees it's broken or external
    }
  }

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
    @Query('scene') scene?: string,
    @Query('cardId') cardId?: string,
  ) {
    console.log(
      `[Admin] listPerfumes called. Page: ${page}, Size: ${pageSize}, Keyword: ${keyword}, Scene: ${scene}, CardId: ${cardId}`,
    );
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

    if (scene && scene !== 'all') {
      // Filter by scene prefix (e.g. "A" matches "A. 卧室")
      qb.andWhere('p.scene_choice LIKE :scene', { scene: `${scene}%` });
    }

    if (cardId) {
      const cid = Number(cardId);
      if (!isNaN(cid)) {
        qb.andWhere('p.card_id = :cid', { cid });
      }
    }

    const [items, total] = await qb.skip(skip).take(take).getManyAndCount();
    console.log(
      `[Admin] listPerfumes found ${items.length} items, total: ${total}`,
    );
    return { items, total, page: Number(page), pageSize: take };
  }

  @Post('perfumes')
  async createPerfume(@Body() body: any) {
    // Basic validation
    if (!body.card_id || !body.brand_name || !body.product_name) {
      throw new BadRequestException(
        'card_id, brand_name, product_name are required',
      );
    }
    const entity = this.perfumeRepo.create(body);
    try {
      return await this.perfumeRepo.save(entity);
    } catch (e: any) {
      if (e.code === '23505') {
        throw new BadRequestException(
          'Perfume with this Card ID and Scene Choice already exists',
        );
      }
      throw e;
    }
  }

  @Patch('perfumes/:id')
  async updatePerfume(@Param('id') id: string, @Body() body: any) {
    const p = await this.perfumeRepo.findOne({ where: { id: Number(id) } });
    if (!p) throw new NotFoundException('Perfume not found');

    // Allow updating any field passed in body
    Object.assign(p, body);
    try {
      return await this.perfumeRepo.save(p);
    } catch (e: any) {
      if (e.code === '23505') {
        throw new BadRequestException(
          'Perfume with this Card ID and Scene Choice already exists',
        );
      }
      throw e;
    }
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
      const kw = keyword.trim();
      // Robust Search: Convert to both Simplified and Traditional to cover all bases
      // Simple mapping for common Tarot terms
      const toSimp = (s: string) => {
        return s
          .replace(/權杖/g, '权杖')
          .replace(/聖杯/g, '圣杯')
          .replace(/寶劍/g, '宝剑')
          .replace(/星幣/g, '星币')
          .replace(/魔術師/g, '魔术师')
          .replace(/戀人/g, '恋人')
          .replace(/戰車/g, '战车')
          .replace(/隱者/g, '隐士')
          .replace(/命運之輪/g, '命运之轮')
          .replace(/正義/g, '正义')
          .replace(/吊人/g, '倒吊人')
          .replace(/節制/g, '节制')
          .replace(/惡魔/g, '恶魔')
          .replace(/塔/g, '高塔')
          .replace(/太陽/g, '太阳')
          .replace(/審判/g, '审判');
      };
      const toTrad = (s: string) => {
        return s
          .replace(/权杖/g, '權杖')
          .replace(/圣杯/g, '聖杯')
          .replace(/宝剑/g, '寶劍')
          .replace(/星币/g, '星幣')
          .replace(/魔术师/g, '魔術師')
          .replace(/恋人/g, '戀人')
          .replace(/战车/g, '戰車')
          .replace(/隐士/g, '隱者')
          .replace(/命运之轮/g, '命運之輪')
          .replace(/正义/g, '正義')
          .replace(/倒吊人/g, '吊人')
          .replace(/节制/g, '節制')
          .replace(/恶魔/g, '惡魔')
          .replace(/高塔/g, '塔')
          .replace(/太阳/g, '太陽')
          .replace(/审判/g, '審判');
      };

      const kwSimp = `%${toSimp(kw)}%`;
      const kwTrad = `%${toTrad(kw)}%`;
      const kwRaw = `%${kw}%`;

      qb.andWhere(
        '(card.code ILIKE :kwRaw OR card.name_en ILIKE :kwRaw OR card.name_zh ILIKE :kwSimp OR card.name_zh ILIKE :kwTrad)',
        { kwRaw, kwSimp, kwTrad },
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
    if (!body.code) throw new BadRequestException('code is required');
    const existing = await this.cardRepo.findOne({
      where: { code: body.code },
    });
    if (existing) throw new BadRequestException('code already exists');

    let image_url = body.image_url ?? null;
    if (image_url && image_url.startsWith('http')) {
      const localUrl = await this.downloadImage(image_url);
      if (localUrl) image_url = localUrl;
    }

    const entity = this.cardRepo.create({
      code: body.code,
      name_en: body.name_en ?? body.code, // Default to code if name_en is not provided
      name_zh: body.name_zh ?? undefined,
      image_url,
      enabled: body.enabled ?? true,
    });
    return await this.cardRepo.save(entity);
  }

  @Patch('cards/:id')
  async updateCard(@Param('id') id: string, @Body() body: UpdateCardDto) {
    const card = await this.cardRepo.findOne({ where: { id: Number(id) } });
    if (!card) throw new NotFoundException('Card not found');

    let image_url = body.image_url;
    if (
      image_url &&
      image_url !== card.image_url &&
      image_url.startsWith('http')
    ) {
      const localUrl = await this.downloadImage(image_url);
      if (localUrl) image_url = localUrl;
    }

    Object.assign(card, {
      code: body.code ?? card.code,
      name_en: body.name_en ?? card.name_en,
      name_zh: body.name_zh ?? card.name_zh,
      image_url: image_url ?? card.image_url,
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
  @UseInterceptors(
    FileInterceptor('file'),
  )
  async uploadCardImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file');
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'image/heic',
      'image/heif',
      'image/avif',
    ];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Unsupported file type: ' + file.mimetype);
    }
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir))
      fs.mkdirSync(uploadsDir, { recursive: true });

    // Use sharp to optimize
    const sharp = require('sharp');
    const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}.webp`;
    const filepath = path.join(uploadsDir, filename);

    await sharp(file.path)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filepath);

    // Cleanup temp file
    try {
      fs.unlinkSync(file.path);
    } catch (e) {
      console.error('Failed to delete temp file:', file.path);
    }

    const url = `/uploads/${filename}`;
    return { url };
  }

  @Post('cards/import')
  @UseInterceptors(FileInterceptor('file'))
  async importCards(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file');
    const rows: any[] = [];
    await new Promise<void>((resolve, reject) => {
      const stream = fs.createReadStream(file.path)
        .pipe(parse({ headers: true }))
        .on('error', reject)
        .on('data', (row) => rows.push(row))
        .on('end', () => resolve());
    });

    // Cleanup temp file
    try {
      fs.unlinkSync(file.path);
    } catch (e) {
      console.error('Failed to delete temp file:', file.path);
    }

    let created = 0;
    let updated = 0;

    for (const [idx, r] of rows.entries()) {
      const code = (r.code || '').trim();
      let name_en = (r.name_en || '').trim();
      let name_zh = (r.name_zh || '').trim();

      // Relax validation: if name_en missing, use code
      if (!name_en) name_en = code;
      if (!name_zh) name_zh = null; // Ensure it's null if empty

      if (!code) {
        // Skip empty rows
        continue;
      }

      let image_url = r.image_url?.trim?.() || null;
      if (image_url && image_url.startsWith('http')) {
        const localUrl = await this.downloadImage(image_url);
        if (localUrl) image_url = localUrl;
      }

      const payload: Partial<Card> = {
        code,
        name_en,
        name_zh,
        image_url,
      };

      const existing = await this.cardRepo.findOne({ where: { code } });
      if (existing) {
        Object.assign(
          existing,
          Object.fromEntries(
            Object.entries(payload).filter(
              ([, v]) => v !== null && v !== undefined,
            ),
          ),
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
      });
    });
    csvStream.end();
  }
}
