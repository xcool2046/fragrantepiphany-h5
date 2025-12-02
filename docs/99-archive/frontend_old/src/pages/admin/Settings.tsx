import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Settings() {
  const [config, setConfig] = useState({
    price_cny: 1500,
    price_usd: 500,
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('admin_token')
        const res = await axios.get('/api/admin/config', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.data) setConfig(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = localStorage.getItem('admin_token')
      await axios.post('/api/admin/config', config, {
        headers: { Authorization: `Bearer ${token}` },
      })
      alert('Settings saved')
    } catch {
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6 pb-20 md:pb-0">
      <h1 className="text-2xl font-serif font-bold text-[#2B1F16]">System Settings</h1>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A373]"></div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#2B1F16] mb-2">Price (CNY - cents)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
                  <input
                    type="number"
                    value={config.price_cny}
                    onChange={e => setConfig({ ...config, price_cny: Number(e.target.value) })}
                    className="block w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A373]/20 focus:border-[#D4A373] transition-all text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">Current: ¥{(config.price_cny / 100).toFixed(2)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#2B1F16] mb-2">Price (USD - cents)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={config.price_usd}
                    onChange={e => setConfig({ ...config, price_usd: Number(e.target.value) })}
                    className="block w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A373]/20 focus:border-[#D4A373] transition-all text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">Current: ${(config.price_usd / 100).toFixed(2)}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#D4A373] text-white rounded-lg hover:bg-[#C29260] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4A373] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
