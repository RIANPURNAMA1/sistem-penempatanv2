import { create } from 'zustand'

interface User {
  id: number
  nama: string
  email: string
  role: 'kandidat' | 'admin_cabang' | 'admin_penempatan'
  cabang_id: number | null
  nama_cabang?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

const stored = localStorage.getItem('user')
const token = localStorage.getItem('token')

export const useAuthStore = create<AuthState>((set) => ({
  user: stored ? JSON.parse(stored) : null,
  token: token || null,
  isAuthenticated: !!(stored && token),
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    set({ user, token, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false })
  }
}))
