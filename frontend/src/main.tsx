import React, { Suspense, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useLocation } from 'react-router-dom'
import './index.css'
import './i18n'
import RippleEffect from './components/RippleEffect'
import NoiseOverlay from './components/NoiseOverlay'
import GlobalLoading from './components/GlobalLoading'
import AppRoutes from './AppRoutes'

// Global scroll manager to avoid returning to a page at the previous offset (e.g., back from Perfume to Result)
const ScrollManager: React.FC = () => {
  const { pathname, search } = useLocation()

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, search])

  return null
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<GlobalLoading />}>
      <BrowserRouter>
        <ScrollManager />
        <RippleEffect />
        <NoiseOverlay />
        <AppRoutes />
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>,
)
