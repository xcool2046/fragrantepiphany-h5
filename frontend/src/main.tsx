import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import './i18n'

// Lazy load pages
const Home = React.lazy(() => import('./pages/Home'))
const Onboarding = React.lazy(() => import('./pages/Onboarding'))
const Question = React.lazy(() => import('./pages/Question'))
const Draw = React.lazy(() => import('./pages/Draw'))
const Result = React.lazy(() => import('./pages/Result'))
const About = React.lazy(() => import('./pages/About'))

const Loading = () => (
  <div className="flex-center" style={{ height: '100vh', color: 'var(--color-primary-gold)' }}>
    Loading...
  </div>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<Loading />}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/question" element={<Question />} />
          <Route path="/draw" element={<Draw />} />
          <Route path="/result" element={<Result />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>,
)
