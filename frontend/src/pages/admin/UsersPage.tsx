import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/useToast'
import api from '@/lib/api'
import * as XLSX from 'xlsx'
import {
  Plus, Pencil, Trash2, Loader2, Search, Users, X,
  ChevronLeft, ChevronRight, Download
} from 'lucide-react'

interface User {
  id: number
  nama: string
  email: string
  role: string
  cabang_id: number
  status: string
  nama_cabang: string
  created_at: string
}

const roles = [
  { value: 'kandidat', label: 'Kandidat' },
  { value: 'admin_cabang', label: 'Admin Cabang' },
  { value: 'admin_penempatan', label: 'Admin Penempatan' },
]

const empty = { nama: '', email: '', password: '', role: 'kandidat', cabang_id: '', status: 'aktif' }
const ITEMS_PER_PAGE = 10

export default function UsersPage() {
  const [data, setData] = useState<User[]>([])
  const [cabangList, setCabangList] = useState<{ id: number; nama_cabang: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editItem, setEditItem] = useState<User | null>(null)
  const [form, setForm] = useState<any>(empty)
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const load = () => {
    setLoading(true)
    Promise.all([api.get('/users'), api.get('/cabang')])
      .then(([u, c]) => { setData(u.data.data); setCabangList(c.data.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300)
  }

  const clearSearch = () => { setSearch(''); setDebouncedSearch('') }

  const handleExportExcel = () => {
    const rows = filtered.map((u, i) => ({
      'No': i + 1,
      'Nama': u.nama,
      'Email': u.email,
      'Status': u.status === 'aktif' ? 'Aktif' : 'Nonaktif',
      'Tanggal Dibuat': u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '—',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Users')
    ws['!cols'] = [
      { wch: 5 }, { wch: 30 }, { wch: 35 }, { wch: 10 }, { wch: 15 },
    ]
    XLSX.writeFile(wb, `Data_User_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const filtered = data.filter(u =>
    !debouncedSearch ||
    u.nama.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  useEffect(() => { setCurrentPage(1) }, [debouncedSearch])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const openCreate = () => { setEditItem(null); setForm(empty); setDialogOpen(true) }
  const openEdit = (item: User) => { setEditItem(item); setForm({ ...item, password: '' }); setDialogOpen(true) }

  const handleSave = async () => {
    if (!form.nama || !form.email || !form.role) {
      toast({ title: 'Isi semua field wajib', variant: 'destructive' }); return
    }
    if (!editItem && !form.password) {
      toast({ title: 'Password wajib diisi untuk user baru', variant: 'destructive' }); return
    }
    setSaving(true)
    try {
      const payload = { ...form, cabang_id: form.cabang_id || null }
      if (!payload.password) delete payload.password
      if (editItem) await api.put(`/users/${editItem.id}`, payload)
      else await api.post('/users', payload)
      toast({ title: editItem ? 'User diupdate' : 'User dibuat' })
      setDialogOpen(false); load()
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.response?.data?.message, variant: 'destructive' })
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/users/${deleteId}`)
      toast({ title: 'User dihapus' })
      setDeleteId(null); load()
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.response?.data?.message, variant: 'destructive' })
    }
  }

  const roleLabel: Record<string, string> = {
    kandidat: 'Kandidat',
    admin_cabang: 'Admin Cabang',
    admin_penempatan: 'Admin Penempatan',
  }

  const roleBadgeClass: Record<string, string> = {
    kandidat: 'bg-blue-50 text-blue-700 border border-blue-200',
    admin_cabang: 'bg-amber-50 text-amber-700 border border-amber-200',
    admin_penempatan: 'bg-[#1e3a5f] text-white border border-[#1e3a5f]',
  }

  const getInitials = (nama: string) =>
    nama.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  const avatarColor = (nama: string) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-green-100 text-green-700',
      'bg-purple-100 text-purple-700',
      'bg-orange-100 text-orange-700',
      'bg-pink-100 text-pink-700',
    ]
    return colors[nama.charCodeAt(0) % colors.length]
  }

  return (
    /* px-2.5 di layar <400px, px-4 di sm, px-6 di md+ */
    <div className="w-full min-w-0 space-y-3 px-2.5 sm:px-4 md:px-6 py-3 sm:py-5 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <h1 className="text-base sm:text-2xl font-bold text-foreground leading-tight truncate">
            Manajemen User
          </h1>
          <p className="text-[11px] sm:text-sm text-muted-foreground mt-0.5">
            Kelola akun pengguna sistem
          </p>
        </div>
        {/* Ikon saja di layar <400px, teks muncul di ≥400px */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="outline"
            onClick={handleExportExcel}
            className="h-8 sm:h-9 px-2 sm:px-3 text-xs border-gray-200 hover:bg-gray-50"
            disabled={loading || filtered.length === 0}
          >
            <Download size={14} className="shrink-0" />
            <span className="hidden min-[400px]:inline ml-1 whitespace-nowrap">Export</span>
          </Button>
          <Button
            onClick={openCreate}
            className="bg-[#1e3a5f] hover:bg-[#2d5a8a] h-8 sm:h-9 shrink-0 px-2 sm:px-3 text-xs"
          >
            <Plus size={14} className="shrink-0" />
            <span className="hidden min-[400px]:inline ml-1 whitespace-nowrap">Tambah User</span>
          </Button>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative w-full sm:max-w-md">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari nama atau email..."
          className="pl-8 pr-8 bg-white h-8 sm:h-9 text-xs sm:text-sm"
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
        />
        {search && (
          <button
            onClick={clearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* ── Card Container ── */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="px-3 py-2 border-b flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-gray-500" />
            <span className="font-medium text-gray-700 text-xs sm:text-sm">Daftar User</span>
            {!loading && (
              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                {filtered.length}
              </span>
            )}
          </div>
          {loading && <Loader2 size={12} className="animate-spin text-gray-400" />}
        </div>

        {/* ══ MOBILE LIST (< sm) — dioptimalkan hingga 320px ══ */}
        <div className="sm:hidden">
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="animate-spin mx-auto text-gray-300" size={24} />
              <p className="text-gray-400 text-xs mt-2">Memuat data...</p>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="py-12 text-center px-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                <Users size={18} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium text-xs">Tidak ada data</p>
              <p className="text-gray-400 text-[10px] mt-1">
                {debouncedSearch ? 'Coba ubah pencarian' : 'Belum ada user tersedia'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {paginatedData.map(item => (
                <div key={item.id} className="px-3 py-2.5 active:bg-gray-50 transition-colors">

                  {/* Baris 1: avatar + nama/email + status */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-[10px] shrink-0 ${avatarColor(item.nama)}`}>
                      {getInitials(item.nama)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-xs leading-tight truncate">
                        {item.nama}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">{item.email}</p>
                    </div>
                    <span className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border leading-tight ${
                      item.status === 'aktif'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {item.status === 'aktif' ? 'Aktif' : 'Off'}
                    </span>
                  </div>

                  {/* Baris 2: role + cabang */}
                  <div className="flex items-center gap-1.5 mt-1.5 pl-9 flex-wrap">
                    <span className={`inline-flex text-[9px] font-semibold px-1.5 py-0.5 rounded-full border leading-tight ${roleBadgeClass[item.role] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {roleLabel[item.role] || item.role}
                    </span>
                    {item.nama_cabang && (
                      <span className="text-[10px] text-gray-400 truncate" style={{ maxWidth: '120px' }}>
                        · {item.nama_cabang}
                      </span>
                    )}
                  </div>

                  {/* Baris 3: tombol aksi */}
                  <div className="flex items-center gap-1.5 mt-2 pl-9">
                    <button
                      onClick={() => openEdit(item)}
                      className="flex items-center gap-1 h-6 px-2.5 rounded-md border border-gray-200 bg-white text-gray-600 text-[10px] font-medium active:bg-gray-100 transition-colors"
                    >
                      <Pencil size={10} />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="flex items-center gap-1 h-6 px-2.5 rounded-md border border-red-100 bg-red-50 text-red-600 text-[10px] font-medium active:bg-red-100 transition-colors"
                    >
                      <Trash2 size={10} />
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mobile Pagination */}
          {!loading && filtered.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between px-3 py-2 border-t bg-gray-50/80">
              <span className="text-[10px] text-gray-500">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} / {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={currentPage === 1}
                  className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
                >
                  <ChevronLeft size={12} />
                </button>
                <span className="text-[10px] text-gray-600 font-medium px-1">
                  {currentPage}/{totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage === totalPages}
                  className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ══ DESKTOP TABLE (≥ sm = ≥640px) ══ */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide">Cabang</th>
                <th className="text-center px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-center px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center px-4 py-16">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <Loader2 size={20} className="animate-spin" />
                      <span className="text-sm">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center px-4 py-16">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Users size={24} className="text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium">Tidak ada data</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {debouncedSearch ? 'Coba ubah pencarian' : 'Belum ada user tersedia'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${avatarColor(item.nama)}`}>
                          {getInitials(item.nama)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{item.nama}</p>
                          <p className="text-xs text-gray-400">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${roleBadgeClass[item.role] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {roleLabel[item.role] || item.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {item.nama_cabang || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                        item.status === 'aktif'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        {item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => openEdit(item)}>
                          <Pencil size={14} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => setDeleteId(item.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Desktop Pagination */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50/80">
              <p className="text-xs text-gray-500">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} user
              </p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                  <ChevronLeft size={15} />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) pageNum = i + 1
                  else if (currentPage <= 3) pageNum = i + 1
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                  else pageNum = currentPage - 2 + i
                  return (
                    <Button key={pageNum} variant={currentPage === pageNum ? 'default' : 'ghost'} size="sm"
                      className={`h-8 w-8 p-0 text-xs ${currentPage === pageNum ? 'bg-[#1e3a5f] text-white hover:bg-[#2d5a8a]' : 'text-gray-600'}`}
                      onClick={() => setCurrentPage(pageNum)}>
                      {pageNum}
                    </Button>
                  )
                })}
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                  <ChevronRight size={15} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ DIALOG FORM ══ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {/* margin 8px kiri-kanan di layar sempit */}
        <DialogContent className="w-[calc(100vw-16px)] sm:max-w-md max-h-[92dvh] overflow-y-auto rounded-xl p-0">
          <div className="px-3 py-3 border-b bg-gray-50/80 rounded-t-xl">
            <h2 className="font-semibold text-sm text-gray-900">
              {editItem ? 'Edit User' : 'Tambah User Baru'}
            </h2>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {editItem ? 'Perbarui data pengguna' : 'Lengkapi informasi pengguna baru'}
            </p>
          </div>

          <div className="px-3 py-3 space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Nama <span className="text-red-500">*</span>
              </label>
              <Input value={form.nama} onChange={e => setForm((p: any) => ({ ...p, nama: e.target.value }))}
                placeholder="Nama lengkap" className="h-8 text-xs sm:text-sm" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <Input type="email" value={form.email} onChange={e => setForm((p: any) => ({ ...p, email: e.target.value }))}
                placeholder="email@contoh.com" className="h-8 text-xs sm:text-sm" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Password{' '}
                {editItem
                  ? <span className="font-normal text-gray-400">(kosongkan jika tidak diubah)</span>
                  : <span className="text-red-500">*</span>
                }
              </label>
              <Input type="password" value={form.password}
                onChange={e => setForm((p: any) => ({ ...p, password: e.target.value }))}
                placeholder={editItem ? '••••••••' : 'Min. 6 karakter'} className="h-8 text-xs sm:text-sm" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Role <span className="text-red-500">*</span></label>
              <Select value={form.role} onValueChange={v => setForm((p: any) => ({ ...p, role: v }))}>
                <SelectTrigger className="h-8 bg-white text-xs sm:text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {(form.role === 'admin_cabang' || form.role === 'kandidat') && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Cabang</label>
                <Select value={form.cabang_id ? String(form.cabang_id) : ''} onValueChange={v => setForm((p: any) => ({ ...p, cabang_id: v }))}>
                  <SelectTrigger className="h-8 bg-white text-xs sm:text-sm"><SelectValue placeholder="Pilih cabang..." /></SelectTrigger>
                  <SelectContent>
                    {cabangList.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nama_cabang}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Status</label>
              <Select value={form.status} onValueChange={v => setForm((p: any) => ({ ...p, status: v }))}>
                <SelectTrigger className="h-8 bg-white text-xs sm:text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="px-3 py-2.5 border-t bg-gray-50/80 rounded-b-xl flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-7 px-3 text-[11px]">
              Batal
            </Button>
            <Button onClick={handleSave} disabled={saving} className="h-7 px-3 text-[11px] bg-[#1e3a5f] hover:bg-[#2d5a8a]">
              {saving && <Loader2 size={11} className="mr-1 animate-spin" />}
              {editItem ? 'Simpan' : 'Buat User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══ DIALOG HAPUS ══ */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="w-[calc(100vw-16px)] sm:max-w-sm rounded-xl p-0">
          <div className="px-3 py-3.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={15} className="text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-xs sm:text-sm font-semibold text-gray-900">Hapus User</DialogTitle>
                <p className="text-[10px] text-gray-400">Tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Yakin ingin menghapus user ini? Semua data terkait akan ikut terhapus secara permanen.
            </p>
          </div>
          <div className="px-3 py-2.5 border-t bg-gray-50/80 rounded-b-xl flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="h-7 px-3 text-[11px]">
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="h-7 px-3 text-[11px]">
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}