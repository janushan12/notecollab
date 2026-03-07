import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import NotesPage from './pages/NotesPage'

function ProtectedRoute({ children }) {
  const { token, user, loading } = useAuthStore()
  if (loading) return (
    <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
    </div>
  )
  return token && user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { fetchMe, token } = useAuthStore()

  useEffect(() => {
    if (token) fetchMe()
    else useAuthStore.setState({ loading: false })
  }, [])

  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}