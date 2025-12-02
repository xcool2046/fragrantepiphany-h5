import { PerfumeChapter } from '../api'

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
