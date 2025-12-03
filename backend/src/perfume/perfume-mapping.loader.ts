import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { Card } from '../entities/card.entity';

export type PerfumeMappingEntry = {
  cardName: string;
  scentChoice: string; // e.g. "A. 玫瑰园"
  productName: string;
  notes: string;
  reason: string;
};

// Normalize scent answer to the canonical options used in Excel
const scentKeywords: Record<string, string> = {
  玫瑰: 'A. 玫瑰园',
  rose: 'A. 玫瑰园',
  木质: 'B. 暖木',
  wood: 'B. 暖木',
  咖啡: 'C. 咖啡馆',
  烘焙: 'C. 咖啡馆',
  coffee: 'C. 咖啡馆',
  白皂: 'D. 白皂',
  皂: 'D. 白皂',
  soap: 'D. 白皂',
};

function normalizeScentChoice(input?: string): string | null {
  if (!input) return null;
  const lower = input.toLowerCase();
  // Exact known labels
  if (/\b玫瑰园|rose/.test(lower)) return 'A. 玫瑰园';
  if (/\b暖木|wood/.test(lower)) return 'B. 暖木';
  if (/\b咖啡|烘焙|cafe|coffee/.test(lower)) return 'C. 咖啡馆';
  if (/\b白皂|soap/.test(lower)) return 'D. 白皂';
  // Keyword map fallback
  for (const [kw, val] of Object.entries(scentKeywords)) {
    if (lower.includes(kw)) return val;
  }
  return null;
}

let cache: Map<string, PerfumeMappingEntry> | null = null;

export function loadPerfumeMapping(
  baseDir = process.cwd(),
): Map<string, PerfumeMappingEntry> {
  if (cache) return cache;

  const candidates = [
    path.join(baseDir, 'assets', 'perfume.xlsx'),
    path.join(baseDir, '..', 'legacy', 'data', 'perfume.xlsx'),
  ];

  const file = candidates.find((p) => fs.existsSync(p));
  if (!file) {
    console.warn(
      '[perfume-mapping] perfume.xlsx not found in assets or legacy/data',
    );
    cache = new Map();
    return cache;
  }

  const wb = xlsx.readFile(file);
  const sheet =
    wb.SheetNames.find((n) => n.includes('香水')) || wb.SheetNames[0];
  const rows: any[] = xlsx.utils.sheet_to_json(wb.Sheets[sheet], {
    defval: '',
  });

  const map = new Map<string, PerfumeMappingEntry>();
  rows.forEach((row) => {
    const cardName = String(row['塔羅牌'] || '').trim();
    const scentChoice = String(row['氣息選擇'] || '').trim();
    if (!cardName || !scentChoice) return;
    const productName = String(row['推薦香水'] || '').trim();
    const notes = String(row['香調特點'] || '').trim();
    const reason = String(row['感情方向推薦理由'] || '').trim();
    const key = `${cardName}__${scentChoice}`;
    map.set(key, { cardName, scentChoice, productName, notes, reason });
  });

  cache = map;
  return map;
}

export function findPerfumeByCardAndScent(card: Card, scentAnswer?: string) {
  const map = loadPerfumeMapping();
  const normalized = normalizeScentChoice(scentAnswer);
  if (!normalized) return null;
  // Try Chinese name (primary in sheet) - REMOVED as name_zh is deleted
  // const cnKey = `${card.name_zh}__${normalized}`;
  // if (map.has(cnKey)) return map.get(cnKey)!;
  // Try English name if provided (less likely)
  const enKey = `${card.name_en}__${normalized}`;
  if (map.has(enKey)) return map.get(enKey)!;
  return null;
}
