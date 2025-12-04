import { PerfumeChapter } from '../api'
import { SCENE_IMAGES } from '../config/perfume-constants'

/**
 * Helper to extract the scene code (A, B, C, D) from an answer string.
 * It looks for "A.", "B.", etc., or keywords if necessary.
 */
export function extractSceneCode(answer: string): string | undefined {
  if (!answer) return undefined;
  
  // 1. Check for explicit prefix "A.", "B.", etc.
  const prefixMatch = answer.match(/^([A-D])\./i);
  if (prefixMatch) return prefixMatch[1].toUpperCase();

  // 2. Keyword fallback (if needed, but prefer prefix)
  const lower = answer.toLowerCase();
  if (lower.includes('rose') || lower.includes('玫瑰')) return 'A';
  if (lower.includes('wood') || lower.includes('木')) return 'B';
  if (lower.includes('cafe') || lower.includes('coffee') || lower.includes('咖啡')) return 'C';
  if (lower.includes('soap') || lower.includes('皂')) return 'D';

  return undefined;
}

/**
 * Find the scent answer code from a map of answers.
 */
export function findScentAnswer(answers: Record<string, string>): string | undefined {
  if (!answers || typeof answers !== 'object') return undefined;

  const answerValues = Object.values(answers);
  for (const val of answerValues) {
      if (!val || typeof val !== 'string') continue;
      const code = extractSceneCode(val);
      if (code && SCENE_IMAGES[code]) return code;
  }
  return undefined;
}

/**
 * Match a user's scent preference answer to a perfume chapter.
 */
export function matchSceneChoice(chapters: PerfumeChapter[], scentAnswer?: string): PerfumeChapter | undefined {
  if (!chapters.length) return undefined
  
  const defaultFallback = chapters[chapters.length - 1];
  if (!scentAnswer) return defaultFallback

  const userCode = extractSceneCode(scentAnswer);
  if (!userCode) return defaultFallback;

  // Match against chapter's scene choice (assuming it starts with the code or contains it)
  const match = chapters.find(c => {
    const candidates = [c.sceneChoice, c.sceneChoiceZh, c.sceneChoiceEn].filter(Boolean) as string[];
    return candidates.some(choice => {
        const choiceCode = extractSceneCode(choice);
        return choiceCode === userCode;
    });
  });

  return match || defaultFallback
}
