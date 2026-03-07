const ALL_TAGS = ['work', 'dev', 'personal', 'planning', 'api', 'learning']

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function NoteCard({ note, active, onClick }) {
  return (
    <div onClick={onClick}
      className={`relative cursor-pointer rounded-xl p-4 border transition-all
        ${active ? 'border-amber-400/50 bg-white/[0.07]' : 'border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10'}`}>
      {note.pinned && (
        <svg className="absolute top-3 right-3 w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      )}
      <div className="flex items-start gap-2 mb-1.5">
        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: note.color || '#f59e0b' }}/>
        <p className="text-sm font-semibold text-white/90 truncate pr-4">{note.title}</p>
      </div>
      <p className="text-xs text-white/35 ml-4 mb-2 line-clamp-2 leading-relaxed">{note.contentText || 'Empty note...'}</p>
      <div className="ml-4 flex gap-1 flex-wrap">
        {note.tags?.slice(0, 2).map(t => (
          <span key={t} className="px-2 py-0.5 rounded-full text-[10px] bg-white/[0.06] text-white/45 border border-white/[0.05]">{t}</span>
        ))}
      </div>
      <p className="text-[10px] text-white/20 ml-4 mt-1.5">{timeAgo(note.updatedAt)}</p>
    </div>
  )
}

export default function Sidebar({ notes, activeNote, onSelect, tagFilter, onTagFilter }) {
  const pinned = notes.filter(n => n.pinned)
  const others  = notes.filter(n => !n.pinned)

  return (
    <aside className="w-72 border-r border-white/[0.05] flex flex-col bg-[#0d0d14] overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-white/[0.05] flex items-center justify-between">
        <span className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">All Notes</span>
        <span className="text-[10px] text-white/20 bg-white/[0.04] px-2 py-0.5 rounded-full">{notes.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {pinned.length > 0 && <>
          <p className="text-[10px] text-white/20 uppercase tracking-widest px-1">Pinned</p>
          {pinned.map(n => <NoteCard key={n._id} note={n} active={activeNote?._id === n._id} onClick={() => onSelect(n)}/>)}
          {others.length > 0 && <p className="text-[10px] text-white/20 uppercase tracking-widest px-1 pt-2">Others</p>}
        </>}
        {others.map(n => <NoteCard key={n._id} note={n} active={activeNote?._id === n._id} onClick={() => onSelect(n)}/>)}
        {notes.length === 0 && <p className="text-xs text-white/25 text-center py-12">No notes found</p>}
      </div>

      <div className="p-4 border-t border-white/[0.05]">
        <p className="text-[10px] text-white/25 uppercase tracking-widest mb-2">Filter by tag</p>
        <div className="flex flex-wrap gap-1.5">
          {tagFilter && (
            <button onClick={() => onTagFilter('')} className="px-2.5 py-1 rounded-full text-xs bg-amber-400/15 text-amber-400 border border-amber-400/25">✕ {tagFilter}</button>
          )}
          {ALL_TAGS.filter(t => t !== tagFilter).map(tag => (
            <button key={tag} onClick={() => onTagFilter(tag)}
              className="px-2.5 py-1 rounded-full text-xs border border-white/[0.07] text-white/35 hover:border-amber-400/30 hover:text-amber-400 transition-all">{tag}</button>
          ))}
        </div>
      </div>
    </aside>
  )
}