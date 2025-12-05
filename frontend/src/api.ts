import axios from 'axios'
import { API_ENDPOINTS } from './config/api'

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
  const res = await api.get<DrawResult>(API_ENDPOINTS.INTERP.DRAW, { params: { category, language } })
  return res.data
}

export async function fetchInterpretation(params: { card_name: string; category: string; position: string; language: string }) {
  const res = await api.get(API_ENDPOINTS.INTERP.GET, { params })
  return res.data
}

export async function submitQuestionnaire(body: Record<string, string>) {
  const res = await api.post(API_ENDPOINTS.QUESTIONNAIRE.SUBMIT, body)
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
  const res = await api.get<Question[]>(API_ENDPOINTS.QUESTIONNAIRE.QUESTIONS)
  return res.data
}

export async function createCheckout(body: { currency: 'cny' | 'usd'; metadata?: Record<string, unknown> }) {
  const res = await api.post(API_ENDPOINTS.PAY.CREATE_SESSION, body)
  return res.data as { orderId: string; sessionUrl: string | null }
}

export async function getOrder(id: string) {
  const res = await api.get(API_ENDPOINTS.PAY.ORDER + '/' + id)
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
  const res = await api.post<RuleMatchResult>(API_ENDPOINTS.INTERP.RULE_MATCH, payload)
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

export const getPerfumeChapters = (params: {
  cardIds?: number[]
  cardIndices?: number[]
  language: string
  scentAnswer?: string
  category?: string
  q4Answer?: string
}) => {
  const query = new URLSearchParams()
  const { cardIds, cardIndices, language, scentAnswer, category, q4Answer } = params

  if (cardIndices && cardIndices.length > 0) {
    query.append('card_indices', cardIndices.join(','))
  } else if (cardIds && cardIds.length > 0) {
    query.append('cardIds', cardIds.join(','))
  }

  query.append('language', language)
  if (scentAnswer) query.append('scentAnswer', scentAnswer)
  if (category) query.append('category', category)
  if (q4Answer) query.append('q4Answer', q4Answer)

  return api.get<{ chapters: PerfumeChapter[] }>(`${API_ENDPOINTS.PERFUME.CHAPTERS}?${query.toString()}`)
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
  const res = await api.post<ReadingResult>(API_ENDPOINTS.INTERP.READING, payload);
  return res.data;
}

export async function fetchPayConfig() {
  const res = await api.get<{ priceDisplay: string; currency: string; priceAmount: number }>(API_ENDPOINTS.PAY.CONFIG);
  return res.data;
}

// 卡牌数据类型
export interface Card {
  id: number
  code: string
  name_en: string | null
  name_zh: string | null
  image_url: string | null
  enabled: boolean
}

// 获取所有卡牌列表
export async function fetchCards() {
  const res = await api.get<Card[]>(API_ENDPOINTS.CONTENT.CARDS)
  return res.data
}

export default api
