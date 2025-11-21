import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Section from '../../components/Section'

type Question = { id: number; title_en: string; title_zh?: string | null }
type Rule = {
  id: number
  question_id: number
  card_codes: string[]
  priority: number
  summary_free?: { en?: string; zh?: string } | null
  interpretation_full?: { en?: string; zh?: string } | null
  recommendations?: Array<{ title_en?: string; title_zh?: string; desc_en?: string; desc_zh?: string }> | null
  enabled: boolean
}

const bgClass = 'bg-gradient-to-br from-[#F7F0E5] via-white to-[#F7F0E5]'

export default function Rules() {
  const [rules, setRules] = useState<Rule[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 20
  const [filters, setFilters] = useState({ question_id: '', card_code: '' })
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Rule | null>(null)
  const [form, setForm] = useState({
    question_id: '',
    card_codes: ['', '', ''],
    priority: 100,
    summary_en: '',
    summary_zh: '',
    full_en: '',
    full_zh: '',
    rec_title_en: '',
    rec_title_zh: '',
    rec_desc_en: '',
    rec_desc_zh: '',
    enabled: true,
  })
  const [textLang, setTextLang] = useState<'en' | 'zh'>('en')

  const tokenHeader = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}` }), [])

  const fetchQuestions = async () => {
    const res = await axios.get('/api/admin/questions', { headers: tokenHeader })
    setQuestions(res.data.items || [])
  }

  const fetchRules = async (p = 1, extra = filters) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(p))
      params.set('pageSize', String(pageSize))
      if (extra.question_id) params.set('question_id', extra.question_id)
      if (extra.card_code) params.set('card_code', extra.card_code.trim())
      const res = await axios.get(`/api/admin/rules?${params.toString()}`, { headers: tokenHeader })
      setRules(res.data.items || [])
      setTotal(res.data.total || 0)
      setPage(res.data.page || p)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
    fetchRules()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({
      question_id: '',
      card_codes: ['', '', ''],
      priority: 100,
      summary_en: '',
      summary_zh: '',
      full_en: '',
      full_zh: '',
      rec_title_en: '',
      rec_title_zh: '',
      rec_desc_en: '',
      rec_desc_zh: '',
      enabled: true,
    })
    setModalOpen(true)
  }

  const openEdit = (r: Rule) => {
    setEditing(r)
    setForm({
      question_id: String(r.question_id),
      card_codes: r.card_codes,
      priority: r.priority,
      summary_en: r.summary_free?.en || '',
      summary_zh: r.summary_free?.zh || '',
      full_en: r.interpretation_full?.en || '',
      full_zh: r.interpretation_full?.zh || '',
      rec_title_en: r.recommendations?.[0]?.title_en || '',
      rec_title_zh: r.recommendations?.[0]?.title_zh || '',
      rec_desc_en: r.recommendations?.[0]?.desc_en || '',
      rec_desc_zh: r.recommendations?.[0]?.desc_zh || '',
      enabled: r.enabled,
    })
    setModalOpen(true)
  }

  const save = async () => {
    if (!form.question_id || form.card_codes.some((c) => !c.trim())) {
      alert('问题与三张牌 code 必填')
      return
    }
    const payload = {
      question_id: Number(form.question_id),
      card_codes: form.card_codes.map((c) => c.trim()),
      priority: Number(form.priority) || 100,
      summary_free: { en: form.summary_en || undefined, zh: form.summary_zh || undefined },
      interpretation_full: { en: form.full_en || undefined, zh: form.full_zh || undefined },
      recommendations:
        form.rec_title_en || form.rec_title_zh || form.rec_desc_en || form.rec_desc_zh
          ? [{ title_en: form.rec_title_en || undefined, title_zh: form.rec_title_zh || undefined, desc_en: form.rec_desc_en || undefined, desc_zh: form.rec_desc_zh || undefined }]
          : null,
      enabled: form.enabled,
    }
    try {
      if (editing) {
        await axios.patch(`/api/admin/rules/${editing.id}`, payload, { headers: tokenHeader })
      } else {
        await axios.post('/api/admin/rules', payload, { headers: tokenHeader })
      }
      setModalOpen(false)
      fetchRules(page)
    } catch (e: any) {
      alert(e?.response?.data?.message || '保存失败')
    }
  }

  const toggle = async (r: Rule) => {
    await axios.patch(`/api/admin/rules/${r.id}`, { enabled: !r.enabled }, { headers: tokenHeader })
    fetchRules(page)
  }

  const remove = async (r: Rule) => {
    if (!window.confirm('确认删除该规则？')) return
    await axios.delete(`/api/admin/rules/${r.id}`, { headers: tokenHeader })
    fetchRules(page)
  }

  return (
    <div className={`space-y-6 ${bgClass} p-1 rounded-3xl shadow-inner`}>
      <Section title="Rules" description="将问题 + 三张牌组合映射到解析/推荐">
        <div className="flex flex-wrap gap-3 items-center">
          <button onClick={openCreate} className="px-4 py-2 bg-[#2B1F16] text-[#F3E6D7] rounded-xl hover:scale-105 transition-all shadow-md">新增规则</button>
          <div className="flex flex-wrap gap-2 items-center bg-white/80 border border-[#D4A373]/20 rounded-2xl px-3 py-2 shadow-sm">
            <select value={filters.question_id} onChange={(e) => setFilters({ ...filters, question_id: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20">
              <option value="">全部问题</option>
              {questions.map((q) => (
                <option key={q.id} value={q.id}>{q.title_en}</option>
              ))}
            </select>
            <input value={filters.card_code} onChange={(e) => setFilters({ ...filters, card_code: e.target.value })} placeholder="按卡牌 code 筛选" className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20" />
            <label className="flex items-center gap-2 text-sm text-[#2B1F16]">
              <input type="checkbox" checked={false} readOnly className="h-4 w-4 text-[#D4A373]" />
              暂不筛启用（仅列表按钮）
            </label>
            <button onClick={() => fetchRules(1, filters)} className="px-3 py-2 rounded-xl bg-white border text-sm text-[#2B1F16] hover:border-[#D4A373]">筛选</button>
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          {loading && <div className="text-sm text-gray-500">加载中...</div>}
          {!loading && rules.map((r) => (
            <div key={r.id} className="rounded-2xl border border-[#D4A373]/30 bg-white/80 backdrop-blur shadow-sm p-4 flex flex-col gap-3 hover:shadow-lg transition">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-1 rounded-full bg-[#D4A373]/20 text-[#2B1F16] text-xs">Q{r.question_id}</span>
                <span className="text-sm text-[#6B5542] font-semibold">{r.card_codes.join(' · ')}</span>
                <span className="text-xs text-[#6B5542]">优先级 {r.priority}</span>
                {!r.enabled && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">禁用</span>}
              </div>
              {(r.summary_free?.en || r.summary_free?.zh) && (
                <div className="text-sm text-[#2B1F16] line-clamp-2">摘要：{r.summary_free?.en || r.summary_free?.zh}</div>
              )}
              {(r.interpretation_full?.en || r.interpretation_full?.zh) && (
                <div className="text-xs text-[#6B5542] line-clamp-2">完整：{r.interpretation_full?.en || r.interpretation_full?.zh}</div>
              )}
              {r.recommendations?.length ? (
                <div className="text-xs text-[#6B5542]">推荐：{r.recommendations[0].title_en || r.recommendations[0].title_zh}</div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => toggle(r)} className="px-3 py-1 rounded-lg bg-white border text-sm text-[#2B1F16] hover:border-[#D4A373]">{r.enabled ? '禁用' : '启用'}</button>
                <button onClick={() => openEdit(r)} className="px-3 py-1 rounded-lg bg-[#D4A373] text-[#2B1F16] text-sm hover:brightness-105">编辑</button>
                <button onClick={() => remove(r)} className="px-3 py-1 rounded-lg bg-white border text-sm text-red-500 hover:border-red-400">删除</button>
              </div>
            </div>
          ))}
        </div>
        {total > pageSize && (
          <div className="flex gap-2 mt-4">
            <button disabled={page === 1} onClick={() => fetchRules(page - 1)} className="px-3 py-1 rounded border bg-white disabled:opacity-50">上一页</button>
            <div className="text-sm text-gray-600 px-2 py-1">第 {page} 页 / 共 {Math.ceil(total / pageSize)} 页</div>
            <button disabled={page * pageSize >= total} onClick={() => fetchRules(page + 1)} className="px-3 py-1 rounded border bg-white disabled:opacity-50">下一页</button>
          </div>
        )}
      </Section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto relative">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm flex items-center justify-between pb-2 border-b border-[#F1E5D6]">
              <h3 className="text-xl font-serif text-[#2B1F16]">{editing ? '编辑规则' : '新增规则'}</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="h-9 w-9 rounded-full border border-gray-200 text-gray-500 hover:text-[#2B1F16] hover:border-[#2B1F16] bg-white shadow-sm"
                aria-label="关闭"
              >
                ✕
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#6B5542]">问题</label>
                <select value={form.question_id} onChange={(e) => setForm({ ...form, question_id: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30">
                  <option value="">选择问题</option>
                  {questions.map((q) => (
                    <option key={q.id} value={q.id}>{q.title_en}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-[#6B5542]">优先级（数值越小越先用）</label>
                <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" />
              </div>
              <div className="md:col-span-2 grid md:grid-cols-3 gap-3">
                {form.card_codes.map((c, idx) => (
                  <div key={idx}>
                    <label className="text-sm text-[#6B5542]">卡牌 code {idx + 1}</label>
                    <input value={c} onChange={(e) => {
                      const next = [...form.card_codes]
                      next[idx] = e.target.value
                      setForm({ ...form, card_codes: next })
                    }} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" />
                  </div>
                ))}
              </div>
              <div className="md:col-span-2 flex items-center gap-2">
                <span className="text-sm text-[#6B5542]">文本语言</span>
                {(['en', 'zh'] as const).map((lng) => (
                  <button
                    key={lng}
                    type="button"
                    onClick={() => setTextLang(lng)}
                    className={`px-3 py-1 rounded-lg border text-sm ${textLang === lng ? 'bg-[#D4A373] text-[#2B1F16] border-[#D4A373]' : 'bg-white text-[#2B1F16] border-gray-200 hover:border-[#D4A373]/60'}`}
                  >
                    {lng.toUpperCase()} {lng === 'en' ? (form.summary_en || form.full_en || form.rec_title_en || form.rec_desc_en ? '✓' : '') : (form.summary_zh || form.full_zh || form.rec_title_zh || form.rec_desc_zh ? '✓' : '')}
                  </button>
                ))}
                <span className="text-xs text-[#6B5542]">切换 EN / ZH 逐段编辑</span>
              </div>
              <div className="md:col-span-2 grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-[#6B5542]">摘要 ({textLang.toUpperCase()})</label>
                  <textarea
                    value={textLang === 'en' ? form.summary_en : form.summary_zh}
                    onChange={(e) => setForm({ ...form, [textLang === 'en' ? 'summary_en' : 'summary_zh']: e.target.value })}
                    className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-sm text-[#6B5542]">完整 ({textLang.toUpperCase()})</label>
                  <textarea
                    value={textLang === 'en' ? form.full_en : form.full_zh}
                    onChange={(e) => setForm({ ...form, [textLang === 'en' ? 'full_en' : 'full_zh']: e.target.value })}
                    className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30"
                    rows={3}
                  />
                </div>
              </div>
              <div className="md:col-span-2 grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-[#6B5542]">推荐标题 ({textLang.toUpperCase()})</label>
                  <input
                    value={textLang === 'en' ? form.rec_title_en : form.rec_title_zh}
                    onChange={(e) => setForm({ ...form, [textLang === 'en' ? 'rec_title_en' : 'rec_title_zh']: e.target.value })}
                    className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#6B5542]">推荐描述 ({textLang.toUpperCase()})</label>
                  <textarea
                    value={textLang === 'en' ? form.rec_desc_en : form.rec_desc_zh}
                    onChange={(e) => setForm({ ...form, [textLang === 'en' ? 'rec_desc_en' : 'rec_desc_zh']: e.target.value })}
                    className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} className="h-4 w-4 text-[#D4A373]" />
                <span className="text-sm text-[#2B1F16]">启用</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border text-[#2B1F16]">取消</button>
              <button onClick={save} className="px-4 py-2 rounded-xl bg-[#2B1F16] text-[#F3E6D7] hover:scale-105 transition">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
