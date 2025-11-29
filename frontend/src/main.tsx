import React, { Suspense, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './index.css'
import './i18n'
import RippleEffect from './components/RippleEffect'

// Lazy load pages
const Home = React.lazy(() => import('./pages/Home'))
const Onboarding = React.lazy(() => import('./pages/Onboarding'))
const Question = React.lazy(() => import('./pages/Question'))
const Draw = React.lazy(() => import('./pages/Draw'))
const Result = React.lazy(() => import('./pages/Result'))
const About = React.lazy(() => import('./pages/About'))
const JourneyComplete = React.lazy(() => import('./pages/JourneyComplete'))
const PerfumeView = React.lazy(() => import('./pages/PerfumeView'))
const SharePage = React.lazy(() => import('./pages/SharePage'))
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'))
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout'))
const Interpretations = React.lazy(() => import('./pages/admin/Interpretations'))
const Questions = React.lazy(() => import('./pages/admin/Questions'))
const Cards = React.lazy(() => import('./pages/admin/Cards'))
const PayCallback = React.lazy(() => import('./pages/PayCallback'))

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

import GlobalLoading from './components/GlobalLoading'

// ... (imports)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<GlobalLoading />}>
      <BrowserRouter>
        <ScrollManager />
        <RippleEffect />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/question" element={<Question />} />
          <Route path="/draw" element={<Draw />} />
          <Route path="/result" element={<Result />} />
          <Route path="/about" element={<About />} />
          <Route path="/perfume" element={<PerfumeView />} />
          <Route path="/journey/complete" element={<JourneyComplete />} />
          <Route path="/pay/callback" element={<PayCallback />} />
          <Route path="/share" element={<SharePage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Interpretations />} />
            <Route path="interpretations" element={<Interpretations />} />
            <Route path="questions" element={<Questions />} />
            <Route path="cards" element={<Cards />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>,
)
