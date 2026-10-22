import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL || ''
const isLocalhost = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')

const api = axios.create({
  baseURL: isLocalhost ? '/api' : apiUrl,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  // Jangan kirim Content-Type untuk FormData: browser yang menambahkan parameter
  // boundary multipart. Kalau header di-set manual tanpa boundary, server gagal
  // parses body ("Multipart: Boundary not found").
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers.delete('Content-Type')
  }
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

/** Asal backend untuk berkas statis (/uploads). Kosong saat memakai proxy dev. */
export const apiOrigin = isLocalhost ? '' : apiUrl.replace(/\/api\/?$/, '')

/** Ubah path berkas backend menjadi URL yang bisa dibuka browser. */
export const fileUrl = (p?: string | null): string => {
  if (!p) return ''
  if (/^https?:\/\//i.test(p)) return p
  return `${apiOrigin}${p.startsWith('/') ? p : `/${p}`}`
}

export default api
