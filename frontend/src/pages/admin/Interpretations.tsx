import { useCallback, useEffect, useState } from 'react'
import Section from '../../components/Section'
import SearchBar from '../../components/admin/SearchBar'
import api from '../../api'
import { API_ENDPOINTS } from '../../config/api'
import { TAROT_CATEGORIES, TAROT_POSITIONS, DEFAULT_PAGE_SIZE } from '../../constants/tarot'

type InterpretationItem = {
  id: number
  card_name: string
  category?: string | null
  position: string
  sentence_en?: string | null
  sentence_zh?: string | null
  interpretation_en?: string | null
  interpretation_zh?: string | null
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
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [inputPage, setInputPage] = useState('1')
  const pageSize = DEFAULT_PAGE_SIZE
  const [formData, setFormData] = useState<{
    card_name: string
    category: string
    position: string
    sentence_en: string
    sentence_zh: string
    interpretation_en: string
    interpretation_zh: string
  }>({
    card_name: '',
    category: TAROT_CATEGORIES[0],
    position: TAROT_POSITIONS[0],
    sentence_en: '',
    sentence_zh: '',
    interpretation_en: '',
    interpretation_zh: '',
  })
  const [textLang, setTextLang] = useState<'en' | 'zh'>('zh')

  const fetchInterps = useCallback(async (p = 1, kw = query, position = positionFilter, category = categoryFilter) => {
    setLoading(true)
    try {

      const params = new URLSearchParams()
      params.set('page', String(p))
      params.set('limit', String(pageSize))
      if (kw.trim()) params.set('keyword', kw.trim())
      if (position !== 'all') params.set('position', position)
      if (category !== 'all') params.set('category', category)
      const res = await api.get(`${API_ENDPOINTS.INTERP_ADMIN.LIST}?${params.toString()}`)
      setInterps(res.data?.items ?? [])
      setTotal(res.data?.total ?? 0)
      setPage(p)
      setInputPage(String(p))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [positionFilter, categoryFilter, query])

  useEffect(() => {
    fetchInterps()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => fetchInterps(1, query, positionFilter, categoryFilter), 250)
    return () => clearTimeout(t)
  }, [fetchInterps, query, positionFilter, categoryFilter])

  const openCreate = () => {
    setEditingItem(null)
    setFormData({
      card_name: '',
      category: TAROT_CATEGORIES[0],
      position: TAROT_POSITIONS[0],
      sentence_en: '',
      sentence_zh: '',
      interpretation_en: '',
      interpretation_zh: '',
    })
    setTextLang('zh')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {

      const payload = { ...formData }
      if (editingItem) {
        await api.post(`${API_ENDPOINTS.INTERP_ADMIN.UPDATE}/${editingItem.id}`, payload)
        alert('更新成功')
      } else {
        await api.post(API_ENDPOINTS.INTERP_ADMIN.CREATE, payload)
        alert('创建成功')
      }

      setIsModalOpen(false)
      setIsModalOpen(false)
      fetchInterps(page)
      setFormData({
        card_name: '',
        category: TAROT_CATEGORIES[0],
        position: TAROT_POSITIONS[0],
        sentence_en: '',
        sentence_zh: '',
        interpretation_en: '',
        interpretation_zh: '',
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
      await api.post(`${API_ENDPOINTS.INTERP_ADMIN.DELETE}/${editingItem.id}`, {})
      alert('已删除')
      setIsModalOpen(false)
      setEditingItem(null)
      setEditingItem(null)
      fetchInterps(page)
    } catch (err) {
      console.error(err)
      alert('Delete failed')
    }
    setIsDeleting(false)
  }

  return (
    <div className={`space-y-6 ${bgClass} p-1 rounded-3xl shadow-inner`}>
      <Section title="Interpretations" description="卡牌解读库">
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
            placeholder="按 card_name 搜索"
            className="bg-white/80 border border-[#D4A373]/20 rounded-2xl px-2 py-1"
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2 items-center">
            <div className="relative">
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20"
              >
                <option value="all">全部位</option>
                {TAROT_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20"
              >
                <option value="all">全类别</option>
                {TAROT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {/* Language Toggle */}
            <div className="flex items-center gap-1 bg-[#F7F0E5] rounded-lg p-1 ml-2">
                <button
                  onClick={() => setTextLang('zh')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${textLang === 'zh' ? 'bg-white text-[#2B1F16] shadow-sm' : 'text-[#6B5542] hover:bg-white/50'}`}
                >
                  ZH
                </button>
                <button
                  onClick={() => setTextLang('en')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${textLang === 'en' ? 'bg-white text-[#2B1F16] shadow-sm' : 'text-[#6B5542] hover:bg-white/50'}`}
                >
                  EN
                </button>
            </div>
          </div>
          <span className="text-xs text-[#6B5542]">共 {total} 条</span>
        </div>



        <div className="grid gap-4">
          {loading ? (
            <div className="text-sm text-gray-500">加载中...</div>
          ) : interps.length === 0 ? (
            <div className="text-sm text-gray-500">没有匹配的解读，试试调整筛选或点击 “新增解读”。</div>
          ) : (
            interps.map(item => {
              const badgeClass =
                item.position === 'Present'
                  ? 'bg-amber-50 text-amber-700'
                  : item.position === 'Future'
                    ? 'bg-purple-50 text-purple-700'
                    : 'bg-blue-50 text-blue-700'
              const hasZh = !!(item.sentence_zh || item.interpretation_zh)
              const hasEn = !!(item.sentence_en || item.interpretation_en)
              
              let displayText = ''
              if (textLang === 'zh') {
                 displayText = item.sentence_zh || item.interpretation_zh || '—'
              } else {
                 displayText = item.sentence_en || item.interpretation_en || '—'
              }

              return (
                <div key={item.id} className="rounded-2xl border border-[#D4A373]/25 bg-white/80 backdrop-blur shadow-sm p-4 flex flex-col gap-2 hover:shadow-lg transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#2B1F16] font-semibold">
                      <span className="text-sm text-[#D4A373]">{item.card_name}</span>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                        {item.position}
                      </span>
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {item.category || 'Self'}
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
                          category: item.category || TAROT_CATEGORIES[0],
                          position: item.position,
                          sentence_en: item.sentence_en || '',
                          sentence_zh: item.sentence_zh || '',
                          interpretation_en: item.interpretation_en || '',
                          interpretation_zh: item.interpretation_zh || '',
                        })
                        setIsModalOpen(true)
                        setTextLang(item.sentence_zh ? 'zh' : 'en')
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
        
        {total > pageSize && (
          <div className="flex gap-2 mt-4 items-center justify-center">
            <button
              disabled={page === 1}
              onClick={() => fetchInterps(page - 1)}
              className="px-3 py-1 rounded border bg-white disabled:opacity-50 hover:bg-gray-50"
            >
              上一页
            </button>
            <div className="flex items-center gap-2 mx-2">
              <span className="text-sm text-gray-600">第</span>
              <input
                type="number"
                min={1}
                max={Math.ceil(total / pageSize)}
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const p = Math.max(1, Math.min(Number(inputPage) || 1, Math.ceil(total / pageSize)))
                    fetchInterps(p)
                  }
                }}
                onBlur={() => {
                  const p = Math.max(1, Math.min(Number(inputPage) || 1, Math.ceil(total / pageSize)))
                  if (p !== page) fetchInterps(p)
                  else setInputPage(String(p))
                }}
                className="w-16 text-center rounded border border-gray-300 py-1 focus:border-[#D4A373] focus:ring-[#D4A373]/30"
              />
              <span className="text-sm text-gray-600">/ {Math.ceil(total / pageSize)} 页</span>
            </div>
            <button
              disabled={page * pageSize >= total}
              onClick={() => fetchInterps(page + 1)}
              className="px-3 py-1 rounded border bg-white disabled:opacity-50 hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        )}
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
                    className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30 disabled:bg-gray-100 disabled:text-gray-500"
                    required
                    disabled={!!editingItem}
                  />
                </div>
                <div>
                  <label className="text-sm text-[#6B5542]">Position</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30 disabled:bg-gray-100 disabled:text-gray-500"
                    disabled={!!editingItem}
                  >
                    {TAROT_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-[#6B5542]">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30 disabled:bg-gray-100 disabled:text-gray-500"
                    disabled={!!editingItem}
                  >
                    {TAROT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {textLang === 'en' ? (
                  <>
                    {formData.position === 'Present' && (
                      <div>
                        <label className="text-sm text-[#6B5542]">Sentence EN (Perfume Page Quote)</label>
                        <textarea
                          value={formData.sentence_en}
                          onChange={(e) => setFormData({ ...formData, sentence_en: e.target.value })}
                          className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30"
                          rows={2}
                        />
                      </div>
                    )}
                    <div>
                      <label className="text-sm text-[#6B5542]">Interpretation EN</label>
                      <textarea
                        value={formData.interpretation_en}
                        onChange={(e) => setFormData({ ...formData, interpretation_en: e.target.value })}
                        className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30"
                        rows={5}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {formData.position === 'Present' && (
                      <div>
                        <label className="text-sm text-[#6B5542]">Sentence ZH (Perfume Page Quote)</label>
                        <textarea
                          value={formData.sentence_zh}
                          onChange={(e) => setFormData({ ...formData, sentence_zh: e.target.value })}
                          className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30"
                          rows={2}
                        />
                      </div>
                    )}
                    <div>
                      <label className="text-sm text-[#6B5542]">解读 ZH</label>
                      <textarea
                        value={formData.interpretation_zh}
                        onChange={(e) => setFormData({ ...formData, interpretation_zh: e.target.value })}
                        className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30"
                        rows={5}
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
