import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
const JourneyHub = React.lazy(() => import('./pages/JourneyHub'))
const JourneyDetail = React.lazy(() => import('./pages/JourneyDetail'))
const JourneyComplete = React.lazy(() => import('./pages/JourneyComplete'))
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'))
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout'))
const Interpretations = React.lazy(() => import('./pages/admin/Interpretations'))
const Questions = React.lazy(() => import('./pages/admin/Questions'))
const Cards = React.lazy(() => import('./pages/admin/Cards'))
const Rules = React.lazy(() => import('./pages/admin/Rules'))

const Loading = () => (
  <div className="flex-center" style={{ height: '100vh', color: 'var(--color-primary-gold)' }}>
    Loading...
  </div>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<Loading />}>
      <BrowserRouter>
        <RippleEffect />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/question" element={<Question />} />
          <Route path="/draw" element={<Draw />} />
          <Route path="/result" element={<Result />} />
          <Route path="/about" element={<About />} />
          <Route path="/journey" element={<JourneyHub />} />
          <Route path="/journey/complete" element={<JourneyComplete />} />
          <Route path="/journey/:chapterId" element={<JourneyDetail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Interpretations />} />
            <Route path="interpretations" element={<Interpretations />} />
            <Route path="questions" element={<Questions />} />
            <Route path="cards" element={<Cards />} />
            <Route path="rules" element={<Rules />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>,
)
