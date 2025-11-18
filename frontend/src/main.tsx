import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import './i18n'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './pages/Layout'
import Home from './pages/Home'
import About from './pages/About'
import How from './pages/How'
import Quiz from './pages/Quiz'
import Draw from './pages/Draw'
import Result from './pages/Result'
import Pay from './pages/Pay'
import Callback from './pages/Callback'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<How />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/draw" element={<Draw />} />
            <Route path="/result" element={<Result />} />
            <Route path="/pay" element={<Pay />} />
            <Route path="/pay/callback" element={<Callback />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
