import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Settings() {
  const [config, setConfig] = useState({
    price_cny: 1500,
    price_usd: 500,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem('admin_token')
        const res = await axios.get('/api/admin/config', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.data) setConfig(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchConfig()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      await axios.post('/api/admin/config', config, {
        headers: { Authorization: `Bearer ${token}` },
      })
      alert('Settings saved')
    } catch (err) {
      alert('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price (CNY - cents)</label>
            <input
              type="number"
              value={config.price_cny}
              onChange={e => setConfig({ ...config, price_cny: Number(e.target.value) })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            <p className="text-xs text-gray-500 mt-1">1500 = ¥15.00</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price (USD - cents)</label>
            <input
              type="number"
              value={config.price_usd}
              onChange={e => setConfig({ ...config, price_usd: Number(e.target.value) })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            <p className="text-xs text-gray-500 mt-1">500 = $5.00</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  )
}
