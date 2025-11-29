import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Perfume } from '../entities/perfume.entity';
import { Card } from '../entities/card.entity';

@Injectable()
export class PerfumeService {
  constructor(
    @InjectRepository(Perfume) private perfumeRepo: Repository<Perfume>,
    @InjectRepository(Card) private cardRepo: Repository<Card>,
  ) {}

  async getChapters(cardIds: number[], language = 'zh') {
    if (!cardIds.length) return [];

    const items = await this.perfumeRepo.find({
      where: { card_id: In(cardIds), status: 'active' },
      order: { card_id: 'ASC', sort_order: 'ASC', id: 'ASC' },
    });

    // Fetch cards to get localized names
    const cards = await this.cardRepo.find({ where: { id: In(cardIds) } });
    const cardMap = new Map(cards.map(c => [c.id, c]));

    const orderMap = new Map<number, number>();
    cardIds.forEach((id, idx) => orderMap.set(id, idx));

    const sorted = items.sort((a, b) => {
      const aOrder = orderMap.get(a.card_id) ?? 999;
      const bOrder = orderMap.get(b.card_id) ?? 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return a.id - b.id;
    });

    const isEn = language === 'en';

    return sorted.map((item, idx) => {
      const card = cardMap.get(item.card_id);
      const cardName = (isEn ? card?.name_en : card?.name_zh) || item.card_name;
      
      // Use notes_top_en as tags if English, split by comma
      let tags = item.tags ?? [];
      if (isEn && item.notes_top_en) {
        tags = item.notes_top_en.split(/[,，]\s*/).filter(Boolean);
      }

      return {
        id: item.id,
        order: idx + 1,
        cardName: cardName,
        sceneChoice: (isEn ? item.scene_choice_en : item.scene_choice) || item.scene_choice,
        sceneChoiceZh: item.scene_choice,
        sceneChoiceEn: item.scene_choice_en || '',
        brandName: (isEn ? item.brand_name_en : item.brand_name) || item.brand_name,
        productName: (isEn ? item.product_name_en : item.product_name) || item.product_name,
        tags: tags,
        notes: {
          top: (isEn ? item.notes_top_en : item.notes_top) || item.notes_top || '',
          heart: (isEn ? item.notes_heart_en : item.notes_heart) || item.notes_heart || '',
          base: (isEn ? item.notes_base_en : item.notes_base) || item.notes_base || '',
        },
        description: (isEn ? item.description_en : item.description) || item.description || '',
        quote: (isEn ? item.quote_en : item.quote) || item.quote || '',
        imageUrl: item.image_url ?? '',
      };
    });
  }

  async list(params: { page: number; pageSize: number; q?: string; status?: string }) {
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
    const card = await this.cardRepo.findOne({ where: { name_zh: cardName } });
    return card?.id ?? null;
  }
}
