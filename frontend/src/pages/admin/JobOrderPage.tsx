import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, Badge, Label, Textarea } from '@/components/ui/components'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/useToast'
import api from '@/lib/api'
import { Plus, Search, Edit, Trash2, Loader2, FileText, X, Eye } from 'lucide-react'

// Konfigurasi warna badge berdasarkan status
const statusConfig: Record<string, { label: string; variant: "secondary" | "outline" | "default" | "destructive" | "success" | "warning" }> = {
  'Menunggu': { label: 'Menunggu', variant: 'secondary' },
  'Lulus': { label: 'Lulus', variant: 'success' },
  'Tidak Lulus': { label: 'Tidak Lulus', variant: 'destructive' },
  'Tidak Hadir': { label: 'Tidak Hadir', variant: 'warning' },
}

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export default function JobOrderPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailItem, setDetailItem] = useState<any>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [kandidatSearch, setKandidatSearch] = useState('')
  
  const [kandidats, setKandidats] = useState<any[]>([])
  const [perusahaans, setPerusahaans] = useState<any[]>([])
  
  const [form, setForm] = useState({
    kandidat_ids: [] as number[],
    perusahaan_id: '',
    nomor: '',
    tanggal_terbit: '',
    detail_job_order: '',
    bidang_ssw: '',
    nama_grup: '',
    link_grup: '',
    biaya_awal: '',
    biaya_akhir: '',
    tanggal_cv: '',
    pic_cv: '',
    tanggal_mensetsu_1: '',
    tanggal_mensetsu_2: '',
    tanggal_mensetsu_3: '',
    status_kelulusan: 'Menunggu',
  })

  // Load data saat komponen pertama kali dibuka
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true)
      await Promise.all([
        fetchData(),
        fetchKandidats(),
        fetchPerusahaans()
      ])
      setLoading(false)
    }
    loadAllData()
  }, [])

  const fetchData = async () => {
    try {
      const r = await api.get('/joborder')
      setData(r.data.data || [])
    } catch (error) {
      console.error("Error fetch Job Order:", error)
    }
  }

  const fetchKandidats = async () => {
    try {
      const r = await api.get('/kandidat?status=approved')
      const kandidatsData = r.data.data || []
      const approvedKandidats = kandidatsData.filter((k: any) => k.status_formulir === 'approved')
      setKandidats(approvedKandidats)
    } catch (error) {
      console.error("Error fetch Kandidat:", error)
    }
  }

  const fetchPerusahaans = async () => {
    try {
      const r = await api.get('/perusahaan')
      setPerusahaans(r.data.data || [])
    } catch (error) {
      console.error("Error fetch Perusahaan:", error)
    }
  }

  const handleSave = async () => {
    if (form.kandidat_ids.length === 0) {
      toast({ title: 'Pilih minimal satu kandidat', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const payload = {
        kandidat_ids: form.kandidat_ids,
        perusahaan_id: form.perusahaan_id ? parseInt(form.perusahaan_id) : null,
        nomor: form.nomor,
        tanggal_terbit: form.tanggal_terbit,
        detail_job_order: form.detail_job_order,
        bidang_ssw: form.bidang_ssw,
        nama_grup: form.nama_grup,
        link_grup: form.link_grup,
        biaya_awal: form.biaya_awal ? parseFloat(form.biaya_awal) : 0,
        biaya_akhir: form.biaya_akhir ? parseFloat(form.biaya_akhir) : 0,
        tanggal_cv: form.tanggal_cv,
        pic_cv: form.pic_cv,
        tanggal_mensetsu_1: form.tanggal_mensetsu_1,
        tanggal_mensetsu_2: form.tanggal_mensetsu_2,
        tanggal_mensetsu_3: form.tanggal_mensetsu_3,
        status_kelulusan: form.status_kelulusan,
      }
      
      if (editingId) {
        await api.put(`/joborder/${editingId}`, payload)
        toast({ title: 'Berhasil!', description: 'Data berhasil diupdate.' })
      } else {
        await api.post('/joborder', payload)
        toast({ title: 'Berhasil!', description: `Data berhasil ditambahkan untuk ${form.kandidat_ids.length} kandidat.` })
      }
      
      setShowModal(false)
      resetForm()
      fetchData()
    } catch (error: any) {
      console.error('Save error:', error)
      toast({ title: 'Gagal!', description: error?.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item: any) => {
    setEditingId(item.id)
    setForm({
      kandidat_ids: item.kandidat_ids || [],
      perusahaan_id: item.perusahaan_id ? String(item.perusahaan_id) : '',
      nomor: item.nomor || '',
      tanggal_terbit: item.tanggal_terbit || '',
      detail_job_order: item.detail_job_order || '',
      bidang_ssw: item.bidang_ssw || '',
      nama_grup: item.nama_grup || '',
      link_grup: item.link_grup || '',
      biaya_awal: item.biaya_awal || '',
      biaya_akhir: item.biaya_akhir || '',
      tanggal_cv: item.tanggal_cv || '',
      pic_cv: item.pic_cv || '',
      tanggal_mensetsu_1: item.tanggal_mensetsu_1 || '',
      tanggal_mensetsu_2: item.tanggal_mensetsu_2 || '',
      tanggal_mensetsu_3: item.tanggal_mensetsu_3 || '',
      status_kelulusan: item.status_kelulusan || 'Menunggu',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return
    try {
      await api.delete(`/joborder/${id}`)
      toast({ title: 'Berhasil!', description: 'Data telah dihapus.' })
      fetchData()
    } catch (error) {
      toast({ title: 'Gagal!', description: 'Tidak bisa menghapus data.', variant: 'destructive' })
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setForm({
      kandidat_ids: [], perusahaan_id: '', nomor: '', tanggal_terbit: '',
      detail_job_order: '', bidang_ssw: '', nama_grup: '', link_grup: '',
      biaya_awal: '', biaya_akhir: '', tanggal_cv: '', pic_cv: '',
      tanggal_mensetsu_1: '', tanggal_mensetsu_2: '', tanggal_mensetsu_3: '',
      status_kelulusan: 'Menunggu',
    })
  }

  const formatDate = (date: string) => {
    if (!date) return '-'
    const d = new Date(date)
    return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`
  }

  const filteredData = data.filter(item => {
    const searchLower = search.toLowerCase()
    return (
      item.nama_kandidat?.toLowerCase().includes(searchLower) ||
      item.nama_perusahaan?.toLowerCase().includes(searchLower) ||
      item.nomor?.toLowerCase().includes(searchLower) ||
      item.bidang_ssw?.toLowerCase().includes(searchLower)
    )
  })

  const filteredKandidats = kandidats.filter(k => {
    const searchLower = kandidatSearch.toLowerCase()
    return !kandidatSearch || 
      (k.nama_romaji || k.nama)?.toLowerCase().includes(searchLower) ||
      k.nama_katakana?.toLowerCase().includes(searchLower)
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Job Order / Mensetsu</h1>
        <Button onClick={() => { resetForm(); setShowModal(true) }}>
          <Plus size={16} className="mr-2" /> Tambah Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative w-full max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari data..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-2">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-sm text-muted-foreground">Memuat data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">Tidak ada data ditemukan.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="h-10 px-3 text-left font-medium">No.</th>
                    <th className="h-10 px-3 text-left font-medium">Perusahaan</th>
                    <th className="h-10 px-3 text-left font-medium">Kandidat</th>
                    <th className="h-10 px-3 text-left font-medium">Bidang SSW</th>
                    <th className="h-10 px-3 text-right font-medium">Biaya Awal</th>
                    <th className="h-10 px-3 text-right font-medium">Biaya Akhir</th>
                    <th className="h-10 px-3 text-left font-medium">Status</th>
                    <th className="h-10 px-3 text-center font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, i) => (
                    <tr key={item.id} className="border-b transition-colors hover:bg-muted/30">
                      <td className="p-3">{i + 1}</td>
                      <td className="p-3">{item.nama_perusahaan || '-'}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {item.nama_kandidat ? item.nama_kandidat.split(', ').map((nama: string, idx: number) => (
                            <span key={idx} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {nama.trim()}
                            </span>
                          )) : '-'}
                        </div>
                      </td>
                      <td className="p-3">{item.bidang_ssw || '-'}</td>
                      <td className="p-3 text-right">{item.biaya_awal ? `Rp ${Number(item.biaya_awal).toLocaleString('id-ID')}` : '-'}</td>
                      <td className="p-3 text-right">{item.biaya_akhir ? `Rp ${Number(item.biaya_akhir).toLocaleString('id-ID')}` : '-'}</td>
                      <td className="p-3">
                        <Badge variant={statusConfig[item.status_kelulusan]?.variant || 'secondary'}>
                          {item.status_kelulusan}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setDetailItem(item); setShowDetailModal(true) }}>
                            <Eye size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                            <Edit size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 sticky top-0 z-10">
              <CardTitle>{editingId ? 'Update' : 'Tambah'} Job Order</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>No. Job Order</Label>
                  <Input value={form.nomor} onChange={e => setForm(p => ({ ...p, nomor: e.target.value }))} placeholder="Contoh: JO-2024-001" />
                </div>

                <div className="space-y-2">
                  <Label>Tanggal Terbit</Label>
                  <Input type="date" value={form.tanggal_terbit} onChange={e => setForm(p => ({ ...p, tanggal_terbit: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Pilih Kandidat * ({form.kandidat_ids.length} dipilih)</Label>
                    {filteredKandidats.length > 0 && (
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                        onClick={() => {
                          if (form.kandidat_ids.length === filteredKandidats.length) {
                            setForm(p => ({ ...p, kandidat_ids: [] }))
                          } else {
                            setForm(p => ({ ...p, kandidat_ids: filteredKandidats.map(k => k.id) }))
                          }
                        }}
                      >
                        {form.kandidat_ids.length === filteredKandidats.length ? 'Unselect All' : 'Select All'}
                      </button>
                    )}
                  </div>
                  <Input 
                    placeholder="Cari kandidat..." 
                    value={kandidatSearch}
                    onChange={e => setKandidatSearch(e.target.value)}
                    className="mb-2"
                  />
                  <div className="border rounded-md max-h-56 overflow-y-auto p-2 space-y-1">
                    {kandidats.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-2">Tidak ada kandidat</p>
                    ) : (
                      filteredKandidats.map(k => (
                        <label key={k.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.kandidat_ids.includes(k.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setForm(p => ({ ...p, kandidat_ids: [...p.kandidat_ids, k.id] }))
                              } else {
                                setForm(p => ({ ...p, kandidat_ids: p.kandidat_ids.filter(id => id !== k.id) }))
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{k.nama_romaji || k.nama}</span>
                          {k.nama_katakana && <span className="text-xs text-muted-foreground">({k.nama_katakana})</span>}
                        </label>
                      ))
                    )}
                  </div>
                  {form.kandidat_ids.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {form.kandidat_ids.slice(0, 5).map(id => {
                        const k = kandidats.find(k => k.id === id)
                        return k ? (
                          <span key={id} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            {k.nama_romaji || k.nama}
                            <button 
                              type="button"
                              onClick={() => setForm(p => ({ ...p, kandidat_ids: p.kandidat_ids.filter(i => i !== id) }))}
                              className="hover:text-destructive"
                            >×</button>
                          </span>
                        ) : null
                      })}
                      {form.kandidat_ids.length > 5 && (
                        <span className="text-xs text-muted-foreground self-center">+{form.kandidat_ids.length - 5} lagi</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Perusahaan</Label>
                  <Select value={form.perusahaan_id} onValueChange={v => setForm(p => ({ ...p, perusahaan_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Pilih Perusahaan" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak Ada</SelectItem>
                      {perusahaans.map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.nama_perusahaan}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Bidang SSW</Label>
                  <Input value={form.bidang_ssw} onChange={e => setForm(p => ({ ...p, bidang_ssw: e.target.value }))} placeholder="Misal: Food Service" />
                </div>

                <div className="space-y-2">
                  <Label>Nama Grup</Label>
                  <Input value={form.nama_grup} onChange={e => setForm(p => ({ ...p, nama_grup: e.target.value }))} placeholder="Nama grup WhatsApp" />
                </div>

                <div className="space-y-2">
                  <Label>Link Grup</Label>
                  <Input value={form.link_grup} onChange={e => setForm(p => ({ ...p, link_grup: e.target.value }))} placeholder="https://..." />
                </div>

                <div className="space-y-2">
                  <Label>Biaya Awal</Label>
                  <Input type="number" value={form.biaya_awal} onChange={e => setForm(p => ({ ...p, biaya_awal: e.target.value }))} placeholder="0" />
                </div>

                <div className="space-y-2">
                  <Label>Biaya Akhir (Akumulasi)</Label>
                  <Input type="number" value={form.biaya_akhir} onChange={e => setForm(p => ({ ...p, biaya_akhir: e.target.value }))} placeholder="0" />
                </div>

                <div className="space-y-2">
                  <Label>Tanggal CV</Label>
                  <Input type="date" value={form.tanggal_cv} onChange={e => setForm(p => ({ ...p, tanggal_cv: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label>PIC CV</Label>
                  <Input value={form.pic_cv} onChange={e => setForm(p => ({ ...p, pic_cv: e.target.value }))} placeholder="Nama admin" />
                </div>

                <div className="space-y-2">
                  <Label>Tanggal Mensetsu 1</Label>
                  <Input type="date" value={form.tanggal_mensetsu_1} onChange={e => setForm(p => ({ ...p, tanggal_mensetsu_1: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label>Tanggal Mensetsu 2</Label>
                  <Input type="date" value={form.tanggal_mensetsu_2} onChange={e => setForm(p => ({ ...p, tanggal_mensetsu_2: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label>Tanggal Mensetsu 3</Label>
                  <Input type="date" value={form.tanggal_mensetsu_3} onChange={e => setForm(p => ({ ...p, tanggal_mensetsu_3: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label>Status Kelulusan</Label>
                  <Select value={form.status_kelulusan} onValueChange={v => setForm(p => ({ ...p, status_kelulusan: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Menunggu">Menunggu</SelectItem>
                      <SelectItem value="Lulus">Lulus</SelectItem>
                      <SelectItem value="Tidak Lulus">Tidak Lulus</SelectItem>
                      <SelectItem value="Tidak Hadir">Tidak Hadir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Detail Job Order</Label>
                  <Textarea value={form.detail_job_order} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(p => ({ ...p, detail_job_order: e.target.value }))} placeholder="Deskripsi pekerjaan..." />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button variant="outline" onClick={() => setShowModal(false)}>Batal</Button>
                <Button onClick={handleSave} disabled={saving} className="min-w-[100px]">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Data'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL DETAIL */}
      {showDetailModal && detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 sticky top-0 z-10">
              <CardTitle>Detail Job Order</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">No. Job Order:</span>
                  <p>{detailItem.nomor || '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Tanggal Terbit:</span>
                  <p>{formatDate(detailItem.tanggal_terbit)}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Perusahaan:</span>
                  <p>{detailItem.nama_perusahaan || '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Kandidat ({detailItem.kandidat_ids?.length || 0}):</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {detailItem.nama_kandidat ? detailItem.nama_kandidat.split(', ').map((nama: string, idx: number) => (
                      <span key={idx} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                        {nama.trim()}
                      </span>
                    )) : '-'}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Bidang SSW:</span>
                  <p>{detailItem.bidang_ssw || '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Status Kelulusan:</span>
                  <Badge variant={statusConfig[detailItem.status_kelulusan]?.variant || 'secondary'} className="mt-1">
                    {detailItem.status_kelulusan}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Nama Grup:</span>
                  <p>{detailItem.nama_grup || '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Link Grup:</span>
                  <p>{detailItem.link_grup ? <a href={detailItem.link_grup} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{detailItem.link_grup}</a> : '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Biaya Awal:</span>
                  <p>{detailItem.biaya_awal ? `Rp ${Number(detailItem.biaya_awal).toLocaleString('id-ID')}` : '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Biaya Akhir:</span>
                  <p>{detailItem.biaya_akhir ? `Rp ${Number(detailItem.biaya_akhir).toLocaleString('id-ID')}` : '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Tanggal CV:</span>
                  <p>{formatDate(detailItem.tanggal_cv)}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">PIC CV:</span>
                  <p>{detailItem.pic_cv || '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Tanggal Mensetsu 1:</span>
                  <p>{formatDate(detailItem.tanggal_mensetsu_1)}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Tanggal Mensetsu 2:</span>
                  <p>{formatDate(detailItem.tanggal_mensetsu_2)}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Tanggal Mensetsu 3:</span>
                  <p>{formatDate(detailItem.tanggal_mensetsu_3)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <span className="font-medium text-muted-foreground">Detail Job Order:</span>
                <p className="text-sm whitespace-pre-wrap">{detailItem.detail_job_order || '-'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}