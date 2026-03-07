import { useState, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import toast from 'react-hot-toast'
import useNoteStore from '../store/noteStore'
import useAuthStore from '../store/authStore'
import CollabPanel from './CollabPanel'

const COLORS = ['#f59e0b','#10b981','#6366f1','#ec4899','#3b82f6','#ef4444','#8b5cf6']

function Btn({ onClick, active, children, title }) {
  return (
    <button onClick={onClick} title={title}
      className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all
        ${active ? 'bg-amber-400/20 text-amber-400' : 'text-white/45 hover:text-white/75 hover:bg-white/[0.06]'}`}>
      {children}
    </button>
  )
}

export default function Editor({ note, showCollab, onToggleCollab }) {
  const { updateNote, deleteNote } = useNoteStore()
  const { user } = useAuthStore()
  const [title, setTitle] = useState(note.title)
  const [tags, setTags] = useState(note.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [color, setColor] = useState(note.color || '#f59e0b')
  const [pinned, setPinned] = useState(note.pinned || false)
  const [showColors, setShowColors] = useState(false)
  const timer = useRef(null)

  const isOwner = note.owner?._id === user?._id || note.owner === user?._id
  const canEdit = isOwner || note.collaborators?.some(
    c => (c.user?._id === user?._id || c.user === user?._id) && ['edit','admin'].includes(c.permission)
  )

  const save = useCallback((updates) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      try { await updateNote(note._id, updates) }
      catch { toast.error('Save failed') }
    }, 800)
  }, [note._id])

  const editor = useEditor({
    extensions: [StarterKit, Underline, Highlight, TaskList, TaskItem.configure({ nested: true })],
    content: note.content || '',
    editable: canEdit,
    onUpdate({ editor }) {
      save({ content: editor.getHTML(), contentText: editor.getText() })
    },
  })

  if (!editor) return null

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const t = tagInput.trim().toLowerCase()
      if (!tags.includes(t)) {
        const next = [...tags, t]
        setTags(next)
        save({ tags: next })
      }
      setTagInput('')
    }
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/[0.05] flex-wrap gap-2">
        <div className="flex items-center gap-0.5 flex-wrap">
          <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><b>B</b></Btn>
          <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><i>I</i></Btn>
          <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}><u>U</u></Btn>
          <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}><s>S</s></Btn>
          <div className="w-px h-4 bg-white/10 mx-1"/>
          <Btn onClick={() => editor.chain().focus().toggleHeading({level:1}).run()} active={editor.isActive('heading',{level:1})}>H1</Btn>
          <Btn onClick={() => editor.chain().focus().toggleHeading({level:2}).run()} active={editor.isActive('heading',{level:2})}>H2</Btn>
          <div className="w-px h-4 bg-white/10 mx-1"/>
          <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>• List</Btn>
          <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>1. List</Btn>
          <Btn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')}>☑ Tasks</Btn>
          <div className="w-px h-4 bg-white/10 mx-1"/>
          <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')}>{'<>'} Code</Btn>
          <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>" Quote</Btn>
          <Btn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')}>🖊 Mark</Btn>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onToggleCollab}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all
              ${showCollab ? 'bg-indigo-500/20 border-indigo-400/30 text-indigo-300' : 'border-white/[0.07] text-white/45 hover:text-white/75'}`}>
            👥 Collab {note.collaborators?.length > 0 && `(${note.collaborators.length})`}
          </button>
          {isOwner && (
            <button onClick={async () => { if(confirm('Delete?')) { await deleteNote(note._id); toast.success('Deleted') }}}
              className="p-1.5 text-white/25 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
              🗑
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-10 py-8">
          {/* Title row */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative">
              <div className="w-3 h-3 rounded-full cursor-pointer ring-2 ring-white/10 hover:ring-white/30"
                style={{ backgroundColor: color }} onClick={() => setShowColors(v => !v)}/>
              {showColors && (
                <div className="absolute top-5 left-0 z-20 flex gap-1.5 bg-[#1a1a2e] border border-white/[0.08] rounded-xl p-2 shadow-xl">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => { setColor(c); setShowColors(false); updateNote(note._id, { color: c }) }}
                      className="w-5 h-5 rounded-full hover:ring-2 ring-white/40 transition-all" style={{ backgroundColor: c }}/>
                  ))}
                </div>
              )}
            </div>
            <input value={title} onChange={e => setTitle(e.target.value)}
              onBlur={() => save({ title })}
              disabled={!canEdit}
              placeholder="Untitled Note"
              className="flex-1 bg-transparent text-3xl font-bold text-white focus:outline-none placeholder-white/15 font-display"/>
            <button onClick={async () => { const next = !pinned; setPinned(next); await updateNote(note._id, { pinned: next }) }}
              className={`text-xl ${pinned ? 'text-amber-400' : 'text-white/20 hover:text-amber-400'} transition-colors`}>⭐</button>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {tags.map(t => (
              <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-white/[0.06] text-white/50 border border-white/[0.06]">
                {t}
                {canEdit && <button onClick={() => { const n = tags.filter(x => x !== t); setTags(n); save({ tags: n }) }} className="text-white/30 hover:text-red-400 text-[10px]">✕</button>}
              </span>
            ))}
            {canEdit && (
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleAddTag}
                placeholder="+ tag" className="bg-transparent text-xs text-white/40 placeholder-white/20 focus:outline-none w-14"/>
            )}
          </div>

          {/* Editor */}
          <div className="border-l-2 border-white/[0.04] pl-6">
            <EditorContent editor={editor}/>
          </div>
        </div>

        {showCollab && <CollabPanel note={note} isOwner={isOwner} onClose={onToggleCollab}/>}
      </div>
    </main>
  )
}