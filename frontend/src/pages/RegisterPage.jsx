import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be 6+ characters')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
      <div className="relative w-full max-w-sm mx-4">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[#0d0d14]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white font-display">NoteCollab</h1>
        </div>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-white/90 mb-6">Create account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', field: 'name', type: 'text', ph: 'John Doe' },
              { label: 'Email', field: 'email', type: 'email', ph: 'you@email.com' },
              { label: 'Password', field: 'password', type: 'password', ph: '••••••••' },
            ].map(({ label, field, type, ph }) => (
              <div key={field}>
                <label className="text-xs text-white/40 block mb-1.5">{label}</label>
                <input type={type} required value={form[field]}
                  onChange={e => setForm({ ...form, [field]: e.target.value })} placeholder={ph}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-amber-400/50 transition-colors" />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full py-3 mt-2 rounded-xl bg-amber-400 text-[#0d0d14] font-bold text-sm hover:bg-amber-300 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-[#0d0d14]/30 border-t-[#0d0d14] rounded-full animate-spin" />}
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-xs text-white/30 mt-5">
            Have an account? <Link to="/login" className="text-amber-400/80 hover:text-amber-400">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}