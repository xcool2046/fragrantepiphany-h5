import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
})

export type DrawResult = {
  past: any
  now: any
  future: any
}

export async function fetchDraw(category?: string, language?: string) {
  const res = await api.get<DrawResult>('/api/interp/draw', { params: { category, language } })
  return res.data
}

export async function fetchInterpretation(params: { card_name: string; category: string; position: string; language: string }) {
  const res = await api.get('/api/interp', { params })
  return res.data
}

export async function submitQuestionnaire(body: { q1: string; q2: string; q3: string }) {
  const res = await api.post('/api/questionnaire', body)
  return res.data
}

export async function createCheckout(body: { currency: 'cny' | 'usd'; metadata?: any }) {
  const res = await api.post('/api/pay/create-session', body)
  return res.data as { orderId: string; sessionUrl: string | null }
}

export async function getOrder(id: string) {
  const res = await api.get('/api/pay/order/' + id)
  return res.data
}

export default api
