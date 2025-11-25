import { useCallback, useEffect, useMemo, useState } from 'react'
import Section from '../../components/Section'
import SearchBar from '../../components/admin/SearchBar'
import api from '../../api'

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
  const [keyword, setKeyword] = useState('')
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

  const fetchRules = useCallback(async (p = 1, kw = keyword) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(p))
      params.set('pageSize', String(pageSize))
      if (kw.trim()) params.set('keyword', kw.trim())
      const res = await api.get(`/api/admin/rules?${params.toString()}`, { headers: tokenHeader })
      setRules(res.data.items || [])
      setTotal(res.data.total || 0)
      setPage(res.data.page || p)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [keyword, pageSize, tokenHeader])

  const fetchQuestions = useCallback(async () => {
    const res = await api.get('/api/admin/questions', { headers: tokenHeader })
    setQuestions(res.data.items || [])
  }, [tokenHeader])

  useEffect(() => {
    fetchQuestions()
    fetchRules()
  }, [fetchQuestions, fetchRules])

  useEffect(() => {
    const t = setTimeout(() => fetchRules(1, keyword), 250)
    return () => clearTimeout(t)
  }, [fetchRules, keyword])

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
    setTextLang('en')
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
    setTextLang(r.summary_free?.zh ? 'zh' : 'en')
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
        await api.patch(`/api/admin/rules/${editing.id}`, payload, { headers: tokenHeader })
      } else {
        await api.post('/api/admin/rules', payload, { headers: tokenHeader })
      }
      setModalOpen(false)
      fetchRules(page)
    } catch (e: any) {
      alert(e?.response?.data?.message || '保存失败')
    }
  }

  const toggle = async (r: Rule) => {
    await api.patch(`/api/admin/rules/${r.id}`, { enabled: !r.enabled }, { headers: tokenHeader })
    fetchRules(page)
  }

  const remove = async (r: Rule) => {
    if (!window.confirm('确认删除该规则？')) return
    await api.delete(`/api/admin/rules/${r.id}`, { headers: tokenHeader })
    fetchRules(page)
  }

  return (
    <div className={`space-y-6 ${bgClass} p-1 rounded-3xl shadow-inner`}>
      <Section title="Rules" description="将问题 + 三张牌组合映射到解析/推荐">
        <div className="flex flex-wrap gap-3 items-center">
          <button onClick={openCreate} className="px-4 py-2 bg-[#2B1F16] text-[#F3E6D7] rounded-xl hover:scale-105 transition-all shadow-md">新增规则</button>
          <SearchBar
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="按牌组/文案搜索"
            className="bg-white/80 border border-[#D4A373]/20 rounded-2xl px-2 py-1"
          />
          <button onClick={() => fetchRules(1, keyword)} className="px-3 py-2 rounded-xl bg-white border text-sm text-[#2B1F16] hover:border-[#D4A373]">刷新</button>
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
            <button disabled={page === 1} onClick={() => fetchRules(page - 1, keyword)} className="px-3 py-1 rounded border bg-white disabled:opacity-50">上一页</button>
            <div className="text-sm text-gray-600 px-2 py-1">第 {page} 页 / 共 {Math.ceil(total / pageSize)} 页</div>
            <button disabled={page * pageSize >= total} onClick={() => fetchRules(page + 1, keyword)} className="px-3 py-1 rounded border bg-white disabled:opacity-50">下一页</button>
          </div>
        )}
      </Section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-serif text-[#2B1F16]">{editing ? '编辑规则' : '新增规则'}</h3>
                <div className="flex items-center gap-2 bg-[#F7F0E5] rounded-full px-3 py-1 text-sm text-[#6B5542]">
                  <button className={`px-2 py-0.5 rounded-full ${textLang === 'en' ? 'bg-white shadow-sm text-[#2B1F16]' : ''}`} onClick={() => setTextLang('en')}>EN</button>
                  <button className={`px-2 py-0.5 rounded-full ${textLang === 'zh' ? 'bg-white shadow-sm text-[#2B1F16]' : ''}`} onClick={() => setTextLang('zh')}>ZH</button>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-[#2B1F16]">✕</button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#6B5542]">Question</label>
                <select value={form.question_id} onChange={(e) => setForm({ ...form, question_id: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30">
                  <option value="">选择题目</option>
                  {questions.map((q) => (
                    <option key={q.id} value={q.id}>{q.title_en}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-[#6B5542]">Priority</label>
                <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              {form.card_codes.map((code, idx) => (
                <div key={idx}>
                  <label className="text-sm text-[#6B5542]">Card Code {idx + 1}</label>
                  <input value={code} onChange={(e) => {
                    const next = [...form.card_codes]
                    next[idx] = e.target.value
                    setForm({ ...form, card_codes: next })
                  }} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" />
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {textLang === 'en' ? (
                <>
                  <div>
                    <label className="text-sm text-[#6B5542]">Summary EN</label>
                    <textarea value={form.summary_en} onChange={(e) => setForm({ ...form, summary_en: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" rows={3} />
                  </div>
                  <div>
                    <label className="text-sm text-[#6B5542]">Interpretation EN</label>
                    <textarea value={form.full_en} onChange={(e) => setForm({ ...form, full_en: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" rows={4} />
                  </div>
                  <div className="md:col-span-2 grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-[#6B5542]">Rec Title EN</label>
                      <input value={form.rec_title_en} onChange={(e) => setForm({ ...form, rec_title_en: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" />
                    </div>
                    <div>
                      <label className="text-sm text-[#6B5542]">Rec Desc EN</label>
                      <input value={form.rec_desc_en} onChange={(e) => setForm({ ...form, rec_desc_en: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm text-[#6B5542]">Summary ZH</label>
                    <textarea value={form.summary_zh} onChange={(e) => setForm({ ...form, summary_zh: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" rows={3} />
                  </div>
                  <div>
                    <label className="text-sm text-[#6B5542]">Interpretation ZH</label>
                    <textarea value={form.full_zh} onChange={(e) => setForm({ ...form, full_zh: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" rows={4} />
                  </div>
                  <div className="md:col-span-2 grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-[#6B5542]">Rec Title ZH</label>
                      <input value={form.rec_title_zh} onChange={(e) => setForm({ ...form, rec_title_zh: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" />
                    </div>
                    <div>
                      <label className="text-sm text-[#6B5542]">Rec Desc ZH</label>
                      <input value={form.rec_desc_zh} onChange={(e) => setForm({ ...form, rec_desc_zh: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-[#2B1F16]">
                <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} className="h-4 w-4 text-[#D4A373]" />
                启用
              </label>
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
