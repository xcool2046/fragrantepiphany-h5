import { PerfumeChapter } from '../api'
import { BACKGROUND_IMAGES } from '../config/perfume-constants'

// 关键词映射表：关键词 -> BACKGROUND_IMAGES 中的标准 key
const SCENT_KEYWORDS: Array<{ keywords: string[], key: string }> = [
  {
    keywords: ['玫瑰', 'rose', 'garden', '花园'],
    key: '初夏清晨的玫瑰园'
  },
  {
    keywords: ['木质', 'wooden', 'furniture', '家具', '阳光'],
    key: '午后被阳光烘暖的木质家具'
  },
  {
    keywords: ['咖啡', 'coffee', 'cafe', 'baking', '烘焙'],
    key: '夜晚咖啡馆飘出的烘焙香气'
  },
  {
    keywords: ['香皂', 'soap', 'seaside', '海边', '度假'],
    key: '海边度假时的白色香皂'
  }
]

/**
 * Helper to find the scent-related answer from a map of answers.
 * It searches for a value that exists in our defined BACKGROUND_IMAGES keys.
 * Returns the KEY from BACKGROUND_IMAGES that matched.
 */
export function findScentAnswer(answers: Record<string, string>): string | undefined {
  if (!answers || typeof answers !== 'object') return undefined;

  const validChoices = Object.keys(BACKGROUND_IMAGES).filter(k => k !== 'default');
  const answerValues = Object.values(answers);

  for (const val of answerValues) {
      if (!val || typeof val !== 'string') continue;

      const cleanVal = val.replace(/^[A-Z]\.\s*/, '').trim().toLowerCase();

      // 1. Exact match
      if (validChoices.includes(val)) return val;

      // 2. Fuzzy match - check if answer text matches any valid choice
      const matchedKey = validChoices.find(key => {
          const cleanKey = key.replace(/^[A-Z]\.\s*/, '').trim().toLowerCase();
          return cleanVal.includes(cleanKey) || cleanKey.includes(cleanVal);
      });
      if (matchedKey) return matchedKey;

      // 3. Keyword-based match - 使用关键词匹配
      for (const { keywords, key } of SCENT_KEYWORDS) {
          if (keywords.some(kw => cleanVal.includes(kw.toLowerCase()))) {
              return key;
          }
      }
  }

  return undefined;
}

/**
 * Match a user's scent preference answer to a perfume chapter.
 * Supports exact match and fuzzy match against localized scene choices.
 * 
 * @param chapters List of available perfume chapters
 * @param scentAnswer The user's answer to the scent preference question
 * @returns The matched PerfumeChapter or undefined if no match found
 */
export function matchSceneChoice(chapters: PerfumeChapter[], scentAnswer?: string): PerfumeChapter | undefined {
  if (!chapters.length) return undefined
  
  // Default fallback: 
  // Logic: Return the chapter associated with the "Future" position (usually the 3rd one, i.e. index 2).
  // If only 1 or 2 chapters exist, fallback to the last one.
  const defaultFallback = chapters[chapters.length - 1];

  if (!scentAnswer) return defaultFallback

  // Fuzzy match logic
  // DB has "A. 玫瑰园", "午后被阳光烘暖的木质家具"
  // Question has "初夏清晨的玫瑰园", "午后被阳光烘暖的木质家具"
  const match = chapters.find(c => {
    // We try to match against all available variations of the scene choice
    const candidates = [
      c.sceneChoice,
      c.sceneChoiceZh,
      c.sceneChoiceEn
    ].filter(Boolean) as string[]
    
    return candidates.some(dbChoice => {
      // Exact match
      if (dbChoice === scentAnswer) return true
      
      // Partial match (e.g. "玫瑰园" in "初夏清晨的玫瑰园")
      // We check if key keywords from DB choice exist in user answer
      // Remove "A. " prefix and split by common separators
      const keywords = dbChoice.replace(/^[A-Z]\.\s*/, '').split(/[\s,，]+/)
      return keywords.some(k => k && (scentAnswer.includes(k) || k.includes(scentAnswer)))
    })
  })

  return match || defaultFallback
}
