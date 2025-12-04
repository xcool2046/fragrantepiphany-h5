import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Perfume } from '../entities/perfume.entity';
import { Card } from '../entities/card.entity';

import { InterpretationService } from '../interp/interp.service';

// 简易配置层，避免硬编码兜底 ID
const FALLBACK_PERFUME_ID = process.env.PERFUME_FALLBACK_ID
  ? Number(process.env.PERFUME_FALLBACK_ID)
  : null;

@Injectable()
export class PerfumeService {
  constructor(
    @InjectRepository(Perfume) private perfumeRepo: Repository<Perfume>,
    @InjectRepository(Card) private cardRepo: Repository<Card>,
    private readonly interpService: InterpretationService,
  ) {}

  async getChapters(
    ids: number[],
    language: string = 'zh',
    scentAnswer?: string,
    category: string = 'Self',
  ) {
    let items = await this.perfumeRepo.find({
      where: { card_id: In(ids), status: 'active' },
      order: { card_id: 'ASC', sort_order: 'ASC', id: 'ASC' },
    });

    // Filter by scent answer if provided (e.g. 'A')
    if (scentAnswer) {
      const original = items;
      const normalizedAnswer = scentAnswer.replace(/^[A-Z]\.\s*/, '').trim().toLowerCase();
      const prefix = scentAnswer.trim().charAt(0).toUpperCase();

      const filtered = items.filter((item) => {
        const scene = item.scene_choice || '';
        const normalizedScene = scene.replace(/^[A-Z]\.\s*/, '').trim().toLowerCase();

        const matchPrefix = ['A', 'B', 'C', 'D'].includes(prefix)
          ? scene.trim().toUpperCase().startsWith(prefix)
          : false;

        const hasAnswer = normalizedAnswer.length > 0;
        const matchText = hasAnswer
          ? normalizedScene.includes(normalizedAnswer) || normalizedAnswer.includes(normalizedScene)
          : false;

        return matchPrefix || matchText;
      });

      // If filtering removed everything, fall back to original set to avoid empty results caused by mismatched formats.
      if (filtered.length > 0) {
        items = filtered;
      }
    }

    // Fallback: If no perfumes found (e.g. cards have no data), use a default one
    if (items.length === 0) {
      let fallback: Perfume | null = null;

      // 1. Priority: Try Env-defined ID
      if (FALLBACK_PERFUME_ID) {
        fallback = await this.perfumeRepo.findOne({
          where: { id: FALLBACK_PERFUME_ID, status: 'active' },
        });
        if (!fallback) {
          console.warn(
            `Perfume fallback id=${FALLBACK_PERFUME_ID} not found or inactive.`,
          );
        }
      }

      // 2. Backup: Try first active perfume if Env failed
      if (!fallback) {
        fallback = await this.perfumeRepo.findOne({
          where: { status: 'active' },
          order: { id: 'ASC' },
        });
        if (fallback) {
          console.log(
            `Using auto-fallback perfume id=${fallback.id} (First Active).`,
          );
        }
      }

      // Apply fallback if found
      if (fallback) {
        items = [fallback];
        if (!ids.includes(fallback.card_id)) {
          ids.push(fallback.card_id);
        }
      } else {
        console.warn('No active perfumes found for fallback. Returning empty.');
      }
    }

    // Fetch cards to get localized names
    const cards = await this.cardRepo.find({ where: { id: In(ids) } });
    const cardMap = new Map(cards.map((c) => [c.id, c]));

    const orderMap = new Map<number, number>();
    ids.forEach((id, idx) => orderMap.set(id, idx));

    const sorted = items.sort((a, b) => {
      const aOrder = orderMap.get(a.card_id) ?? 999;
      const bOrder = orderMap.get(b.card_id) ?? 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return a.id - b.id;
    });

    const isEn = language === 'en';

    // Fetch dynamic quotes (recommendations) from InterpretationService
    // Logic: Quote = Interpretation(Card, Category, Position='Present').summary
    // We assume the perfume is associated with the "Present" card context as per requirements.
    const quotes = await Promise.all(
      sorted.map(async (item) => {
        const card = cardMap.get(item.card_id);
        if (!card) return null;
        const interp = await this.interpService.findOne({
          card_name: card.name_en,
          category, // Use the passed category (Self/Career/Love)
          position: 'Present',
          language: isEn ? 'en' : 'zh', // Fetch correct language based on request
        });
        return (interp?.sentence as string) || '';
      }),
    );

    return sorted.map((item, idx) => {
      const card = cardMap.get(item.card_id);
      const cardName =
        (isEn ? card?.name_en : item.card_name) || item.card_name;

      // Use tags from DB based on language
      const tags = (isEn ? item.tags_en : item.tags) ?? [];

      // Dynamic quote overrides static quote
      const dynamicQuote = quotes[idx];
      // Static quote is deprecated but kept as fallback if needed, though likely null
      const staticSentence = (isEn ? item.sentence_en : item.sentence) || '';

      // Priority: Dynamic Quote > Static Override (if exists) > Empty String
      // We prioritize dynamic because static is often just a placeholder or single-context string
      const finalSentence = dynamicQuote || staticSentence || '';

      return {
        id: item.id,
        order: idx + 1,
        cardName: cardName,
        sceneChoice:
          (isEn ? item.scene_choice_en : item.scene_choice) ||
          item.scene_choice,
        sceneChoiceZh: item.scene_choice,
        sceneChoiceEn: item.scene_choice_en || '',
        brandName:
          (isEn ? item.brand_name_en : item.brand_name) || item.brand_name,
        productName:
          (isEn ? item.product_name_en : item.product_name) ||
          item.product_name,
        tags: tags,
        notes: {
          top: '',
          heart: '',
          base: '',
        },
        description:
          (isEn ? item.description_en : item.description) ||
          item.description ||
          '',
        sentence: finalSentence,
        imageUrl: item.image_url ?? '',
      };
    });
  }

  async list(params: {
    page: number;
    pageSize: number;
    q?: string;
    status?: string;
  }) {
    const { page, pageSize, q, status } = params;
    const qb = this.perfumeRepo.createQueryBuilder('perfume');
    if (status) {
      qb.andWhere('perfume.status = :status', { status });
    }
    if (q) {
      qb.andWhere(
        '(perfume.product_name ILIKE :q OR perfume.brand_name ILIKE :q OR perfume.card_name ILIKE :q OR perfume.scene_choice ILIKE :q)',
        { q: `%${q}%` },
      );
    }

    qb.orderBy('perfume.updated_at', 'DESC').addOrderBy('perfume.id', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const item = await this.perfumeRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Perfume not found');
    return item;
  }

  async create(payload: Partial<Perfume>) {
    const entity = this.perfumeRepo.create({
      status: 'active',
      sort_order: 0,
      tags: payload.tags ?? null,
      ...payload,
    });
    return this.perfumeRepo.save(entity);
  }

  async update(id: number, payload: Partial<Perfume>) {
    const item = await this.findOne(id);
    Object.assign(item, payload);
    return this.perfumeRepo.save(item);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    await this.perfumeRepo.remove(item);
    return { id };
  }

  async resolveCardId(cardName: string) {
    const card = await this.cardRepo.findOne({ where: { name_en: cardName } });
    return card?.id ?? null;
  }

  private mapIndexToId(index: number): number {
    // Assuming 1-based IDs for now, or implement specific mapping logic if needed
    // The controller logic suggests (idx % 78) + 1 mapping happens there,
    // but if we need it here:
    return index + 1;
  }
}
