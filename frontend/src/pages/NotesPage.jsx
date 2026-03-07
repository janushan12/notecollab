import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import useNoteStore from '../store/noteStore'
import useAuthStore from '../store/authStore'
import Sidebar from '../components/Sidebar'
import Editor from '../components/Editor'

export default function NotesPage() {
  const { notes, activeNote, fetchNotes, createNote, setActiveNote } = useNoteStore()
  const { user, logout } = useAuthStore()
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [showCollab, setShowCollab] = useState(false)

  useEffect(() => { fetchNotes() }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      fetchNotes({ search: search || undefined, tag: tagFilter || undefined })
    }, 300)
    return () => clearTimeout(t)
  }, [search, tagFilter])

  const handleNewNote = async () => {
    try { await createNote(); toast.success('Note created') }
    catch { toast.error('Failed to create note') }
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] flex flex-col">
      {/* Top Navigation */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-white/[0.05] sticky top-0 z-30 bg-[#0d0d14]/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#0d0d14]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <span className="font-bold text-white font-display text-lg">NoteCollab</span>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search notes, tags, content..."
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-amber-400/40 transition-colors" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleNewNote}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold hover:bg-amber-400/20 transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            New Note
          </button>

          <div className="group relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-[#0d0d14] cursor-pointer">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="absolute right-0 top-full mt-2 w-44 bg-[#1a1a2e] border border-white/[0.08] rounded-xl py-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
              <div className="px-3 py-2 border-b border-white/[0.05] mb-1">
                <p className="text-xs font-medium text-white/80">{user?.name}</p>
                <p className="text-[11px] text-white/40">{user?.email}</p>
              </div>
              <button onClick={() => { logout(); toast('Logged out') }}
                className="w-full text-left px-3 py-2 text-xs text-white/50 hover:text-red-400 transition-colors">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar notes={notes} activeNote={activeNote} onSelect={setActiveNote} tagFilter={tagFilter} onTagFilter={setTagFilter} />
        {activeNote ? (
          <Editor key={activeNote._id} note={activeNote} showCollab={showCollab} onToggleCollab={() => setShowCollab(v => !v)} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-white/25 text-sm mb-4">Select a note or create a new one</p>
            <button onClick={handleNewNote}
              className="px-4 py-2 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm font-medium hover:bg-amber-400/20 transition-all">
              + New Note
            </button>
          </div>
        )}
      </div>
    </div>
  )
}