import { useMemo, useState, useEffect } from 'react'
import axios from 'axios'

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

export default function Interpretations() {
  const [interps, setInterps] = useState<InterpretationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingItem, setEditingItem] = useState<InterpretationItem | null>(null)
  const [query] = useState('')
  const [positionFilter] = useState<'all' | string>('all')
  const [languageFilter] = useState<'all' | 'en' | 'zh'>('all')
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

  const fetchInterps = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const res = await axios.get('/api/interp/list?limit=200', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setInterps(res.data?.items ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInterps()
  }, [])

  const filteredInterps = useMemo(() => {
    const q = query.trim().toLowerCase()
    return interps.filter(item => {
      const summaryMerged = item.summary_zh || item.summary_en || ''
      const interpMerged = item.interpretation_zh || item.interpretation_en || ''
      const matchQuery = q
        ? (item.card_name?.toLowerCase().includes(q) ||
          summaryMerged.toLowerCase().includes(q) ||
          interpMerged.toLowerCase().includes(q))
        : true
      const matchPosition = positionFilter === 'all' ? true : item.position === positionFilter
      const hasZh = !!(item.summary_zh || item.interpretation_zh)
      const hasEn = !!(item.summary_en || item.interpretation_en)
      const matchLanguage =
        languageFilter === 'all'
          ? true
          : languageFilter === 'zh'
          ? hasZh
          : hasEn
      return matchQuery && matchPosition && matchLanguage
    })
  }, [interps, query, positionFilter, languageFilter])

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
        await axios.post(`/api/interp/update/${editingItem.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        alert('更新成功')
      } else {
        await axios.post('/api/interp', payload, {
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
      await axios.post(`/api/interp/delete/${editingItem.id}`, {}, {
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
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-[#2B1F16] text-[#F3E6D7] rounded-lg hover:bg-[#3E2D20] transition shadow-md flex items-center gap-2"
        >
          <span>＋</span> 新增解读
        </button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-sm text-gray-500">加载中...</div>
        ) : filteredInterps.length === 0 ? (
          <div className="text-sm text-gray-500">没有匹配的解读，试试调整筛选或点击 “新增解读”。</div>
        ) : (
          filteredInterps.map(item => {
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
                      const preferLang = item.summary_zh || item.interpretation_zh ? 'zh' : 'en'
                      setTextLang(preferLang)
                      setIsModalOpen(true)
                    }}
                    className="text-sm px-3 py-1 rounded-lg bg-[#D4A373] text-[#2B1F16] hover:brightness-105"
                  >
                    编辑
                  </button>
                </div>
                <div className="text-sm text-[#2B1F16] line-clamp-2">{displayText}</div>
              </div>
            )
          })
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm flex items-center justify-between pb-2 border-b border-[#F1E5D6]">
              <h3 className="text-xl font-serif text-[#2B1F16]">{editingItem ? '编辑解读' : '新增解读'}</h3>
              <button
                onClick={() => { setIsModalOpen(false); setEditingItem(null) }}
                className="h-9 w-9 rounded-full border border-gray-200 text-gray-500 hover:text-[#2B1F16] hover:border-[#2B1F16] bg-white shadow-sm"
                aria-label="关闭"
              >✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">卡名</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D4A373]"
                    value={formData.card_name}
                    onChange={e => setFormData({ ...formData, card_name: e.target.value })}
                    disabled={!!editingItem}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">位置</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D4A373]"
                    value={formData.position}
                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                    disabled={!!editingItem}
                  >
                    <option value="Past">Past</option>
                    <option value="Now">Now</option>
                    <option value="Future">Future</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-[#6B5542]">文本语言</span>
                {(['zh', 'en'] as const).map(lng => (
                  <button
                    key={lng}
                    type="button"
                    onClick={() => setTextLang(lng)}
                    className={`px-3 py-1 rounded-lg border text-sm ${textLang === lng ? 'bg-[#D4A373] text-[#2B1F16] border-[#D4A373]' : 'bg-white text-[#2B1F16] border-gray-200 hover:border-[#D4A373]/60'}`}
                  >
                    {lng.toUpperCase()}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">摘要</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D4A373]"
                  value={textLang === 'zh' ? formData.summary_zh : formData.summary_en}
                  onChange={e => setFormData({ ...formData, [textLang === 'zh' ? 'summary_zh' : 'summary_en']: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">完整解读</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D4A373]"
                  value={textLang === 'zh' ? formData.interpretation_zh : formData.interpretation_en}
                  onChange={e => setFormData({ ...formData, [textLang === 'zh' ? 'interpretation_zh' : 'interpretation_en']: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">行动 / 建议</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D4A373]"
                  value={textLang === 'zh' ? formData.action_zh : formData.action_en}
                  onChange={e => setFormData({ ...formData, [textLang === 'zh' ? 'action_zh' : 'action_en']: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">未来预测</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D4A373]"
                  value={textLang === 'zh' ? formData.future_zh : formData.future_en}
                  onChange={e => setFormData({ ...formData, [textLang === 'zh' ? 'future_zh' : 'future_en']: e.target.value })}
                />
              </div>
              {editingItem && <p className="text-xs text-gray-500">卡名/位置如需调整，请删除后重新创建。</p>}
              <div className="flex gap-3 pt-4">
                {editingItem && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    {isDeleting ? '删除中...' : '删除'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingItem(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-[#2B1F16] text-[#F3E6D7] rounded-lg hover:bg-[#3E2D20] disabled:opacity-60"
                >
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
