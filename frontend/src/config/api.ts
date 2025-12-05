export const API_ENDPOINTS = {
  INTERP: {
    DRAW: '/api/interp/draw',
    GET: '/api/interp',
    RULE_MATCH: '/api/interp/rule-match',
    READING: '/api/interp/reading',
  },
  QUESTIONNAIRE: {
    SUBMIT: '/api/questionnaire',
    QUESTIONS: '/api/questionnaire/questions',
  },
  PAY: {
    CREATE_SESSION: '/api/pay/create-session',
    ORDER: '/api/pay/order',
    CONFIG: '/api/pay/config',
  },
  PERFUME: {
    CHAPTERS: '/api/perfume/chapters',
  },
  CONTENT: {
    CARDS: '/api/content/cards',
  },
  AUTH: {
    LOGIN: '/api/auth/login',
  },
  ADMIN: {
    PERFUMES: '/api/admin/perfumes',
    QUESTIONS: '/api/admin/questions',
    CARDS: '/api/admin/cards',
    CARDS_UPLOAD: '/api/admin/cards/upload',
    CARDS_IMPORT: '/api/admin/cards/import',
    CARDS_EXPORT: '/api/admin/cards/export',
  },
  INTERP_ADMIN: {
    LIST: '/api/interp/list',
    CREATE: '/api/interp',
    UPDATE: '/api/interp/update',
    DELETE: '/api/interp/delete',
  },
} as const;
