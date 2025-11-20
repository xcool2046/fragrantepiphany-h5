import { useMemo, useState, useEffect } from 'react'
import axios from 'axios'

type InterpretationItem = {
  id: string
  card_name: string
  position: 'past' | 'present' | 'future'
  language: string
  summary?: string
  interpretation?: string
  action?: string
  future?: string
}

export default function Interpretations() {
  const [interps, setInterps] = useState<InterpretationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingItem, setEditingItem] = useState<InterpretationItem | null>(null)
  const [query, setQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState<'all' | InterpretationItem['position']>('all')
  const [languageFilter, setLanguageFilter] = useState<'all' | 'en' | 'zh'>('all')
  const [formData, setFormData] = useState({
    card_name: '',
    position: 'past',
    language: 'en',
    summary: '',
    interpretation: '',
    action: '',
    future: ''
  })

  const fetchInterps = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const res = await axios.get('/api/interp/list?limit=100', {
        headers: { Authorization: `Bearer ${token}` }
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

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const token = localStorage.getItem('admin_token')
      await axios.post('/api/interp/import', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      alert('Import successful')
      fetchInterps()
    } catch (err) {
      console.error(err)
      alert('Import failed')
    }
  }

  const filteredInterps = useMemo(() => {
    const q = query.trim().toLowerCase()
    return interps.filter(item => {
      const matchQuery = q
        ? (item.card_name?.toLowerCase().includes(q) || item.summary?.toLowerCase().includes(q) || item.interpretation?.toLowerCase().includes(q))
        : true
      const matchPosition = positionFilter === 'all' ? true : item.position === positionFilter
      const matchLanguage = languageFilter === 'all' ? true : item.language.toLowerCase() === languageFilter
      return matchQuery && matchPosition && matchLanguage
    })
  }, [interps, query, positionFilter, languageFilter])

  const openCreate = () => {
    setEditingItem(null)
    setFormData({
      card_name: '',
      position: 'past',
      language: 'en',
      summary: '',
      interpretation: '',
      action: '',
      future: ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const token = localStorage.getItem('admin_token')
      if (editingItem) {
        await axios.post(`/api/interp/update/${editingItem.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        alert('Updated successfully')
      } else {
        await axios.post('/api/interp', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        alert('Created successfully')
      }

      setIsModalOpen(false)
      fetchInterps()
      setFormData({
        card_name: '',
        position: 'past',
        language: 'en',
        summary: '',
        interpretation: '',
        action: '',
        future: ''
      })
      setEditingItem(null)
    } catch (err) {
      console.error(err)
      alert(editingItem ? 'Update failed' : 'Creation failed')
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
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Deleted successfully')
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
        <label className="px-4 py-2 bg-white border border-[#D4A373] text-[#D4A373] rounded-lg cursor-pointer hover:bg-[#D4A373]/5 transition shadow-sm">
          <span className="flex items-center gap-2 text-sm font-medium">
            <span>📥</span> Import JSON/CSV
          </span>
          <input type="file" accept=".json,.csv,.xlsx" onChange={handleImport} className="hidden" />
        </label>
        <button 
          onClick={openCreate}
          className="px-4 py-2 bg-[#2B1F16] text-[#F3E6D7] rounded-lg hover:bg-[#3E2D20] transition shadow-md flex items-center gap-2"
        >
          <span>＋</span> Create New
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索卡名 / 关键词"
              className="pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20 text-sm w-64"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          <select
            value={positionFilter}
            onChange={e => setPositionFilter(e.target.value as typeof positionFilter)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20"
          >
            <option value="all">Position: All</option>
            <option value="past">Past</option>
            <option value="present">Now</option>
            <option value="future">Future</option>
          </select>
          <select
            value={languageFilter}
            onChange={e => setLanguageFilter(e.target.value as typeof languageFilter)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20"
          >
            <option value="all">Language: All</option>
            <option value="en">EN</option>
            <option value="zh">ZH</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
          <table className="min-w-full text-sm text-left table-auto">
            <thead className="bg-[#F9F5F1] text-[#6B5542] font-serif uppercase tracking-wider text-xs">
              <tr>
                <th className="px-3 py-2 w-24">Actions</th>
                <th className="px-3 py-2 w-40">Card Name</th>
                <th className="px-3 py-2 w-28">Position</th>
                <th className="px-3 py-2 w-24">Lang</th>
                <th className="px-3 py-2">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : filteredInterps.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">没有匹配的解读，试试调整筛选或点击 “Create New”。</td></tr>
              ) : filteredInterps.map((item) => {
                const positionColor = item.position === 'past'
                  ? 'bg-blue-50 text-blue-700'
                  : item.position === 'present'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-purple-50 text-purple-700'
                return (
                  <tr key={item.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-3 py-2 align-top">
                      <button
                        onClick={() => {
                          setEditingItem(item)
                          setFormData({
                            card_name: item.card_name,
                            position: item.position,
                            language: item.language,
                            summary: item.summary || '',
                            interpretation: item.interpretation || '',
                            action: item.action || '',
                            future: item.future || ''
                          })
                          setIsModalOpen(true)
                        }}
                        className="text-[#D4A373] hover:text-[#2B1F16] font-medium text-sm"
                      >
                        Edit
                      </button>
                    </td>
                    <td className="px-3 py-2 font-medium text-[#2B1F16] align-top">{item.card_name}</td>
                    <td className="px-3 py-2 align-top">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${positionColor}`}>
                        {item.position === 'present' ? 'Now' : item.position.charAt(0).toUpperCase() + item.position.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-top uppercase text-xs font-bold text-gray-600">{item.language}</td>
                    <td className="px-3 py-2 text-gray-700 align-top">
                      <div className="line-clamp-1 leading-snug text-sm">{item.summary || item.interpretation || '—'}</div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 m-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-serif text-[#2B1F16] mb-6">{editingItem ? 'Edit Interpretation' : 'Add Interpretation'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Card Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D4A373]"
                    value={formData.card_name}
                    onChange={e => setFormData({...formData, card_name: e.target.value})}
                    disabled={!!editingItem}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Language</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D4A373]"
                    value={formData.language}
                    onChange={e => setFormData({...formData, language: e.target.value})}
                    disabled={!!editingItem}
                  >
                    <option value="en">English</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Position</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D4A373]"
                  value={formData.position}
                  onChange={e => setFormData({...formData, position: e.target.value})}
                  disabled={!!editingItem}
                >
                  <option value="past">Past</option>
                  <option value="present">Present</option>
                  <option value="future">Future</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Summary</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D4A373]"
                  value={formData.summary}
                  onChange={e => setFormData({...formData, summary: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Interpretation</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D4A373]"
                  value={formData.interpretation}
                  onChange={e => setFormData({...formData, interpretation: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Action / Advice</label>
                <textarea 
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D4A373]"
                  value={formData.action}
                  onChange={e => setFormData({...formData, action: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Future Prediction</label>
                <textarea 
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D4A373]"
                  value={formData.future}
                  onChange={e => setFormData({...formData, future: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                {editingItem && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
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
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-[#2B1F16] text-[#D4A373] rounded-lg hover:bg-[#3E2D20] disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
