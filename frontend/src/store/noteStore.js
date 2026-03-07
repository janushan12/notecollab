import { create } from 'zustand'
import api from '../lib/api'

const useNoteStore = create((set) => ({
  notes: [],
  activeNote: null,
  loading: false,

  fetchNotes: async (params = {}) => {
    set({ loading: true })
    const { data } = await api.get('/notes', { params })
    set({ notes: data, loading: false })
  },

  createNote: async () => {
    const { data } = await api.post('/notes', { title: 'Untitled Note', content: '' })
    set((s) => ({ notes: [data, ...s.notes], activeNote: data }))
    return data
  },

  updateNote: async (id, updates) => {
    const { data } = await api.put(`/notes/${id}`, updates)
    set((s) => ({
      notes: s.notes.map((n) => (n._id === id ? data : n)),
      activeNote: s.activeNote?._id === id ? data : s.activeNote,
    }))
  },

  deleteNote: async (id) => {
    await api.delete(`/notes/${id}`)
    set((s) => ({
      notes: s.notes.filter((n) => n._id !== id),
      activeNote: s.activeNote?._id === id ? null : s.activeNote,
    }))
  },

  setActiveNote: (note) => set({ activeNote: note }),

  addCollaborator: async (noteId, email, permission) => {
    const { data } = await api.post(`/notes/${noteId}/collaborators`, { email, permission })
    set((s) => ({
      notes: s.notes.map((n) => (n._id === noteId ? data : n)),
      activeNote: s.activeNote?._id === noteId ? data : s.activeNote,
    }))
  },

  updateCollaborator: async (noteId, userId, permission) => {
    const { data } = await api.put(`/notes/${noteId}/collaborators/${userId}`, { permission })
    set((s) => ({
      notes: s.notes.map((n) => (n._id === noteId ? data : n)),
      activeNote: s.activeNote?._id === noteId ? data : s.activeNote,
    }))
  },

  removeCollaborator: async (noteId, userId) => {
    const { data } = await api.delete(`/notes/${noteId}/collaborators/${userId}`)
    set((s) => ({
      notes: s.notes.map((n) => (n._id === noteId ? data : n)),
      activeNote: s.activeNote?._id === noteId ? data : s.activeNote,
    }))
  },
}))

export default useNoteStore