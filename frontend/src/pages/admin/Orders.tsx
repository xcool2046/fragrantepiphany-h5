import { useState, useEffect } from 'react'
import axios from 'axios'

type Order = {
  id: string
  amount: number
  currency: string
  status: string
  created_at: string
  metadata: Record<string, unknown> | null
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('admin_token')
        const res = await axios.get('/api/admin/orders', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setOrders(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h1 className="text-2xl font-serif font-bold text-[#2B1F16]">Orders</h1>
      
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6B5542] uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6B5542] uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6B5542] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6B5542] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6B5542] uppercase tracking-wider">Metadata</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{order.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(order.amount / 100).toFixed(2)} {order.currency.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'paid' || order.status === 'success' || order.status === 'succeeded' 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                      <span title={JSON.stringify(order.metadata)} className="cursor-help">
                        {JSON.stringify(order.metadata).slice(0, 30)}...
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">
                      {(order.amount / 100).toFixed(2)} {order.currency.toUpperCase()}
                    </div>
                    <div className="text-xs font-mono text-gray-400 mt-0.5">{order.id}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    order.status === 'paid' || order.status === 'success' || order.status === 'succeeded'
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500 pt-2 border-t border-gray-50">
                  <span>{new Date(order.created_at).toLocaleString()}</span>
                </div>
                {order.metadata && (
                   <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
                     {JSON.stringify(order.metadata)}
                   </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
