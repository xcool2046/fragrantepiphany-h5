import { Outlet } from 'react-router-dom'
import LanguageToggle from '../components/LanguageToggle'

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-text font-sans relative">
      <div className="absolute top-6 right-6 z-50">
        <LanguageToggle />
      </div>
      <main className="w-full h-full min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
