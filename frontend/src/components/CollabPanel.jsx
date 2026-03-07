import { useState } from 'react'
import toast from 'react-hot-toast'
import useNoteStore from '../store/noteStore'
import useAuthStore from '../store/authStore'
import api from '../lib/api'

export default function CollabPanel({ note, isOwner, onClose }) {
  const { addCollaborator, updateCollaborator, removeCollaborator } = useNoteStore()
  const { user } = useAuthStore()
  const [email, setEmail]       = useState('')
  const [perm, setPerm]         = useState('edit')
  const [loading, setLoading]   = useState(false)
  const [suggestions, setSugg]  = useState([])

  const searchUsers = async (q) => {
    setEmail(q)
    if (q.length < 2) return setSugg([])
    try { const { data } = await api.get('/users/search', { params: { q } }); setSugg(data) }
    catch { setSugg([]) }
  }

  const invite = async () => {
    if (!email.trim()) return
    setLoading(true)
    try {
      await addCollaborator(note._id, email.trim(), perm)
      toast.success(`${email} added`)
      setEmail(''); setSugg([])
    } catch (err) { toast.error(err.response?.data?.message || 'Invite failed') }
    finally { setLoading(false) }
  }

  return (
    <aside className="w-72 border-l border-white/[0.05] flex flex-col bg-[#0f0f1a]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
        <h3 className="text-sm font-semibold text-white/80">Collaborators</h3>
        <button onClick={onClose} className="text-white/30 hover:text-white/60 text-lg leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Invite section */}
        {isOwner && (
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-widest mb-3">Invite by Email</p>
            <div className="relative">
              <input value={email} onChange={e => searchUsers(e.target.value)}
                placeholder="user@email.com"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white/70 placeholder-white/25 focus:outline-none focus:border-amber-400/40"/>
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-[#1a1a2e] border border-white/[0.08] rounded-lg overflow-hidden shadow-xl">
                  {suggestions.map(u => (
                    <button key={u._id} onClick={() => { setEmail(u.email); setSugg([]) }}
                      className="w-full text-left px-3 py-2 hover:bg-white/[0.05]">
                      <p className="text-xs text-white/70 font-medium">{u.name}</p>
                      <p className="text-[10px] text-white/35">{u.email}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <select value={perm} onChange={e => setPerm(e.target.value)}
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-2 text-xs text-white/60 focus:outline-none">
                <option value="view">Can view</option>
                <option value="edit">Can edit</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={invite} disabled={loading || !email.trim()}
                className="px-3 py-2 bg-amber-400 text-[#0d0d14] text-xs font-bold rounded-lg hover:bg-amber-300 disabled:opacity-50">
                {loading ? '...' : 'Invite'}
              </button>
            </div>
          </div>
        )}

        {/* Members list */}
        <div>
          <p className="text-[10px] text-white/25 uppercase tracking-widest mb-3">Members</p>
          <div className="space-y-2">
            {/* Owner */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-xs font-bold text-[#0d0d14]">
                  {note.owner?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-medium text-white/80">{note.owner?.name}</p>
                  <p className="text-[10px] text-white/35">{note.owner?.email}</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400">Owner</span>
            </div>

            {note.collaborators?.map(c => {
              const u = c.user
              if (!u) return null
              const uid = u._id || u
              const isSelf = uid === user?._id
              return (
                <div key={uid} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] group">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-white/70">{u.name} {isSelf ? '(you)' : ''}</p>
                      <p className="text-[10px] text-white/35">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isOwner ? (
                      <select value={c.permission}
                        onChange={e => updateCollaborator(note._id, uid, e.target.value).then(() => toast.success('Updated'))}
                        className="text-[10px] bg-indigo-500/15 text-indigo-400 rounded-full px-1.5 py-0.5 border-0 focus:outline-none cursor-pointer">
                        <option value="view">view</option>
                        <option value="edit">edit</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400">{c.permission}</span>
                    )}
                    {(isOwner || isSelf) && (
                      <button onClick={() => removeCollaborator(note._id, uid).then(() => toast.success('Removed'))}
                        className="opacity-0 group-hover:opacity-100 p-1 text-white/25 hover:text-red-400 transition-all">✕</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}