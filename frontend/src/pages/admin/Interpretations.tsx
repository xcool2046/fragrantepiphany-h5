import { useCallback, useEffect, useState } from 'react'
import Section from '../../components/Section'
import SearchBar from '../../components/admin/SearchBar'
import api from '../../api'

type InterpretationItem = {
  id: number
  card_name: string
  category?: string | null
  position: string
  summary_en?: string | null
  summary_zh?: string | null
  interpretation_en?: string | null
  interpretation_zh?: string | null
  action_en?: string | null
  action_zh?: string | null
  future_en?: string | null
  future_zh?: string | null
}

const bgClass = 'bg-gradient-to-br from-[#F7F0E5] via-white to-[#F7F0E5]'

export default function Interpretations() {
  const [interps, setInterps] = useState<InterpretationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingItem, setEditingItem] = useState<InterpretationItem | null>(null)
  const [query, setQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState<'all' | string>('all')
  const [languageFilter, setLanguageFilter] = useState<'all' | 'en' | 'zh'>('all')
  const [formData, setFormData] = useState({
    card_name: '',
    position: 'Past',
    summary_en: '',
    summary_zh: '',
    interpretation_en: '',
    interpretation_zh: '',
    action_en: '',
    action_zh: '',
    future_en: '',
    future_zh: ''
  })
  const [textLang, setTextLang] = useState<'en' | 'zh'>('zh')

  const fetchInterps = useCallback(async (kw = query, position = positionFilter, lang = languageFilter) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const params = new URLSearchParams()
      params.set('page', '1')
      params.set('limit', '500')
      if (kw.trim()) params.set('keyword', kw.trim())
      if (position !== 'all') params.set('position', position)
      if (lang !== 'all') params.set('language', lang)
      const res = await api.get(`/api/interp/list?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setInterps(res.data?.items ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [languageFilter, positionFilter, query])

  useEffect(() => {
    fetchInterps()
  }, [fetchInterps])

  useEffect(() => {
    const t = setTimeout(() => fetchInterps(query, positionFilter, languageFilter), 250)
    return () => clearTimeout(t)
  }, [fetchInterps, query, positionFilter, languageFilter])

  const openCreate = () => {
    setEditingItem(null)
    setFormData({
      card_name: '',
      position: 'Past',
      summary_en: '',
      summary_zh: '',
      interpretation_en: '',
      interpretation_zh: '',
      action_en: '',
      action_zh: '',
      future_en: '',
      future_zh: ''
    })
    setTextLang('zh')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const token = localStorage.getItem('admin_token')
      const payload = { ...formData }
      if (editingItem) {
        await api.post(`/api/interp/update/${editingItem.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        alert('更新成功')
      } else {
        await api.post('/api/interp', payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        alert('创建成功')
      }

      setIsModalOpen(false)
      fetchInterps()
      setFormData({
        card_name: '',
        position: 'Past',
        summary_en: '',
        summary_zh: '',
        interpretation_en: '',
        interpretation_zh: '',
        action_en: '',
        action_zh: '',
        future_en: '',
        future_zh: ''
      })
      setEditingItem(null)
    } catch (err) {
      console.error(err)
      alert(editingItem ? '更新失败' : '创建失败')
    }
    setIsSaving(false)
  }

  const handleDelete = async () => {
    if (!editingItem) return
    if (!window.confirm('确认删除这条解读吗？')) return
    setIsDeleting(true)
    try {
      const token = localStorage.getItem('admin_token')
      await api.post(`/api/interp/delete/${editingItem.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      alert('已删除')
      setIsModalOpen(false)
      setEditingItem(null)
      fetchInterps()
    } catch (err) {
      console.error(err)
      alert('Delete failed')
    }
    setIsDeleting(false)
  }

  return (
    <div className={`space-y-6 ${bgClass} p-1 rounded-3xl shadow-inner`}>
      <Section title="Interpretations" description="卡牌解读库（card + position 唯一）">
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-[#2B1F16] text-[#F3E6D7] rounded-xl hover:scale-105 transition-all shadow-md flex items-center gap-2"
          >
            <span>＋</span> 新增解读
          </button>
          <SearchBar
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="按 card_name / 内容 搜索"
            className="bg-white/80 border border-[#D4A373]/20 rounded-2xl px-2 py-1"
          />
          <div className="flex items-center gap-2 bg-white/80 border border-[#D4A373]/20 rounded-2xl px-3 py-2 shadow-sm">
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20"
            >
              <option value="all">全部位</option>
              <option value="Past">Past</option>
              <option value="Now">Now</option>
              <option value="Future">Future</option>
            </select>
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20"
            >
              <option value="all">中英都看</option>
              <option value="zh">仅中文</option>
              <option value="en">仅英文</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="text-sm text-gray-500">加载中...</div>
          ) : interps.length === 0 ? (
            <div className="text-sm text-gray-500">没有匹配的解读，试试调整筛选或点击 “新增解读”。</div>
          ) : (
            interps.map(item => {
              const badgeClass =
                item.position === 'Now'
                  ? 'bg-amber-50 text-amber-700'
                  : item.position === 'Future'
                    ? 'bg-purple-50 text-purple-700'
                    : 'bg-blue-50 text-blue-700'
              const hasZh = !!(item.summary_zh || item.interpretation_zh)
              const hasEn = !!(item.summary_en || item.interpretation_en)
              const displayText = item.summary_zh || item.summary_en || item.interpretation_zh || item.interpretation_en || '—'
              return (
                <div key={item.id} className="rounded-2xl border border-[#D4A373]/25 bg-white/80 backdrop-blur shadow-sm p-4 flex flex-col gap-2 hover:shadow-lg transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#2B1F16] font-semibold">
                      <span className="text-sm text-[#D4A373]">{item.card_name}</span>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                        {item.position}
                      </span>
                      <span className="text-xs flex gap-1">
                        {hasZh && <span className="px-2 py-0.5 rounded-full bg-[#F7F0E5] text-[#2B1F16]">ZH</span>}
                        {hasEn && <span className="px-2 py-0.5 rounded-full bg-[#F7F0E5] text-[#2B1F16]">EN</span>}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setEditingItem(item)
                        setFormData({
                          card_name: item.card_name,
                          position: item.position,
                          summary_en: item.summary_en || '',
                          summary_zh: item.summary_zh || '',
                          interpretation_en: item.interpretation_en || '',
                          interpretation_zh: item.interpretation_zh || '',
                          action_en: item.action_en || '',
                          action_zh: item.action_zh || '',
                          future_en: item.future_en || '',
                          future_zh: item.future_zh || '',
                        })
                        setIsModalOpen(true)
                        setTextLang(item.summary_zh ? 'zh' : 'en')
                      }}
                      className="text-sm px-3 py-1 rounded-full bg-white border hover:border-[#D4A373] text-[#2B1F16]"
                    >
                      编辑
                    </button>
                  </div>
                  <div className="text-sm text-[#6B5542] leading-relaxed line-clamp-2">{displayText}</div>
                </div>
              )
            })
          )}
        </div>
      </Section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-serif text-[#2B1F16]">{editingItem ? '编辑解读' : '新增解读'}</h3>
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
              <button onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="text-gray-400 hover:text-[#2B1F16]">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#6B5542]">Card Name</label>
                  <input
                    value={formData.card_name}
                    onChange={(e) => setFormData({ ...formData, card_name: e.target.value })}
                    className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-[#6B5542]">Position</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30"
                  >
                    <option value="Past">Past</option>
                    <option value="Now">Now</option>
                    <option value="Future">Future</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {textLang === 'en' ? (
                  <>
                    <div>
                      <label className="text-sm text-[#6B5542]">Summary EN</label>
                      <textarea
                        value={formData.summary_en}
                        onChange={(e) => setFormData({ ...formData, summary_en: e.target.value })}
                        className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#6B5542]">Interpretation EN</label>
                      <textarea
                        value={formData.interpretation_en}
                        onChange={(e) => setFormData({ ...formData, interpretation_en: e.target.value })}
                        className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30"
                        rows={5}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#6B5542]">Action EN</label>
                      <textarea
                        value={formData.action_en}
                        onChange={(e) => setFormData({ ...formData, action_en: e.target.value })}
                        className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30"
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#6B5542]">Future EN</label>
                      <textarea
                        value={formData.future_en}
                        onChange={(e) => setFormData({ ...formData, future_en: e.target.value })}
                        className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30"
                        rows={4}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-sm text-[#6B5542]">摘要 ZH</label>
                      <textarea
                        value={formData.summary_zh}
                        onChange={(e) => setFormData({ ...formData, summary_zh: e.target.value })}
                        className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#6B5542]">解读 ZH</label>
                      <textarea
                        value={formData.interpretation_zh}
                        onChange={(e) => setFormData({ ...formData, interpretation_zh: e.target.value })}
                        className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30"
                        rows={5}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#6B5542]">行动建议 ZH</label>
                      <textarea
                        value={formData.action_zh}
                        onChange={(e) => setFormData({ ...formData, action_zh: e.target.value })}
                        className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30"
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#6B5542]">未来指引 ZH</label>
                      <textarea
                        value={formData.future_zh}
                        onChange={(e) => setFormData({ ...formData, future_zh: e.target.value })}
                        className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30"
                        rows={4}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                {editingItem && (
                  <button type="button" onClick={handleDelete} className="px-4 py-2 rounded-xl border text-red-500" disabled={isDeleting}>
                    {isDeleting ? '删除中...' : '删除'}
                  </button>
                )}
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="px-4 py-2 rounded-xl border text-[#2B1F16]">取消</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-xl bg-[#2B1F16] text-[#F3E6D7] hover:scale-105 transition disabled:opacity-50">
                  {isSaving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
