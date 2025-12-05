import { useCallback, useEffect, useState } from 'react'
import Section from '../../components/Section'
import SearchBar from '../../components/admin/SearchBar'
import api from '../../api'
import { API_ENDPOINTS } from '../../config/api'
import { SCENE_OPTIONS } from '../../config/perfume-constants'
import { Reorder } from 'framer-motion'

type Perfume = {
  id: number
  card_id: number
  scene_choice: string
  scene_choice_en?: string | null
  brand_name: string
  product_name: string
  product_name_en?: string | null
  brand_name_en?: string | null
  tags?: string[] | null
  tags_en?: string[] | null
  description?: string | null
  description_en?: string | null
  image_url?: string | null
  sort_order: number
  status: string
}

const bgClass = 'bg-gradient-to-br from-[#F7F0E5] via-white to-[#F7F0E5]'

export default function Perfumes() {
  const [items, setItems] = useState<Perfume[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Perfume | null>(null)
  const [query, setQuery] = useState('')
  const [sceneFilter, setSceneFilter] = useState('all')
  const [cardIdFilter, setCardIdFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [inputPage, setInputPage] = useState('1')
  const pageSize = 10

  const [form, setForm] = useState<Partial<Perfume>>({})
  // Tags state: array of strings
  const [tagsList, setTagsList] = useState<string[]>([])
  const [tagsEnList, setTagsEnList] = useState<string[]>([])
  // Language toggle state
  const [textLang, setTextLang] = useState<'zh' | 'en'>('zh')

  // Store all cards for lookup
  const [cards, setCards] = useState<any[]>([])

  // Fetch cards for lookup
  const fetchCards = useCallback(async () => {
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN.CARDS + '?pageSize=1000')
      setCards(res.data.items || [])
    } catch (e) {
      console.error('Failed to fetch cards', e)
    }
  }, [])

  const fetchData = useCallback(async (p = 1, kw = query, sc = sceneFilter) => {
    setLoading(true)
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN.PERFUMES, {
        params: { page: p, pageSize, keyword: kw, scene: sc, cardId: cardIdFilter }
      })
      setItems(res.data.items || [])
      setTotal(res.data.total || 0)
      setPage(p)
      setInputPage(String(p))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [query, sceneFilter, cardIdFilter])

  useEffect(() => {
    fetchData()
    fetchCards()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => fetchData(1, query, sceneFilter), 300)
    return () => clearTimeout(t)
  }, [query, sceneFilter, cardIdFilter])

  // Auto-update card name when card_id changes
  useEffect(() => {
    if (modalOpen && form.card_id) {
      const card = cards.find(c => c.id === form.card_id)
      if (card) {
        setForm(prev => ({ ...prev, card_name: card.name_en }))
      } else {
        setForm(prev => ({ ...prev, card_name: '无效卡牌 ID' }))
      }
    }
  }, [form.card_id, cards, modalOpen])

  const openCreate = () => {
    setEditing(null)
    setForm({
      card_id: 1,
      scene_choice: '',
      brand_name: '',
      product_name: '',
      status: 'active',
      sort_order: 0,
      tags: []
    })
    // Initialize with 3 empty tags
    setTagsList(['', '', ''])
    setTagsEnList(['', '', ''])
    setTextLang('zh')
    setModalOpen(true)
  }

  const openEdit = (item: Perfume) => {
    setEditing(item)
    setForm({ ...item })
    
    // Initialize tags: ensure at least 3 items
    const currentTags = item.tags ? [...item.tags] : []
    while (currentTags.length < 3) {
      currentTags.push('')
    }
    setTagsList(currentTags)

    const currentTagsEn = item.tags_en ? [...item.tags_en] : []
    while (currentTagsEn.length < 3) {
      currentTagsEn.push('')
    }
    setTagsEnList(currentTagsEn)
    
    setTextLang('zh')
    setModalOpen(true)
  }

  const save = async () => {
    if (!form.card_id || !form.brand_name || !form.product_name) {
      alert('卡牌ID、品牌和产品名称必填')
      return
    }

    // Validate Card ID
    const cardExists = cards.find(c => c.id === form.card_id)
    if (!cardExists) {
      alert('无效的卡牌 ID，请输入正确的 ID。')
      return
    }

    // Process tags: filter out empty strings
    const processedTags = tagsList.map(t => t.trim()).filter(Boolean)
    const processedTagsEn = tagsEnList.map(t => t.trim()).filter(Boolean)
    const payload = { ...form, tags: processedTags, tags_en: processedTagsEn }

    try {
      if (editing) {
        await api.patch(`${API_ENDPOINTS.ADMIN.PERFUMES}/${editing.id}`, payload)
      } else {
        await api.post(API_ENDPOINTS.ADMIN.PERFUMES, payload)
      }
      setModalOpen(false)
      fetchData(page)
    } catch (e: any) {
      console.error(e)
      const msg = e.response?.data?.message 
        ? (Array.isArray(e.response.data.message) ? e.response.data.message.join(', ') : e.response.data.message)
        : e.message || '保存失败'
      alert(`错误: ${msg}`)
    }
  }

  const remove = async (id: number) => {
    if (!window.confirm('确认删除吗？')) return
    try {
      await api.delete(`${API_ENDPOINTS.ADMIN.PERFUMES}/${id}`)
      fetchData(page)
    } catch (e) {
      console.error(e)
      alert('删除失败')
    }
  }

  const toggleStatus = async (item: Perfume) => {
    try {
      const newStatus = item.status === 'active' ? 'inactive' : 'active'
      await api.patch(`${API_ENDPOINTS.ADMIN.PERFUMES}/${item.id}`, { status: newStatus })
      fetchData(page)
    } catch (e) {
      console.error(e)
      alert('更新状态失败')
    }
  }

  const updateTag = (index: number, value: string) => {
    const newTags = [...tagsList]
    newTags[index] = value
    setTagsList(newTags)
  }

  const updateTagEn = (index: number, value: string) => {
    const newTags = [...tagsEnList]
    newTags[index] = value
    setTagsEnList(newTags)
  }

  return (
    <div className={`space-y-6 ${bgClass} p-1 rounded-3xl shadow-inner`}>
      <Section title="Perfumes" description="管理香水推荐配置">
        <div className="flex flex-wrap gap-3 items-center">
          <button onClick={openCreate} className="px-4 py-2 bg-[#2B1F16] text-[#F3E6D7] rounded-xl hover:scale-105 transition-all shadow-md">
            + 新增香水
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 items-center bg-white/70 border border-[#D4A373]/20 rounded-2xl px-4 py-3 shadow-sm">
          <SearchBar value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索品牌、产品..." />
          
          <select
            value={sceneFilter}
            onChange={(e) => setSceneFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20"
          >
            <option value="all">全场景</option>
            {SCENE_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.label}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={cardIdFilter}
            onChange={(e) => setCardIdFilter(e.target.value)}
            placeholder="卡牌ID"
            className="w-24 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20"
          />

          <span className="text-xs text-[#6B5542]">
            共 {total} 条
          </span>
        </div>

        <div className={`mt-4 grid gap-4 transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-[#D4A373]/30 bg-white/70 backdrop-blur shadow-sm p-4 hover:shadow-lg transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-[#2B1F16]">{item.brand_name} - {item.product_name}</span>
                  <span className="text-xs text-gray-500">({item.brand_name_en} - {item.product_name_en})</span>
                  {item.status !== 'active' && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">禁用</span>}
                </div>
                <div className="text-sm text-[#6B5542] flex gap-4 flex-wrap items-center">
                  <span>卡牌: {item.card_id}</span>
                  <span>场景: {item.scene_choice}</span>

                  {item.tags && item.tags.length > 0 && (
                    <span className="text-xs bg-gray-100 px-1 rounded text-gray-500">标签: {item.tags.join(', ')}</span>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => toggleStatus(item)} className="px-3 py-1 rounded-lg bg-white border text-sm text-[#2B1F16] hover:border-[#D4A373]">{item.status === 'active' ? '禁用' : '启用'}</button>
                  <button onClick={() => openEdit(item)} className="px-3 py-1 rounded-lg bg-[#D4A373] text-[#2B1F16] text-sm hover:brightness-105">编辑</button>
                  <button onClick={() => remove(item.id)} className="px-3 py-1 rounded-lg bg-white border text-sm text-red-500 hover:border-red-400">删除</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Advanced Pagination */}
        {total > pageSize && (
          <div className="flex gap-2 mt-6 items-center justify-center">
            <button
              disabled={page === 1}
              onClick={() => fetchData(page - 1)}
              className="px-3 py-1 rounded border bg-white disabled:opacity-50 hover:bg-gray-50"
            >
              上一页
            </button>
            <div className="flex items-center gap-2 mx-2">
              <span className="text-sm text-gray-600">页码</span>
              <input
                type="number"
                min={1}
                max={Math.ceil(total / pageSize)}
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const p = Math.max(1, Math.min(Number(inputPage) || 1, Math.ceil(total / pageSize)))
                    fetchData(p)
                  }
                }}
                onBlur={() => {
                  const p = Math.max(1, Math.min(Number(inputPage) || 1, Math.ceil(total / pageSize)))
                  if (p !== page) fetchData(p)
                  else setInputPage(String(p))
                }}
                className="w-16 text-center rounded border border-gray-300 py-1 focus:border-[#D4A373] focus:ring-[#D4A373]/30"
              />
              <span className="text-sm text-gray-600">/ {Math.ceil(total / pageSize)}</span>
            </div>
            <button
              disabled={page * pageSize >= total}
              onClick={() => fetchData(page + 1)}
              className="px-3 py-1 rounded border bg-white disabled:opacity-50 hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        )}
      </Section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-3">
                  <h3 className="text-xl font-serif text-[#2B1F16]">{editing ? '编辑香水' : '新增香水'}</h3>
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
            
            <div className="grid md:grid-cols-2 gap-4">
               {/* Basic Info (Shared) */}
               <div className="space-y-3">
                  <div className="flex gap-4">
                    <div className="w-1/3">
                      <label className="text-xs text-[#6B5542]">卡牌 ID</label>
                      <input 
                        type="number" 
                        value={form.card_id} 
                        onChange={e => setForm({...form, card_id: Number(e.target.value)})} 
                        className="w-full rounded-lg border p-2 text-sm" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-[#6B5542]">卡牌名称</label>
                      <input 
                        value={cards.find(c => c.id === form.card_id)?.name_en || '无效卡牌 ID'} 
                        readOnly
                        className={`w-full rounded-lg border p-2 text-sm ${!cards.find(c => c.id === form.card_id) ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'} cursor-not-allowed`} 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[#6B5542] mb-1 block">标签 ({textLang === 'zh' ? 'ZH' : 'EN'}) (拖拽排序)</label>
                    {textLang === 'zh' ? (
                      <Reorder.Group axis="y" values={tagsList} onReorder={setTagsList} className="space-y-2">
                        {tagsList.map((tag, index) => (
                          <Reorder.Item key={tag} value={tag} className="flex items-center gap-2">
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
                            <input 
                              value={tag} 
                              onChange={e => updateTag(index, e.target.value)} 
                              placeholder={`标签 (ZH) ${index + 1}`} 
                              className="flex-1 rounded-lg border p-2 text-sm" 
                            />
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    ) : (
                      <Reorder.Group axis="y" values={tagsEnList} onReorder={setTagsEnList} className="space-y-2">
                        {tagsEnList.map((tag, index) => (
                          <Reorder.Item key={tag} value={tag} className="flex items-center gap-2">
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
                            <input 
                              value={tag} 
                              onChange={e => updateTagEn(index, e.target.value)} 
                              placeholder={`Tag (EN) ${index + 1}`} 
                              className="flex-1 rounded-lg border p-2 text-sm" 
                            />
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    )}
                  </div>
               </div>

               {/* Product Info (Localized) */}
               <div className="space-y-3">
                  {textLang === 'zh' ? (
                    <>
                      <div>
                        <label className="text-xs text-[#6B5542]">场景选择 (ZH)</label>
                        <input value={form.scene_choice || ''} onChange={e => setForm({...form, scene_choice: e.target.value})} className="w-full rounded-lg border p-2 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-[#6B5542]">品牌 (ZH)</label>
                        <input value={form.brand_name || ''} onChange={e => setForm({...form, brand_name: e.target.value})} className="w-full rounded-lg border p-2 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-[#6B5542]">产品名称 (ZH)</label>
                        <input value={form.product_name || ''} onChange={e => setForm({...form, product_name: e.target.value})} className="w-full rounded-lg border p-2 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-[#6B5542]">描述文案 (ZH)</label>
                        <textarea value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} className="w-full rounded-lg border p-2 text-sm" rows={5} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-xs text-[#6B5542]">场景选择 (EN)</label>
                        <input value={form.scene_choice_en || ''} onChange={e => setForm({...form, scene_choice_en: e.target.value})} className="w-full rounded-lg border p-2 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-[#6B5542]">品牌 (EN)</label>
                        <input value={form.brand_name_en || ''} onChange={e => setForm({...form, brand_name_en: e.target.value})} className="w-full rounded-lg border p-2 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-[#6B5542]">产品名称 (EN)</label>
                        <input value={form.product_name_en || ''} onChange={e => setForm({...form, product_name_en: e.target.value})} className="w-full rounded-lg border p-2 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-[#6B5542]">描述文案 (EN)</label>
                        <textarea value={form.description_en || ''} onChange={e => setForm({...form, description_en: e.target.value})} className="w-full rounded-lg border p-2 text-sm" rows={5} />
                      </div>
                    </>
                  )}
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border text-[#2B1F16]">取消</button>
              <button onClick={save} className="px-4 py-2 rounded-xl bg-[#2B1F16] text-[#F3E6D7] hover:scale-105 transition">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
