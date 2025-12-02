import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interpretation } from '../entities/interpretation.entity';
import { DEFAULT_PAGE_SIZE } from '../constants/tarot';

@Injectable()
export class InterpretationService {
  constructor(
    @InjectRepository(Interpretation) private repo: Repository<Interpretation>,
  ) {}

  async findOne(query: {
    card_name: string;
    category?: string;
    position: string;
    language?: string;
  }) {
    let lang = (query.language || 'en').toLowerCase();
    if (lang.startsWith('zh')) lang = 'zh';
    const alt = lang === 'en' ? 'zh' : 'en';
    const record = await this.repo.findOne({
      where: {
        card_name: query.card_name,
        category: query.category,
        position: query.position,
      },
    });
    if (!record) return null;
    const pick = (field: string) =>
      (record as any)[`${field}_${lang}`] ??
      (record as any)[`${field}_${alt}`] ??
      null;
    return {
      card_name: record.card_name,
      category: record.category,
      position: record.position,
      language: lang,
      summary: pick('summary'),
      interpretation: pick('interpretation'),
      action: pick('action'),
      future: pick('future'),
      recommendation: pick('recommendation'),
    };
  }

  async drawThree(): Promise<Interpretation[]> {
    // placeholder: random 3 distinct rows
    const all = await this.repo.find({ take: 100 });
    const shuffled = all.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }

  async importMany(items: Partial<Interpretation>[]) {
    // 1. Group items by language to ensure consistent keys in each batch upsert
    const groups: Record<string, any[]> = {};
    
    for (const item of items) {
      const lang = ((item as any).language || 'en').toLowerCase();
      const normLang = lang.startsWith('zh') ? 'zh' : 'en';
      
      if (!groups[normLang]) groups[normLang] = [];
      
      const base = {
        card_name: item.card_name,
        category: item.category,
        position: item.position,
      } as any;

      const prefix = normLang === 'zh' ? '_zh' : '_en';
      
      // Only set fields for the specific language. 
      // Do NOT set other language fields to null to avoid overwriting them in DB.
      if ((item as any).summary !== undefined) base[`summary${prefix}`] = (item as any).summary;
      if ((item as any).interpretation !== undefined) base[`interpretation${prefix}`] = (item as any).interpretation;
      if ((item as any).action !== undefined) base[`action${prefix}`] = (item as any).action;
      if ((item as any).future !== undefined) base[`future${prefix}`] = (item as any).future;
      if ((item as any).recommendation !== undefined) base[`recommendation${prefix}`] = (item as any).recommendation;

      groups[normLang].push(base);
    }

    const results: Partial<Interpretation>[] = [];
    // 2. Execute upsert for each language group
    for (const lang of Object.keys(groups)) {
      const batch = groups[lang];
      if (batch.length > 0) {
        // Upsert will only update the columns present in 'batch' objects.
        // Since we separated by language, this batch only touches columns for 'lang'.
        await this.repo.upsert(batch, ['card_name', 'category', 'position']);
        results.push(...batch);
      }
    }
    
    return results;
  }

  async findAll(page = 1, limit = DEFAULT_PAGE_SIZE, filters: any = {}) {
    const take = Math.min(500, Math.max(1, Number(limit) || DEFAULT_PAGE_SIZE));
    const qb = this.repo.createQueryBuilder('i');
    if (filters.card_name)
      qb.andWhere('i.card_name = :card', { card: filters.card_name });
    if (filters.category)
      qb.andWhere('i.category = :cat', { cat: filters.category });
    if (filters.position)
      qb.andWhere('i.position = :pos', { pos: filters.position });
    if (filters.language) {
      const lang = filters.language.toLowerCase();
      qb.andWhere(
        `(i.summary_${lang} IS NOT NULL OR i.interpretation_${lang} IS NOT NULL)`,
      );
    }
    if (filters.keyword) {
      const kw = `%${filters.keyword.trim()}%`;
      qb.andWhere(
        `(i.card_name ILIKE :kw OR i.summary_en ILIKE :kw OR i.summary_zh ILIKE :kw OR i.interpretation_en ILIKE :kw OR i.interpretation_zh ILIKE :kw OR i.action_en ILIKE :kw OR i.action_zh ILIKE :kw OR i.future_en ILIKE :kw OR i.future_zh ILIKE :kw)`,
        { kw },
      );
    }
    const [items, total] = await qb
      .skip((page - 1) * take)
      .take(take)
      .orderBy('i.id', 'DESC')
      .getManyAndCount();
    return { items, total, page, limit: take };
  }

  async create(data: Partial<Interpretation>) {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: number, data: Partial<Interpretation>) {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: number) {
    return this.repo.delete(id);
  }

  async getInterpretationsForCards(
    cards: { name_en: string }[],
    category: string,
    language: string,
  ) {
    const positions = ['Past', 'Present', 'Future'];
    const results: { position: string; card_name: string; content: any }[] = [];

    for (let i = 0; i < Math.min(cards.length, 3); i++) {
      const card = cards[i];
      const position = positions[i];
      const interp = await this.findOne({
        card_name: card.name_en,
        category,
        position,
        language,
      });
      results.push({
        position,
        card_name: card.name_en,
        content: interp,
      });
    }
    return results;
  }

  exportAll() {
    return this.repo.find();
  }
}
