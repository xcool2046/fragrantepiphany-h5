import { useState, useEffect } from 'react'
import axios from 'axios'

type Interpretation = {
  id: number
  card_name: string
  category: string
  position: string
  language: string
  summary: string
  interpretation: string
  action: string
  future: string
  recommendation: any
}

export default function Interpretations() {
  const [items, setItems] = useState<Interpretation[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<Interpretation | null>(null)
  const [importFile, setImportFile] = useState<File | null>(null)
  
  // Filters
  const [filterCard, setFilterCard] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterPosition, setFilterPosition] = useState('')
  const [filterLanguage, setFilterLanguage] = useState('')

  const fetchItems = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const params: any = { page, limit: 10 }
      if (filterCard) params.card_name = filterCard
      if (filterCategory) params.category = filterCategory
      if (filterPosition) params.position = filterPosition
      if (filterLanguage) params.language = filterLanguage

      const res = await axios.get(`/api/interp/list`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      })
      setItems(res.data.items)
      setTotal(res.data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [page, filterCard, filterCategory, filterPosition, filterLanguage]) // Refetch on filter change

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    try {
      const token = localStorage.getItem('admin_token')
      await axios.post(`/api/interp/update/${editing.id}`, editing, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEditing(null)
      fetchItems()
    } catch (err) {
      console.error(err)
    }
  }

  const handleImport = async () => {
    if (!importFile) return
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = e.target?.result as string
      // Simple CSV parser (assumes headers: card_name,category,position,language,summary,interpretation,action,future,recommendation)
      const lines = text.split('\n')
      const header = lines[0].split(',').map(h => h.trim())
      const requiredHeaders = ['card_name', 'category', 'position', 'language', 'summary', 'interpretation']
      const missing = requiredHeaders.filter(h => !header.includes(h))
      
      if (missing.length > 0) {
        alert(`Invalid CSV format. Missing columns: ${missing.join(', ')}`)
        return
      }

      const dataLines = lines.slice(1)
      const items = dataLines.map(line => {
        const cols = line.split(',') // This is naive, better use a library for CSV
        if (cols.length < 5) return null
        return {
          card_name: cols[0],
          category: cols[1],
          position: cols[2],
          language: cols[3],
          summary: cols[4],
          interpretation: cols[5],
          action: cols[6],
          future: cols[7],
          recommendation: cols[8] ? JSON.parse(cols[8] || '{}') : {}
        }
      }).filter(Boolean)

      try {
        const token = localStorage.getItem('admin_token')
        await axios.post('/api/interp/import', { items }, {
          headers: { Authorization: `Bearer ${token}` },
        })
        alert('Import successful')
        fetchItems()
      } catch (err) {
        alert('Import failed')
      }
    }
    reader.readAsText(importFile)
  }

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const res = await axios.get('/api/interp/export', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = JSON.stringify(res.data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'interpretations.json'
      a.click()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-serif font-bold text-[#2B1F16]">Interpretations</h1>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <input 
              type="file" 
              id="csv-upload"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)} 
              className="hidden" 
            />
            <label 
              htmlFor="csv-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-[#D4A373] text-[#D4A373] bg-white rounded-lg hover:bg-[#F7F0E5] transition-colors text-sm font-medium"
            >
              {importFile ? importFile.name : 'Select CSV'}
            </label>
          </div>
          <button 
            onClick={handleImport} 
            disabled={!importFile}
            className="px-4 py-2 bg-[#D4A373] text-white rounded-lg hover:bg-[#C29260] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
          >
            Import
          </button>
          <button 
            onClick={handleExport} 
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <input 
          placeholder="Filter Card Name" 
          value={filterCard} 
          onChange={e => setFilterCard(e.target.value)} 
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A373]/20 focus:border-[#D4A373] transition-all text-sm" 
        />
        <input 
          placeholder="Filter Category" 
          value={filterCategory} 
          onChange={e => setFilterCategory(e.target.value)} 
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A373]/20 focus:border-[#D4A373] transition-all text-sm" 
        />
        <input 
          placeholder="Filter Position" 
          value={filterPosition} 
          onChange={e => setFilterPosition(e.target.value)} 
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A373]/20 focus:border-[#D4A373] transition-all text-sm" 
        />
        <select 
          value={filterLanguage} 
          onChange={e => setFilterLanguage(e.target.value)} 
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A373]/20 focus:border-[#D4A373] transition-all text-sm bg-white"
        >
          <option value="">All Languages</option>
          <option value="en">English</option>
          <option value="zh">Chinese</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A373]"></div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#F7F0E5]/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6B5542] uppercase tracking-wider">Card</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6B5542] uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6B5542] uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6B5542] uppercase tracking-wider">Lang</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6B5542] uppercase tracking-wider">Summary</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#6B5542] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.card_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs ${item.language === 'zh' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        {item.language.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{item.summary}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => setEditing(item)} className="text-[#D4A373] hover:text-[#C29260] font-medium">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.card_name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{item.category} • {item.position}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.language === 'zh' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    {item.language.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{item.summary}</p>
                <div className="pt-2 border-t border-gray-50 flex justify-end">
                  <button 
                    onClick={() => setEditing(item)} 
                    className="text-sm font-medium text-[#D4A373] hover:text-[#C29260] px-3 py-1.5 bg-[#F7F0E5]/50 rounded-lg"
                  >
                    Edit Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center pt-4">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)} 
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 10)}</span>
            <button 
              disabled={page * 10 >= total} 
              onClick={() => setPage(p => p + 1)} 
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-serif font-bold text-[#2B1F16]">Edit Interpretation</h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Card Name</label>
                  <input value={editing.card_name} disabled className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Category</label>
                  <input value={editing.category} disabled className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Position</label>
                  <input value={editing.position} disabled className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Language</label>
                  <input value={editing.language} disabled className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#2B1F16] mb-2">Summary</label>
                <textarea
                  value={editing.summary}
                  onChange={e => setEditing({ ...editing, summary: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A373]/20 focus:border-[#D4A373] transition-all text-sm min-h-[80px]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#2B1F16] mb-2">Interpretation</label>
                <textarea
                  value={editing.interpretation || ''}
                  onChange={e => setEditing({ ...editing, interpretation: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A373]/20 focus:border-[#D4A373] transition-all text-sm min-h-[120px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2B1F16] mb-2">Action Advice</label>
                  <textarea
                    value={editing.action || ''}
                    onChange={e => setEditing({ ...editing, action: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A373]/20 focus:border-[#D4A373] transition-all text-sm min-h-[80px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2B1F16] mb-2">Future Outlook</label>
                  <textarea
                    value={editing.future || ''}
                    onChange={e => setEditing({ ...editing, future: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A373]/20 focus:border-[#D4A373] transition-all text-sm min-h-[80px]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setEditing(null)} className="px-5 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#D4A373] text-white rounded-lg hover:bg-[#C29260] font-medium text-sm shadow-sm transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
