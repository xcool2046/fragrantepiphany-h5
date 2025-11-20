import { useEffect, useState } from 'react'
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      navigate('/admin/login')
    }
  }, [navigate])

  const navItems = [
    { label: 'Interpretations', path: '/admin/interpretations', icon: '🔮' },
    // Orders 隐藏，等待客户追加预算再开启
    // { label: 'Orders', path: '/admin/orders', icon: '💰' },
  ]

  const [isSidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#2B1F16] text-[#F3E6D7] p-4 flex justify-between items-center shadow-md z-20">
        <div className="font-serif font-bold text-lg tracking-wide">Fragrant Admin</div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-[#D4A373]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 w-64 bg-[#2B1F16] text-[#F3E6D7] flex flex-col z-30 transition-transform duration-300 shadow-xl`}>
        <div className="hidden md:flex items-center justify-center h-16 border-b border-[#D4A373]/10">
          <span className="font-serif font-bold text-xl tracking-wide text-[#D4A373]">Fragrant Epiphany</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-[#D4A373] text-[#2B1F16] font-medium shadow-md'
                    : 'hover:bg-[#D4A373]/10 text-[#F3E6D7]/80 hover:text-[#F3E6D7]'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[#D4A373]/10">
          <button
            onClick={() => {
              localStorage.removeItem('admin_token')
              navigate('/admin/login')
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-[#F3E6D7]/60 hover:text-[#D4A373] transition-colors rounded-lg hover:bg-[#D4A373]/5"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden h-screen">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between h-16 bg-white border-b border-gray-200 px-8 shadow-sm">
          <div className="text-sm text-gray-500">
            Admin / <span className="text-[#2B1F16] font-medium capitalize">{location.pathname.split('/').pop()}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2B1F16] text-[#D4A373] flex items-center justify-center font-serif font-bold text-xs">
              A
            </div>
            <span className="text-sm font-medium text-[#2B1F16]">Administrator</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
