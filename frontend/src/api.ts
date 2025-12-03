import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 统一错误处理
    let errorMessage = '网络请求失败，请稍后重试'
    
    if (error.response) {
      // 服务器返回错误
      const status = error.response.status
      switch (status) {
        case 400:
          errorMessage = '请求参数错误'
          break
        case 401:
          errorMessage = '未授权，请重新登录'
          break
        case 403:
          errorMessage = '拒绝访问'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器错误'
          break
        default:
          errorMessage = error.response.data?.message || errorMessage
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      errorMessage = '网络连接失败，请检查网络'
    }
    
    // 可以在这里集成 Toast 通知
    // 但为了避免循环依赖，我们将在组件中处理
    console.error('API Error:', errorMessage, error)
    
    return Promise.reject({ ...error, friendlyMessage: errorMessage })
  }
)

export type DrawResult = {
  past: unknown
  now: unknown
  future: unknown
}

export async function fetchDraw(category?: string, language?: string) {
  const res = await api.get<DrawResult>('/api/interp/draw', { params: { category, language } })
  return res.data
}

export async function fetchInterpretation(params: { card_name: string; category: string; position: string; language: string }) {
  const res = await api.get('/api/interp', { params })
  return res.data
}

export async function submitQuestionnaire(body: Record<string, string>) {
  const res = await api.post('/api/questionnaire', body)
  return res.data
}

export interface Question {
  id: number
  title_en: string
  title_zh: string
  options_en: string[]
  options_zh: string[]
  active: boolean
  weight: number
}

export async function fetchQuestions() {
  const res = await api.get<Question[]>('/api/questionnaire/questions')
  return res.data
}

export async function createCheckout(body: { currency: 'cny' | 'usd'; metadata?: Record<string, unknown> }) {
  const res = await api.post('/api/pay/create-session', body)
  return res.data as { orderId: string; sessionUrl: string | null }
}

export async function getOrder(id: string) {
  const res = await api.get('/api/pay/order/' + id)
  return res.data
}

export type RuleMatchResult = {
  rule: null | {
    id: number
    question_id: number
    card_codes: string[]
    priority: number
    sentence_free?: { en?: string; zh?: string } | null
    interpretation_full?: { en?: string; zh?: string } | null
    recommendations?: Array<{ title_en?: string; title_zh?: string; desc_en?: string; desc_zh?: string }> | null
  }
}

export async function matchRule(payload: { card_indices: number[]; answers?: Record<string, string>; language?: string; category?: string }) {
  const res = await api.post<RuleMatchResult>('/api/interp/rule-match', payload)
  return res.data
}

export type PerfumeNotes = {
  top: string
  heart: string
  base: string
}

export type PerfumeChapter = {
  id: number
  order: number
  cardName: string
  sceneChoice: string
  sceneChoiceZh?: string
  sceneChoiceEn?: string
  brandName: string
  productName: string
  tags: string[]
  notes: PerfumeNotes
  description: string
  description_en?: string
  sentence?: string
  sentence_en?: string
  imageUrl: string
}

export const getPerfumeChapters = (cardIds: number[], language = 'zh', scentAnswer?: string) => {
  return api.get<{ chapters: PerfumeChapter[] }>('/api/perfume/chapters', {
    params: { card_indices: cardIds.join(','), language, scentAnswer },
  })
}

export interface ReadingSection {
  position?: string;
  card_name?: string;
  sentence?: string | null;
  interpretation?: string | null;
  recommendation?: string | null;
  is_locked: boolean;
}

export interface ReadingResult {
  is_unlocked: boolean;
  past: ReadingSection | null;
  present: ReadingSection | null;
  future: ReadingSection | null;
}

export async function getReading(payload: {
  card_indices: number[];
  answers?: Record<string, string>;
  orderId?: string;
  language?: string;
  category?: string;
  timestamp?: number;
}) {
  const res = await api.post<ReadingResult>('/api/interp/reading', payload);
  return res.data;
}

export async function fetchPayConfig() {
  const res = await api.get<{ priceDisplay: string; currency: string; priceAmount: number }>('/api/pay/config');
  return res.data;
}

export default api
