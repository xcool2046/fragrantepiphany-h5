import { useCallback, useEffect, useState } from 'react'
import Section from '../../components/Section'
import SearchBar from '../../components/admin/SearchBar'
import api from '../../api'

type Perfume = {
  id: number
  card_id: number
  card_name: string
  scene_choice: string
  scene_choice_en?: string | null
  brand_name: string
  product_name: string
  product_name_en?: string | null
  brand_name_en?: string | null
  tags?: string[] | null
  description?: string | null
  description_en?: string | null
  quote?: string | null
  quote_en?: string | null
  image_url?: string | null
  notes_top?: string | null
  notes_top_en?: string | null
  notes_heart?: string | null
  notes_heart_en?: string | null
  notes_base?: string | null
  notes_base_en?: string | null
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
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 20

  const [form, setForm] = useState<Partial<Perfume>>({})

  const tokenHeader = { Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}` }

  const fetchData = useCallback(async (p = 1, kw = query) => {
    setLoading(true)
    try {
      const res = await api.get('/api/admin/perfumes', {
        headers: tokenHeader,
        params: { page: p, pageSize, keyword: kw }
      })
      setItems(res.data.items || [])
      setTotal(res.data.total || 0)
      setPage(p)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => fetchData(1, query), 300)
    return () => clearTimeout(t)
  }, [query])

  const openCreate = () => {
    setEditing(null)
    setForm({
      card_id: 1,
      card_name: '',
      scene_choice: '',
      brand_name: '',
      product_name: '',
      status: 'active',
      sort_order: 0
    })
    setModalOpen(true)
  }

  const openEdit = (item: Perfume) => {
    setEditing(item)
    setForm({ ...item })
    setModalOpen(true)
  }

  const save = async () => {
    if (!form.card_id || !form.brand_name || !form.product_name) {
      alert('Card ID, Brand, Product Name are required')
      return
    }
    try {
      if (editing) {
        await api.patch(`/api/admin/perfumes/${editing.id}`, form, { headers: tokenHeader })
      } else {
        await api.post('/api/admin/perfumes', form, { headers: tokenHeader })
      }
      setModalOpen(false)
      fetchData(page)
    } catch (e) {
      console.error(e)
      alert('Save failed')
    }
  }

  const remove = async (id: number) => {
    if (!window.confirm('Confirm delete?')) return
    try {
      await api.delete(`/api/admin/perfumes/${id}`, { headers: tokenHeader })
      fetchData(page)
    } catch (e) {
      console.error(e)
      alert('Delete failed')
    }
  }

  return (
    <div className={`space-y-6 ${bgClass} p-1 rounded-3xl shadow-inner`}>
      <Section title="Perfumes" description="Manage perfume recommendations">
        <div className="flex flex-wrap gap-3 items-center mb-4">
          <button onClick={openCreate} className="px-4 py-2 bg-[#2B1F16] text-[#F3E6D7] rounded-xl hover:scale-105 transition-all shadow-md">
            + New Perfume
          </button>
          <SearchBar value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search brand, product, card..." />
        </div>

        <div className="grid gap-4">
          {loading && <div className="text-sm text-gray-500">Loading...</div>}
          {!loading && items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-[#D4A373]/30 bg-white/70 backdrop-blur shadow-sm p-4 flex flex-col md:flex-row md:items-center md:justify-between hover:shadow-lg transition">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#F7F0E5] text-xs text-[#6B5542]">ID: {item.id}</span>
                  <span className="font-serif font-bold text-[#2B1F16]">{item.brand_name} - {item.product_name}</span>
                  <span className="text-xs text-gray-500">({item.brand_name_en} - {item.product_name_en})</span>
                </div>
                <div className="text-sm text-[#6B5542] flex gap-4">
                  <span>Card: {item.card_name} (ID: {item.card_id})</span>
                  <span>Scene: {item.scene_choice}</span>
                  <span>Status: {item.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 md:mt-0">
                <button onClick={() => openEdit(item)} className="px-3 py-1 rounded-lg bg-[#D4A373] text-[#2B1F16] text-sm hover:brightness-105">Edit</button>
                <button onClick={() => remove(item.id)} className="px-3 py-1 rounded-lg bg-white border text-sm text-red-500 hover:border-red-400">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* Simple Pagination */}
        <div className="flex justify-center gap-2 mt-6">
            <button disabled={page === 1} onClick={() => fetchData(page - 1)} className="px-3 py-1 rounded border bg-white disabled:opacity-50">Prev</button>
            <span className="px-2 py-1 text-sm text-[#6B5542]">Page {page} of {Math.ceil(total / pageSize) || 1}</span>
            <button disabled={page * pageSize >= total} onClick={() => fetchData(page + 1)} className="px-3 py-1 rounded border bg-white disabled:opacity-50">Next</button>
        </div>
      </Section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xl font-serif text-[#2B1F16]">{editing ? 'Edit Perfume' : 'New Perfume'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-[#2B1F16]">✕</button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
               {/* Basic Info */}
               <div className="space-y-3">
                  <h4 className="font-bold text-[#D4A373] text-sm uppercase tracking-wider">Basic Info</h4>
                  <div>
                    <label className="text-xs text-[#6B5542]">Card ID</label>
                    <input type="number" value={form.card_id} onChange={e => setForm({...form, card_id: Number(e.target.value)})} className="w-full rounded-lg border p-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-[#6B5542]">Card Name</label>
                    <input value={form.card_name || ''} onChange={e => setForm({...form, card_name: e.target.value})} className="w-full rounded-lg border p-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-[#6B5542]">Scene Choice (ZH)</label>
                    <input value={form.scene_choice || ''} onChange={e => setForm({...form, scene_choice: e.target.value})} className="w-full rounded-lg border p-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-[#6B5542]">Scene Choice (EN)</label>
                    <input value={form.scene_choice_en || ''} onChange={e => setForm({...form, scene_choice_en: e.target.value})} className="w-full rounded-lg border p-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-[#6B5542]">Sort Order</label>
                    <input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: Number(e.target.value)})} className="w-full rounded-lg border p-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-[#6B5542]">Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full rounded-lg border p-2 text-sm">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                  </div>
               </div>

               {/* Product Info */}
               <div className="space-y-3">
                  <h4 className="font-bold text-[#D4A373] text-sm uppercase tracking-wider">Product Info</h4>
                  <div>
                    <label className="text-xs text-[#6B5542]">Brand (ZH)</label>
                    <input value={form.brand_name || ''} onChange={e => setForm({...form, brand_name: e.target.value})} className="w-full rounded-lg border p-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-[#6B5542]">Brand (EN)</label>
                    <input value={form.brand_name_en || ''} onChange={e => setForm({...form, brand_name_en: e.target.value})} className="w-full rounded-lg border p-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-[#6B5542]">Product (ZH)</label>
                    <input value={form.product_name || ''} onChange={e => setForm({...form, product_name: e.target.value})} className="w-full rounded-lg border p-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-[#6B5542]">Product (EN)</label>
                    <input value={form.product_name_en || ''} onChange={e => setForm({...form, product_name_en: e.target.value})} className="w-full rounded-lg border p-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-[#6B5542]">Image URL</label>
                    <input value={form.image_url || ''} onChange={e => setForm({...form, image_url: e.target.value})} className="w-full rounded-lg border p-2 text-sm" />
                  </div>
               </div>
            </div>

            {/* Details */}
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                    <label className="text-xs text-[#6B5542]">Description (ZH)</label>
                    <textarea value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} className="w-full rounded-lg border p-2 text-sm" rows={3} />
                    <label className="text-xs text-[#6B5542]">Quote (ZH)</label>
                    <textarea value={form.quote || ''} onChange={e => setForm({...form, quote: e.target.value})} className="w-full rounded-lg border p-2 text-sm" rows={2} />
                    <label className="text-xs text-[#6B5542]">Notes (Top/Heart/Base) ZH</label>
                    <div className="grid grid-cols-3 gap-2">
                        <input placeholder="Top" value={form.notes_top || ''} onChange={e => setForm({...form, notes_top: e.target.value})} className="rounded border p-1 text-xs" />
                        <input placeholder="Heart" value={form.notes_heart || ''} onChange={e => setForm({...form, notes_heart: e.target.value})} className="rounded border p-1 text-xs" />
                        <input placeholder="Base" value={form.notes_base || ''} onChange={e => setForm({...form, notes_base: e.target.value})} className="rounded border p-1 text-xs" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-[#6B5542]">Description (EN)</label>
                    <textarea value={form.description_en || ''} onChange={e => setForm({...form, description_en: e.target.value})} className="w-full rounded-lg border p-2 text-sm" rows={3} />
                    <label className="text-xs text-[#6B5542]">Quote (EN)</label>
                    <textarea value={form.quote_en || ''} onChange={e => setForm({...form, quote_en: e.target.value})} className="w-full rounded-lg border p-2 text-sm" rows={2} />
                    <label className="text-xs text-[#6B5542]">Notes (Top/Heart/Base) EN</label>
                    <div className="grid grid-cols-3 gap-2">
                        <input placeholder="Top" value={form.notes_top_en || ''} onChange={e => setForm({...form, notes_top_en: e.target.value})} className="rounded border p-1 text-xs" />
                        <input placeholder="Heart" value={form.notes_heart_en || ''} onChange={e => setForm({...form, notes_heart_en: e.target.value})} className="rounded border p-1 text-xs" />
                        <input placeholder="Base" value={form.notes_base_en || ''} onChange={e => setForm({...form, notes_base_en: e.target.value})} className="rounded border p-1 text-xs" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border text-[#2B1F16]">Cancel</button>
              <button onClick={save} className="px-4 py-2 rounded-xl bg-[#2B1F16] text-[#F3E6D7] hover:scale-105 transition">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
