import { useCallback, useEffect, useMemo, useState } from 'react'
import Section from '../../components/Section'
import api from '../../api'

type Question = {
  id: number
  title_en: string
  title_zh?: string | null
  options_en?: string[] | null
  options_zh?: string[] | null
  active: boolean
  weight: number
}

const bgClass = 'bg-gradient-to-br from-[#F7F0E5] via-white to-[#F7F0E5]'

export default function Questions() {
  const [items, setItems] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<Question | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ title_en: '', title_zh: '', options_en: '', options_zh: '', active: true, weight: 0 })

  const tokenHeader = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}` }), [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/admin/questions', { headers: tokenHeader })
      setItems(res.data.items || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [tokenHeader])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const openCreate = () => {
    setEditing(null)
    setForm({ title_en: '', title_zh: '', options_en: '', options_zh: '', active: true, weight: items.length * 10 })
    setModalOpen(true)
  }

  const openEdit = (q: Question) => {
    setEditing(q)
    setForm({
      title_en: q.title_en,
      title_zh: q.title_zh || '',
      options_en: (q.options_en || []).join(' | '),
      options_zh: (q.options_zh || []).join(' | '),
      active: q.active,
      weight: q.weight,
    })
    setModalOpen(true)
  }

  const save = async () => {
    if (!form.title_en.trim()) {
      alert('英文标题必填')
      return
    }
    const payload = {
      title_en: form.title_en.trim(),
      title_zh: form.title_zh.trim() || null,
      options_en: form.options_en ? form.options_en.split('|').map((s) => s.trim()).filter(Boolean) : null,
      options_zh: form.options_zh ? form.options_zh.split('|').map((s) => s.trim()).filter(Boolean) : null,
      active: form.active,
      weight: Number(form.weight) || 0,
    }
    try {
      if (editing) {
        await api.patch(`/api/admin/questions/${editing.id}`, payload, { headers: tokenHeader })
      } else {
        await api.post('/api/admin/questions', payload, { headers: tokenHeader })
      }
      setModalOpen(false)
      fetchData()
    } catch (e) {
      console.error(e)
      alert('保存失败')
    }
  }

  const toggleActive = async (q: Question) => {
    await api.patch(`/api/admin/questions/${q.id}`, { active: !q.active }, { headers: tokenHeader })
    fetchData()
  }

  const adjustWeight = async (q: Question, delta: number) => {
    await api.patch(`/api/admin/questions/${q.id}`, { weight: q.weight + delta }, { headers: tokenHeader })
    fetchData()
  }

  const remove = async (q: Question) => {
    if (!window.confirm('确认删除该问题？')) return
    await api.delete(`/api/admin/questions/${q.id}`, { headers: tokenHeader })
    fetchData()
  }

  return (
    <div className={`space-y-6 ${bgClass} p-1 rounded-3xl shadow-inner`}>
      <Section title="Questions" description="管理问卷题目与排序">
        <div className="flex flex-wrap gap-3">
          <button onClick={openCreate} className="px-4 py-2 bg-[#2B1F16] text-[#F3E6D7] rounded-xl hover:scale-105 transition-all shadow-md">
            新增问题
          </button>
        </div>
        <div className="mt-4 grid gap-3">
          {loading && <div className="text-sm text-gray-500">加载中...</div>}
          {!loading && items.map((q, index) => (
            <div key={q.id} className="rounded-2xl border border-[#D4A373]/30 bg-white/70 backdrop-blur shadow-sm p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between transition hover:shadow-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-lg font-serif text-[#2B1F16]">
                  <span className="text-sm text-[#D4A373]">Q{index + 1}</span>
                  <span>{q.title_en}</span>
                  {q.title_zh && <span className="text-sm text-[#6B5542]">/ {q.title_zh}</span>}
                  {!q.active && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">禁用</span>}
                </div>
                {(q.options_en?.length || q.options_zh?.length) && (
                  <div className="text-xs text-[#6B5542] space-y-1">
                    {q.options_en?.length ? <div>EN: {q.options_en.join(' / ')}</div> : null}
                    {q.options_zh?.length ? <div>ZH: {q.options_zh.join(' / ')}</div> : null}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3 md:mt-0">
                <button onClick={() => adjustWeight(q, -5)} className="px-3 py-1 rounded-lg bg-white border text-sm text-[#2B1F16] hover:border-[#D4A373]">上移</button>
                <button onClick={() => adjustWeight(q, 5)} className="px-3 py-1 rounded-lg bg-white border text-sm text-[#2B1F16] hover:border-[#D4A373]">下移</button>
                <button onClick={() => toggleActive(q)} className="px-3 py-1 rounded-lg bg-white border text-sm text-[#2B1F16] hover:border-[#D4A373]">
                  {q.active ? '禁用' : '启用'}
                </button>
                <button onClick={() => openEdit(q)} className="px-3 py-1 rounded-lg bg-[#D4A373] text-[#2B1F16] text-sm hover:brightness-105">编辑</button>
                <button onClick={() => remove(q)} className="px-3 py-1 rounded-lg bg-white border text-sm text-red-500 hover:border-red-400">删除</button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif text-[#2B1F16]">{editing ? '编辑问题' : '新增问题'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-[#2B1F16]">✕</button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#6B5542]">Title (EN)</label>
                <input value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" />
              </div>
              <div>
                <label className="text-sm text-[#6B5542]">标题 (ZH)</label>
                <input value={form.title_zh} onChange={(e) => setForm({ ...form, title_zh: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" />
              </div>
              <div>
                <label className="text-sm text-[#6B5542]">选项 EN（用 | 分隔，可留空）</label>
                <input value={form.options_en} onChange={(e) => setForm({ ...form, options_en: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" />
              </div>
              <div>
                <label className="text-sm text-[#6B5542]">选项 ZH（用 | 分隔，可留空）</label>
                <input value={form.options_zh} onChange={(e) => setForm({ ...form, options_zh: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" />
              </div>
              <div>
                <label className="text-sm text-[#6B5542]">权重（越小越靠前）</label>
                <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 text-[#D4A373]" />
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
