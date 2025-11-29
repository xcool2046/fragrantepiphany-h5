export const TAROT_CATEGORIES = ['Self', 'Love', 'Career', 'Perfume'] as const;
export const TAROT_POSITIONS = ['Past', 'Present', 'Future'] as const;
export const DEFAULT_PAGE_SIZE = 10;

export type TarotCategory = typeof TAROT_CATEGORIES[number];
export type TarotPosition = typeof TAROT_POSITIONS[number];
