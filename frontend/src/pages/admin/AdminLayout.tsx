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
    { label: 'Interpretations', path: '/admin/interpretations' },
    { label: 'Orders', path: '/admin/orders' },
    { label: 'Settings', path: '/admin/settings' },
  ]

  const [isSidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#2B1F16] text-[#F3E6D7] p-4 flex justify-between items-center">
        <div className="font-serif font-bold">Fragrant Admin</div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
          <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-[#2B1F16] text-[#F3E6D7] flex flex-col md:h-screen sticky top-0`}>
        <div className="hidden md:block p-4 text-xl font-serif font-bold border-b border-[#D4A373]/20">
          Fragrant Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`block px-4 py-2 rounded transition ${
                location.pathname.startsWith(item.path)
                  ? 'bg-[#D4A373] text-[#2B1F16]'
                  : 'hover:bg-[#D4A373]/20'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[#D4A373]/20">
          <button
            onClick={() => {
              localStorage.removeItem('admin_token')
              navigate('/admin/login')
            }}
            className="w-full text-left px-4 py-2 hover:text-[#D4A373] transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
