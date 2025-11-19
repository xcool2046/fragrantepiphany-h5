import { useState } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import LanguageToggle from '../components/LanguageToggle'

const navItems = [
  { to: '/', key: 'home', labelKey: 'common.home' },
  { to: '/quiz', key: 'quiz', labelKey: 'common.quiz' },
  { to: '/draw', key: 'draw', labelKey: 'common.draw' },
  { to: '/result', key: 'result', labelKey: 'common.result' },
]

export default function Layout() {
  const { t } = useTranslation()
  const [isMenuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-text font-sans">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-[#D4A373]/10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-serif font-bold text-lg tracking-tight text-[#2B1F16]">
            {t('common.appName')}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive }) =>
                  `transition-colors ${isActive ? 'text-[#D4A373]' : 'text-[#6B5542] hover:text-[#2B1F16]'}`
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
            <div className="pl-2 border-l border-gray-200">
              <LanguageToggle />
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-3 md:hidden">
            <LanguageToggle />
            <button 
              onClick={() => setMenuOpen(!isMenuOpen)}
              className="p-2 text-[#2B1F16] focus:outline-none"
              aria-label="Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-white border-t border-gray-100"
            >
              <nav className="flex flex-col p-4 space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.key}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-[#F7F0E5] text-[#2B1F16]' 
                          : 'text-[#6B5542] hover:bg-gray-50'
                      }`
                    }
                  >
                    {t(item.labelKey)}
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      
      {/* Spacer for fixed header */}
      <div className="h-14" /> 

      <main className="px-4 py-6 max-w-5xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
