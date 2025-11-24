import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Section from '../../components/Section'
import axios from 'axios'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await axios.post('/api/auth/login', { username, password })
      localStorage.setItem('admin_token', res.data.access_token)
      navigate('/admin/questions')
    } catch {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F0E5] p-4">
      <div className="w-full max-w-md">
        <Section title="Admin Login">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6B5542]">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D4A373] focus:ring-[#D4A373] p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B5542]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D4A373] focus:ring-[#D4A373] p-2 border"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#2B1F16] bg-[#D4A373] hover:bg-[#C49BA3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4A373]"
            >
              Sign in
            </button>
          </form>
        </Section>
      </div>
    </div>
  )
}
