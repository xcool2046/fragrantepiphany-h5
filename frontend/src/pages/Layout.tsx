import { Outlet, NavLink } from 'react-router-dom'
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
  return (
    <div className="min-h-screen bg-background text-text">
      <header className="flex items-center justify-between px-4 py-3 shadow-card bg-white/70 backdrop-blur sticky top-0 z-10">
        <div className="font-semibold">{t('common.appName')}</div>
        <nav className="flex gap-3 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-1 rounded-full ${isActive ? 'bg-primary text-white' : 'text-subtext hover:text-text'}`
              }
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
        <LanguageToggle />
      </header>
      <main className="px-4 py-6 max-w-5xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
