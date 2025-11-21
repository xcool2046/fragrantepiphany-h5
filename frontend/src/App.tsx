import './App.css'

import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { ToastProvider, ToastContainer } from './components/Toast'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LoadingOverlay } from './components/Loading'

// 主要页面 - 立即加载
import Layout from './pages/Layout'
import Home from './pages/Home'

// 次要页面 - 懒加载
const Quiz = lazy(() => import('./pages/Quiz'))
const Draw = lazy(() => import('./pages/Draw'))
const Result = lazy(() => import('./pages/Result'))
const Pay = lazy(() => import('./pages/Pay'))
const About = lazy(() => import('./pages/About'))
const How = lazy(() => import('./pages/How'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const NotFound = lazy(() => import('./pages/NotFound'))

// 管理后台 - 懒加载
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const Interpretations = lazy(() => import('./pages/admin/Interpretations'))
const Questions = lazy(() => import('./pages/admin/Questions'))
const Cards = lazy(() => import('./pages/admin/Cards'))
const Rules = lazy(() => import('./pages/admin/Rules'))

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Suspense fallback={<LoadingOverlay message="加载中..." />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="quiz" element={<Quiz />} />
              <Route path="draw" element={<Draw />} />
              <Route path="result" element={<Result />} />
              <Route path="pay" element={<Pay />} />
              <Route path="about" element={<About />} />
              <Route path="how" element={<How />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
            </Route>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Interpretations />} />
              <Route path="interpretations" element={<Interpretations />} />
              <Route path="questions" element={<Questions />} />
              <Route path="cards" element={<Cards />} />
              <Route path="rules" element={<Rules />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <ToastContainer />
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
