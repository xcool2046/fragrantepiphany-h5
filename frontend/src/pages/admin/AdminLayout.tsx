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

  const navGroups = [
    {
      title: '内容管理',
      items: [
        { label: 'Interpretations', path: '/admin/interpretations', icon: '🔮' },
        { label: 'Questions', path: '/admin/questions', icon: '❓' },
      ]
    },
    {
      title: '资源',
      items: [
        { label: 'Cards', path: '/admin/cards', icon: '🃏' },
      ]
    }
  ]

  const [isSidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F9F5F1] flex flex-col md:flex-row font-sans text-[#2B1F16]">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#2B1F16] text-[#F3E6D7] p-4 flex justify-between items-center shadow-md z-30">
        <div className="font-serif font-bold text-lg tracking-wide">Fragrant Admin</div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-[#D4A373]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 w-72 bg-[#2B1F16] text-[#F3E6D7] flex flex-col z-40 transition-transform duration-300 shadow-2xl`}>        
        <div className="hidden md:flex items-center justify-center h-16 border-b border-[#D4A373]/20">
          <span className="font-serif font-bold text-xl tracking-wide text-[#D4A373]">Fragrant Epiphany</span>
        </div>

        <nav className="flex-1 p-4 space-y-5 mt-4">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <div className="px-2 text-[11px] uppercase tracking-[0.25em] text-[#F3E6D7]/50">{group.title}</div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname.startsWith(item.path)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 border border-transparent ${
                        isActive
                          ? 'bg-[#D4A373] text-[#2B1F16] font-medium shadow-lg border-[#D4A373]/50'
                          : 'hover:bg-[#D4A373]/10 text-[#F3E6D7]/85 hover:text-[#F3E6D7] border-[#D4A373]/0'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-[#D4A373]/20 bg-[#1f1812]">
          <button
            onClick={() => {
              localStorage.removeItem('admin_token')
              navigate('/admin/login')
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-[#F3E6D7]/70 hover:text-[#D4A373] transition-colors rounded-xl hover:bg-[#D4A373]/10"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-screen">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between h-16 bg-white/90 backdrop-blur border-b border-[#D4A373]/20 px-8 shadow-sm">
          <div className="text-sm text-[#6B5542]">
            Admin / <span className="text-[#2B1F16] font-medium capitalize">{location.pathname.split('/').pop()}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2B1F16] text-[#D4A373] flex items-center justify-center font-serif font-bold text-sm shadow-inner">
              A
            </div>
            <span className="text-sm font-medium text-[#2B1F16]">Administrator</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 bg-[radial-gradient(circle_at_top,_rgba(212,163,115,0.12),_transparent_45%),_#F9F5F1]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
