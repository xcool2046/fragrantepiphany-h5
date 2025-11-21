import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Section from '../../components/Section'

type Card = {
  id: number
  code: string
  name_en: string
  name_zh?: string | null
  image_url?: string | null
  default_meaning_en?: string | null
  default_meaning_zh?: string | null
  enabled: boolean
}

const bgClass = 'bg-gradient-to-br from-[#F7F0E5] via-white to-[#F7F0E5]'

export default function Cards() {
  const [items, setItems] = useState<Card[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editing, setEditing] = useState<Card | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({ code: '', name_en: '', name_zh: '', image_url: '', default_meaning_en: '', default_meaning_zh: '' })
  const [keyword, setKeyword] = useState('')
  const [onlyEnabled, setOnlyEnabled] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  const tokenHeader = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}` }), [])

  const fetchData = async (p = 1) => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/admin/cards?page=${p}&pageSize=${pageSize}`, { headers: tokenHeader })
      setItems(res.data.items || [])
      setTotal(res.data.total || 0)
      setPage(res.data.page || p)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return items.filter((c) => {
      const matchKw = kw
        ? c.code.toLowerCase().includes(kw) ||
          c.name_en.toLowerCase().includes(kw) ||
          (c.name_zh || '').toLowerCase().includes(kw)
        : true
      const matchEnabled = onlyEnabled ? c.enabled : true
      return matchKw && matchEnabled
    })
  }, [items, keyword, onlyEnabled])

  const openCreate = () => {
    setEditing(null)
    setForm({ code: '', name_en: '', name_zh: '', image_url: '', default_meaning_en: '', default_meaning_zh: '' })
    setModalOpen(true)
  }

  const openEdit = (c: Card) => {
    setEditing(c)
    setForm({
      code: c.code,
      name_en: c.name_en,
      name_zh: c.name_zh || '',
      image_url: c.image_url || '',
      default_meaning_en: c.default_meaning_en || '',
      default_meaning_zh: c.default_meaning_zh || '',
    })
    setModalOpen(true)
  }

  const save = async () => {
    if (!form.code.trim() || !form.name_en.trim()) {
      alert('code 与 name_en 必填')
      return
    }
    const payload = {
      code: form.code.trim(),
      name_en: form.name_en.trim(),
      name_zh: form.name_zh.trim() || null,
      image_url: form.image_url.trim() || null,
      default_meaning_en: form.default_meaning_en.trim() || null,
      default_meaning_zh: form.default_meaning_zh.trim() || null,
    }
    try {
      if (editing) {
        await axios.patch(`/api/admin/cards/${editing.id}`, payload, { headers: tokenHeader })
      } else {
        await axios.post('/api/admin/cards', payload, { headers: tokenHeader })
      }
      setModalOpen(false)
      fetchData(page)
    } catch (e: any) {
      alert(e?.response?.data?.message || '保存失败')
    }
  }

  const toggle = async (c: Card) => {
    await axios.patch(`/api/admin/cards/${c.id}`, { enabled: !c.enabled }, { headers: tokenHeader })
    fetchData(page)
  }

  const uploadImage = async (inputFile: File) => {
    const fd = new FormData()
    fd.append('file', inputFile)
    const res = await axios.post('/api/admin/cards/upload', fd, {
      headers: { ...tokenHeader, 'Content-Type': 'multipart/form-data' },
    })
    setForm((prev) => ({ ...prev, image_url: res.data.url }))
  }

  const handleImport = async () => {
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    try {
      await axios.post('/api/admin/cards/import', fd, { headers: { ...tokenHeader, 'Content-Type': 'multipart/form-data' } })
      alert('导入完成')
      setImportOpen(false)
      fetchData(page)
    } catch (e: any) {
      alert(e?.response?.data?.message || '导入失败')
    }
  }

  const handleExport = () => {
    axios
      .get('/api/admin/cards/export', { headers: tokenHeader, responseType: 'blob' })
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

  return (
    <div className={`space-y-6 ${bgClass} p-1 rounded-3xl shadow-inner`}>
      <Section title="Cards" description="管理卡牌，支持上传与导入/导出">
        <div className="flex flex-wrap gap-3">
          <button onClick={openCreate} className="px-4 py-2 bg-[#2B1F16] text-[#F3E6D7] rounded-xl hover:scale-105 transition-all shadow-md">新增卡牌</button>
          <button onClick={() => setImportOpen(true)} className="px-4 py-2 bg-white border border-[#D4A373] text-[#2B1F16] rounded-xl hover:shadow">导入 CSV</button>
          <button onClick={handleExport} className="px-4 py-2 bg-white border border-[#D4A373] text-[#2B1F16] rounded-xl hover:shadow">导出 CSV</button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 items-center bg-white/70 border border-[#D4A373]/20 rounded-2xl px-4 py-3 shadow-sm">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="按 code / 名称 搜索"
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20 min-w-[200px]"
          />
          <label className="flex items-center gap-2 text-sm text-[#2B1F16]">
            <input
              type="checkbox"
              checked={onlyEnabled}
              onChange={(e) => setOnlyEnabled(e.target.checked)}
              className="h-4 w-4 text-[#D4A373]"
            />
            仅显示启用
          </label>
          <span className="text-xs text-[#6B5542]">
            共 {total} 张
          </span>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {loading && <div className="text-sm text-gray-500">加载中...</div>}
          {!loading && filtered.map((c) => (
            <div key={c.id} className="rounded-2xl border border-[#D4A373]/30 bg-white/70 backdrop-blur shadow-sm p-4 flex gap-3 hover:shadow-lg transition">
              <div className="w-20 h-28 rounded-xl overflow-hidden bg-[#F7F0E5] flex items-center justify-center border border-[#D4A373]/30">
                {c.image_url ? <img src={c.image_url} alt={c.name_en} className="w-full h-full object-cover" /> : <span className="text-gray-400 text-xs">No Image</span>}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm px-2 py-0.5 rounded-full bg-[#D4A373]/20 text-[#2B1F16]">{c.code}</span>
                  {!c.enabled && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">禁用</span>}
                </div>
                <div className="text-lg font-serif text-[#2B1F16]">{c.name_en}{c.name_zh ? ` / ${c.name_zh}` : ''}</div>
                {(c.default_meaning_en || c.default_meaning_zh) && (
                  <div className="text-xs text-[#6B5542] line-clamp-2">
                    {c.default_meaning_en || c.default_meaning_zh}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <button onClick={() => toggle(c)} className="px-3 py-1 rounded-lg bg-white border text-sm text-[#2B1F16] hover:border-[#D4A373]">{c.enabled ? '禁用' : '启用'}</button>
                  <button onClick={() => openEdit(c)} className="px-3 py-1 rounded-lg bg-[#D4A373] text-[#2B1F16] text-sm hover:brightness-105">编辑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {total > pageSize && (
          <div className="flex gap-2 mt-4">
            <button disabled={page === 1} onClick={() => fetchData(page - 1)} className="px-3 py-1 rounded border bg-white disabled:opacity-50">上一页</button>
            <div className="text-sm text-gray-600 px-2 py-1">第 {page} 页 / 共 {Math.ceil(total / pageSize)} 页</div>
            <button disabled={page * pageSize >= total} onClick={() => fetchData(page + 1)} className="px-3 py-1 rounded border bg-white disabled:opacity-50">下一页</button>
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
                <label className="text-sm text-[#6B5542]">名称 ZH</label>
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
                  <span className="text-xs text-[#6B5542]">支持 JPG / PNG，建议 600×1000，≤ 1MB</span>
                </div>
                <input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="可填外链或 /assets/cards/xxx.jpg；上传后自动填充"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30"
                />
                {form.image_url ? (
                  <div className="w-24 h-32 rounded-xl overflow-hidden border border-[#D4A373]/30 bg-[#F7F0E5]">
                    <img src={form.image_url} alt="预览" className="w-full h-full object-cover" />
                  </div>
                ) : null}
              </div>
              <div>
                <label className="text-sm text-[#6B5542]">默认解读 EN</label>
                <textarea value={form.default_meaning_en} onChange={(e) => setForm({ ...form, default_meaning_en: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" rows={3} />
              </div>
              <div>
                <label className="text-sm text-[#6B5542]">默认解读 ZH</label>
                <textarea value={form.default_meaning_zh} onChange={(e) => setForm({ ...form, default_meaning_zh: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-[#D4A373] focus:ring-[#D4A373]/30" rows={3} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border text-[#2B1F16]">取消</button>
              <button onClick={save} className="px-4 py-2 rounded-xl bg-[#2B1F16] text-[#F3E6D7] hover:scale-105 transition">保存</button>
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
              只需填 <code>code,name_en,name_zh</code> 三列，其他留空即可；重复 code 会覆盖，空值不覆盖旧值。
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
