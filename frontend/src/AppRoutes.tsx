import React, { Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import WipeTransition from './components/WipeTransition'
import GlobalLoading from './components/GlobalLoading'

// Lazy load pages
const Home = React.lazy(() => import('./pages/Home'))
const Onboarding = React.lazy(() => import('./pages/Onboarding'))
const Question = React.lazy(() => import('./pages/Question'))
const Breath = React.lazy(() => import('./pages/Breath'))
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
const Perfumes = React.lazy(() => import('./pages/admin/Perfumes'))
const Cards = React.lazy(() => import('./pages/admin/Cards'))
const PayCallback = React.lazy(() => import('./pages/PayCallback'))

// Wrapper for smooth page transitions
const PageWrapper = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <WipeTransition>
    <div className={`w-full min-h-screen ${className || ''}`}>
      <Suspense fallback={<GlobalLoading />}>
        {children}
      </Suspense>
    </div>
  </WipeTransition>
)

const AppRoutes: React.FC = () => {
  const location = useLocation()
  
  // Determine animation key:
  // For admin routes, we keep the layout stable (key="admin-root") so it doesn't unmount/remount on sub-navigation.
  // For consumer app, we animate on every path change.
  const isAdmin = location.pathname.startsWith('/admin')
  const pageKey = isAdmin ? 'admin-root' : location.pathname

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={pageKey}>
        {/* Consumer Routes */}
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/onboarding" element={<PageWrapper><Onboarding /></PageWrapper>} />
        <Route path="/question" element={<PageWrapper><Question /></PageWrapper>} />
        <Route path="/breath" element={<PageWrapper><Breath /></PageWrapper>} />
        <Route path="/draw" element={<PageWrapper><Draw /></PageWrapper>} />
        <Route path="/result" element={<PageWrapper><Result /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/perfume" element={<PageWrapper><PerfumeView /></PageWrapper>} />
        <Route path="/journey/complete" element={<PageWrapper><JourneyComplete /></PageWrapper>} />
        <Route path="/pay/callback" element={<PageWrapper><PayCallback /></PageWrapper>} />
        <Route path="/share" element={<PageWrapper><SharePage /></PageWrapper>} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<PageWrapper><AdminLogin /></PageWrapper>} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Interpretations />} />
          <Route path="interpretations" element={<Interpretations />} />
          <Route path="questions" element={<Questions />} />
          <Route path="perfumes" element={<Perfumes />} />
          <Route path="cards" element={<Cards />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default AppRoutes
