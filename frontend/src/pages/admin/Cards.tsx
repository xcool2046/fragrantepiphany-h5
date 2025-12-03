import { useCallback, useEffect, useState } from 'react'
import Section from '../../components/Section'
import SearchBar from '../../components/admin/SearchBar'
import api from '../../api'

type Card = {
  id: number
  code: string
  name_en: string
  name_zh?: string
  image_url?: string | null
  enabled: boolean
}

const bgClass = 'bg-gradient-to-br from-[#F7F0E5] via-white to-[#F7F0E5]'

export default function Cards() {
  const getPreviewUrl = (url: string) => {
    if (!url) return ''
    // Check for Google Drive link (more robust regex)
    const driveRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/
    const match = url.match(driveRegex)
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w200`
    }
    return url
  }

  const [items, setItems] = useState<Card[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editing, setEditing] = useState<Card | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({ code: '', name_en: '', name_zh: '', image_url: '' })
  const [keyword, setKeyword] = useState('')

  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [inputPage, setInputPage] = useState('1')
  const pageSize = 10



  const fetchData = useCallback(async (p = 1, kw = keyword) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(p))
      params.set('pageSize', String(pageSize))
      if (kw.trim()) params.set('keyword', kw.trim())
      const res = await api.get(`/api/admin/cards?${params.toString()}`)
      setItems(res.data.items || [])
      setTotal(res.data.total || 0)
      setPage(res.data.page || p)
      setInputPage(String(res.data.page || p))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [keyword, pageSize])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const t = setTimeout(() => fetchData(1, keyword), 250)
    return () => clearTimeout(t)
  }, [fetchData, keyword])

  // Remove client-side filtering, rely on backend
  const filteredItems = items

  const openCreate = () => {
    setEditing(null)
    setForm({ code: '', name_en: '', name_zh: '', image_url: '' })
    setModalOpen(true)
  }

  const openEdit = (c: Card) => {
    setEditing(c)
    setForm({
      code: c.code,
      name_en: c.name_en,
      name_zh: c.name_zh || '',
      image_url: c.image_url || '',
    })
    setModalOpen(true)
  }

  const save = async () => {
    if (!form.code.trim()) {
      alert('code 必填')
      return
    }
    const payload = {
      code: form.code.trim(),
      name_en: form.name_en.trim(),
      name_zh: form.name_zh.trim(),
      image_url: form.image_url.trim() || null,
    }
    setSaving(true)
    try {
      if (editing) {
        await api.patch(`/api/admin/cards/${editing.id}`, payload)
      } else {
        await api.post('/api/admin/cards', payload)
      }
      setModalOpen(false)
      fetchData(page)
    } catch (e: any) {
      alert(e?.response?.data?.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (c: Card) => {
    await api.patch(`/api/admin/cards/${c.id}`, { enabled: !c.enabled })
    fetchData(page)
  }

  const uploadImage = async (inputFile: File) => {
    const fd = new FormData()
    fd.append('file', inputFile)
    try {
      const res = await api.post('/api/admin/cards/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setForm((prev) => ({ ...prev, image_url: res.data.url }))
    } catch (e: any) {
      console.error(e)
      alert(e?.response?.data?.message || '上传失败，请检查文件大小(≤10MB)与格式')
    }
  }

  const handleImport = async () => {
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    try {
      await api.post('/api/admin/cards/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      alert('导入完成')
      setImportOpen(false)
      fetchData(page)
    } catch (e: any) {
      alert(e?.response?.data?.message || '导入失败')
    }
  }

  const handleExport = () => {
    api
      .get('/api/admin/cards/export', { responseType: 'blob' })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'cards.csv')
        document.body.appendChild(link)
        link.click()
        link.remove()
    })
  }

  const handleDelete = async (c: Card) => {
    if (!window.confirm('确认删除该卡牌？')) return
    await api.delete(`/api/admin/cards/${c.id}`)
    fetchData(page)
  }

  return (
    <div className={`space-y-6 ${bgClass} p-1 rounded-3xl shadow-inner`}>
      <Section title="Cards" description="管理卡牌，支持上传与导入/导出">
        <div className="flex flex-wrap gap-3">
          <button onClick={openCreate} className="px-4 py-2 bg-[#2B1F16] text-[#F3E6D7] rounded-xl hover:scale-105 transition-all shadow-md">新增卡牌</button>
          <button onClick={() => setImportOpen(true)} className="px-4 py-2 bg-white border border-[#D4A373] text-[#2B1F16] rounded-xl hover:shadow">导入 CSV</button>
          <button onClick={handleExport} className="px-4 py-2 bg-white border border-[#D4A373] text-[#2B1F16] rounded-xl hover:shadow">导出 CSV</button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 items-center bg-white/70 border border-[#D4A373]/20 rounded-2xl px-4 py-3 shadow-sm">
          <SearchBar
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="按 code / 名称 搜索"
          />

          <span className="text-xs text-[#6B5542]">
            共 {total} 张
          </span>
        </div>

        <div className={`mt-4 grid gap-4 md:grid-cols-2 transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {filteredItems.map((c) => (
            <div key={c.id} className="rounded-2xl border border-[#D4A373]/30 bg-white/70 backdrop-blur shadow-sm p-4 flex gap-3 hover:shadow-lg transition">
              <div className="w-20 h-28 rounded-xl overflow-hidden bg-[#F7F0E5] flex items-center justify-center border border-[#D4A373]/30">
                <img
                  src={c.image_url || `/assets/cards/${c.code}.jpg`}
                  alt={c.name_en}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget
                    if (target.dataset.fallbackApplied) return
                    target.dataset.fallbackApplied = '1'
                    target.src = '/assets/card-back.png'
                  }}
                />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm px-2 py-0.5 rounded-full bg-[#D4A373]/20 text-[#2B1F16]">{c.code}</span>
                  {!c.enabled && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">禁用</span>}
                </div>
                <div className="text-lg font-serif text-[#2B1F16]">{c.name_en}</div>
                <div className="text-sm text-[#6B5542]">{c.name_zh}</div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => toggle(c)} className="px-3 py-1 rounded-lg bg-white border text-sm text-[#2B1F16] hover:border-[#D4A373]">{c.enabled ? '禁用' : '启用'}</button>
                  <button onClick={() => openEdit(c)} className="px-3 py-1 rounded-lg bg-[#D4A373] text-[#2B1F16] text-sm hover:brightness-105">编辑</button>
                  <button onClick={() => handleDelete(c)} className="px-3 py-1 rounded-lg bg-white border text-sm text-red-500 hover:border-red-400">删除</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {total > pageSize && (
          <div className="flex gap-2 mt-4 items-center justify-center">
            <button
              disabled={page === 1}
              onClick={() => fetchData(page - 1)}
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
              <span className="text-sm text-gray-600">/ {Math.ceil(total / pageSize)} 页</span>
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

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm flex items-center justify-between pb-2 border-b border-[#F1E5D6]">
              <h3 className="text-xl font-serif text-[#2B1F16]">{editing ? '编辑卡牌' : '新增卡牌'}</h3>
              <button onClick={() => setModalOpen(false)} className="h-9 w-9 rounded-full border border-gray-200 text-gray-500 hover:text-[#2B1F16] hover:border-[#2B1F16] bg-white shadow-sm" aria-label="关闭">✕</button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {!editing && (
                <div>
                  <label className="text-sm text-[#6B5542]">Code（唯一）</label>
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" />
                </div>
              )}
              <div>
                <label className="text-sm text-[#6B5542]">Name EN</label>
                <input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" />
              </div>
              <div>
                <label className="text-sm text-[#6B5542]">Name ZH</label>
                <input value={form.name_zh} onChange={(e) => setForm({ ...form, name_zh: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm text-[#6B5542]">图片 URL / 上传</label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
                    className="text-sm"
                  />
                  <span className="text-xs text-[#6B5542]">支持常见图片格式 (JPG/PNG/GIF/HEIC等)，≤ 10MB</span>
                </div>
                <input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="可填外链或 /assets/cards/xx.jpg；上传后自动填充"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30"
                />
                {form.image_url ? (
                  <div className="w-24 h-32 rounded-xl overflow-hidden border border-[#D4A373]/30 bg-[#F7F0E5]">
                    <img src={getPreviewUrl(form.image_url)} alt="预览" className="w-full h-full object-cover" />
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border text-[#2B1F16]" disabled={saving}>取消</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded-xl bg-[#2B1F16] text-[#F3E6D7] hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100">
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif text-[#2B1F16]">导入 CSV</h3>
              <button onClick={() => setImportOpen(false)} className="text-gray-400 hover:text-[#2B1F16]">✕</button>
            </div>
            <p className="text-sm text-[#6B5542]">
              只需填 <code>code</code>，其他留空即可；重复 code 会覆盖。支持 <code>image_url</code> 填 Google Drive 链接，系统会自动下载。
            </p>
            <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setImportOpen(false)} className="px-4 py-2 rounded-xl border text-[#2B1F16]">取消</button>
              <button disabled={!file} onClick={handleImport} className="px-4 py-2 rounded-xl bg-[#2B1F16] text-[#F3E6D7] hover:scale-105 transition disabled:opacity-50">开始导入</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
