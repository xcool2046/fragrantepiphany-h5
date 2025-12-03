import { useCallback, useEffect, useState } from 'react'
import Section from '../../components/Section'
import api from '../../api'
import { Reorder } from 'framer-motion'

type Question = {
  id: number
  title_en: string
  title_zh?: string | null
  options_en?: string[] | null
  options_zh?: string[] | null
  active: boolean
  weight: number
}

// Internal type for draggable items to ensure unique keys
type DraggableOption = {
  id: string
  text: string
}

const bgClass = 'bg-gradient-to-br from-[#F7F0E5] via-white to-[#F7F0E5]'

// Helper to generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9)

// Helper to ensure array has exactly 4 items and convert to DraggableOption
const toDraggable = (arr?: string[] | null): DraggableOption[] => {
  const newArr = arr ? [...arr] : []
  while (newArr.length < 4) {
    newArr.push('')
  }
  return newArr.slice(0, 4).map(text => ({ id: generateId(), text }))
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']

export default function Questions() {
  const [items, setItems] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<Question | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  
  // Form state
  const [form, setForm] = useState<{
    title_en: string
    title_zh: string
    options_en: DraggableOption[]
    options_zh: DraggableOption[]
    active: boolean
    weight: number
  }>({ 
    title_en: '', 
    title_zh: '', 
    options_en: [], 
    options_zh: [], 
    active: true, 
    weight: 0 
  })

  const [textLang, setTextLang] = useState<'zh' | 'en'>('zh')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/admin/questions')
      setItems(res.data.items || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const openCreate = () => {
    setEditing(null)
    setForm({ 
      title_en: '', 
      title_zh: '', 
      options_en: toDraggable([]), 
      options_zh: toDraggable([]), 
      active: true, 
      weight: items.length * 10 
    })
    setTextLang('zh')
    setModalOpen(true)
  }

  const openEdit = (q: Question) => {
    setEditing(q)
    setForm({
      title_en: q.title_en,
      title_zh: q.title_zh || '',
      options_en: toDraggable(q.options_en),
      options_zh: toDraggable(q.options_zh),
      active: q.active,
      weight: q.weight,
    })
    setTextLang('zh')
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
      // Map back to string array and filter
      options_en: form.options_en.map(o => o.text.trim()).filter(Boolean),
      options_zh: form.options_zh.map(o => o.text.trim()).filter(Boolean),
      active: form.active,
      weight: Number(form.weight) || 0,
    }
    try {
      if (editing) {
        await api.patch(`/api/admin/questions/${editing.id}`, payload)
      } else {
        await api.post('/api/admin/questions', payload)
      }
      setModalOpen(false)
      fetchData()
    } catch (e) {
      console.error(e)
      alert('保存失败')
    }
  }

  const toggleActive = async (q: Question) => {
    await api.patch(`/api/admin/questions/${q.id}`, { active: !q.active })
    fetchData()
  }

  const adjustWeight = async (q: Question, direction: 'up' | 'down') => {
    const index = items.findIndex(item => item.id === q.id)
    if (index === -1) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.length) return

    const targetItem = items[targetIndex]
    
    let newWeightQ = targetItem.weight
    let newWeightTarget = q.weight

    if (newWeightQ === newWeightTarget) {
        if (direction === 'up') {
            newWeightQ -= 1
            newWeightTarget += 1
        } else {
            newWeightQ += 1
            newWeightTarget -= 1
        }
    }

    try {
        await Promise.all([
            api.patch(`/api/admin/questions/${q.id}`, { weight: newWeightQ }),
            api.patch(`/api/admin/questions/${targetItem.id}`, { weight: newWeightTarget })
        ])
        fetchData()
    } catch (e) {
        console.error("Failed to swap weights", e)
        alert("排序调整失败")
    }
  }

  const remove = async (q: Question) => {
    if (!window.confirm('确认删除该问题？')) return
    await api.delete(`/api/admin/questions/${q.id}`)
    fetchData()
  }

  const updateOptionText = (lang: 'zh' | 'en', index: number, value: string) => {
    if (lang === 'zh') {
      const newOptions = [...form.options_zh]
      newOptions[index] = { ...newOptions[index], text: value }
      setForm({ ...form, options_zh: newOptions })
    } else {
      const newOptions = [...form.options_en]
      newOptions[index] = { ...newOptions[index], text: value }
      setForm({ ...form, options_en: newOptions })
    }
  }

  const setOptions = (lang: 'zh' | 'en', newOptions: DraggableOption[]) => {
    if (lang === 'zh') {
      setForm({ ...form, options_zh: newOptions })
    } else {
      setForm({ ...form, options_en: newOptions })
    }
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
                <button onClick={() => adjustWeight(q, 'up')} disabled={index === 0} className="px-3 py-1 rounded-lg bg-white border text-sm text-[#2B1F16] hover:border-[#D4A373] disabled:opacity-50">上移</button>
                <button onClick={() => adjustWeight(q, 'down')} disabled={index === items.length - 1} className="px-3 py-1 rounded-lg bg-white border text-sm text-[#2B1F16] hover:border-[#D4A373] disabled:opacity-50">下移</button>
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
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-serif text-[#2B1F16]">{editing ? '编辑问题' : '新增问题'}</h3>
                <div className="flex items-center gap-2 bg-[#F7F0E5] rounded-full px-3 py-1 text-sm text-[#6B5542]">
                  <button
                    className={`px-2 py-0.5 rounded-full ${textLang === 'zh' ? 'bg-white shadow-sm text-[#2B1F16]' : ''}`}
                    onClick={() => setTextLang('zh')}
                  >ZH</button>
                  <button
                    className={`px-2 py-0.5 rounded-full ${textLang === 'en' ? 'bg-white shadow-sm text-[#2B1F16]' : ''}`}
                    onClick={() => setTextLang('en')}
                  >EN</button>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-[#2B1F16]">✕</button>
            </div>

            <div className="grid gap-4">
              {/* Title */}
              <div>
                <label className="text-sm text-[#6B5542] mb-1 block">
                  {textLang === 'zh' ? '标题 (ZH)' : 'Title (EN)'}
                </label>
                {textLang === 'zh' ? (
                  <input 
                    value={form.title_zh} 
                    onChange={(e) => setForm({ ...form, title_zh: e.target.value })} 
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" 
                  />
                ) : (
                  <input 
                    value={form.title_en} 
                    onChange={(e) => setForm({ ...form, title_en: e.target.value })} 
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" 
                  />
                )}
              </div>

              {/* Options */}
              <div>
                <label className="text-sm text-[#6B5542] mb-1 block">
                  {textLang === 'zh' ? '选项 (ZH) - 拖拽调整顺序' : 'Options (EN) - Drag to reorder'}
                </label>
                <Reorder.Group 
                  axis="y" 
                  values={textLang === 'zh' ? form.options_zh : form.options_en} 
                  onReorder={(newOrder) => setOptions(textLang, newOrder)} 
                  className="space-y-2"
                >
                  {(textLang === 'zh' ? form.options_zh : form.options_en).map((opt, index) => (
                    <Reorder.Item key={opt.id} value={opt} className="flex items-center gap-3">
                      {/* Drag Handle */}
                      <div className="cursor-grab text-gray-400 hover:text-[#D4A373] active:cursor-grabbing">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="8" y1="6" x2="21" y2="6"></line>
                          <line x1="8" y1="12" x2="21" y2="12"></line>
                          <line x1="8" y1="18" x2="21" y2="18"></line>
                          <line x1="3" y1="6" x2="3.01" y2="6"></line>
                          <line x1="3" y1="12" x2="3.01" y2="12"></line>
                          <line x1="3" y1="18" x2="3.01" y2="18"></line>
                        </svg>
                      </div>
                      
                      {/* Fixed Label A/B/C/D */}
                      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#F7F0E5] text-[#6B5542] text-xs font-bold shrink-0">
                        {OPTION_LABELS[index] || '?'}
                      </div>

                      {/* Input */}
                      <input 
                        value={opt.text} 
                        onChange={(e) => updateOptionText(textLang, index, e.target.value)} 
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30 text-sm"
                        placeholder={`Option ${OPTION_LABELS[index]}`}
                      />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>

              {/* Shared Settings */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-2">
                <div>
                  <label className="text-sm text-[#6B5542]">权重</label>
                  <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 text-[#D4A373]" />
                  <span className="text-sm text-[#2B1F16]">启用</span>
                </div>
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
