import './App.css'

import { Routes, Route } from 'react-router-dom'
import Layout from './pages/Layout'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Draw from './pages/Draw'
import Result from './pages/Result'
import Pay from './pages/Pay'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import Interpretations from './pages/admin/Interpretations'
import Orders from './pages/admin/Orders'
import Settings from './pages/admin/Settings'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="draw" element={<Draw />} />
        <Route path="result" element={<Result />} />
        <Route path="pay" element={<Pay />} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Interpretations />} />
        <Route path="interpretations" element={<Interpretations />} />
        <Route path="orders" element={<Orders />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
