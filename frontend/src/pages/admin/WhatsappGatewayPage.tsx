import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/useToast'
import api from '@/lib/api'
import {
  Loader2, MessageCircle, Save, RotateCcw, Send, Eye, EyeOff, ShieldCheck
} from 'lucide-react'

const SETTINGS_KEYS = [
  'whatsapp_api_url',
  'whatsapp_device_api_key',
  'whatsapp_account_api_key',
  'whatsapp_admin_phone',
]

interface SettingRow {
  setting_key: string
  setting_value: string
  setting_type: string
  description?: string
}

const FIELDS: { key: string; label: string; placeholder: string; help: string; secret?: boolean }[] = [
  {
    key: 'whatsapp_api_url',
    label: 'URL API',
    placeholder: 'https://api.starsender.online/api/send',
    help: 'Endpoint API StarSender untuk mengirim pesan.',
  },
  {
    key: 'whatsapp_device_api_key',
    label: 'Device API Key',
    placeholder: 'Masukkan device API key',
    help: 'API key perangkat WA (digunakan sebagai header Authorization).',
    secret: true,
  },
  {
    key: 'whatsapp_account_api_key',
    label: 'Account API Key',
    placeholder: 'Masukkan account API key',
    help: 'API key level akun StarSender.',
    secret: true,
  },
  {
    key: 'whatsapp_admin_phone',
    label: 'Nomor Admin (Penerima Notifikasi)',
    placeholder: '089662695289',
    help: 'Nomor WhatsApp yang menerima notifikasi formulir baru.',
  },
]

export default function WhatsappGatewayPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [visible, setVisible] = useState<Record<string, boolean>>({})

  const load = () => {
    setLoading(true)
    api.get('/settings')
      .then(r => {
        const rows: SettingRow[] = r.data.data || []
        const map: Record<string, string> = {}
        rows.forEach(row => { map[row.setting_key] = row.setting_value || '' })
        setValues(map)
      })
      .catch(() => toast({ title: 'Gagal memuat pengaturan', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const field of FIELDS) {
        await api.put(`/settings/${field.key}`, {
          setting_value: values[field.key] || '',
          setting_type: 'string',
        })
      }
      toast({ title: 'Pengaturan WhatsApp Gateway disimpan' })
      load()
    } catch (err: any) {
      toast({ title: 'Gagal menyimpan', description: err.response?.data?.message, variant: 'destructive' })
    } finally { setSaving(false) }
  }

  const handleReset = async (key: string) => {
    try {
      await api.post(`/settings/${key}/reset`)
      toast({ title: 'Pengaturan direset ke default' })
      load()
    } catch (err: any) {
      toast({ title: 'Gagal reset', description: err.response?.data?.message, variant: 'destructive' })
    }
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      const r = await api.post('/settings/whatsapp/test')
      toast({ title: 'Pesan test terkirim', description: 'Cek WhatsApp nomor admin.' })
      if (r.data?.message) toast({ title: 'Pesan test terkirim' })
    } catch (err: any) {
      toast({ title: 'Gagal kirim test', description: err.response?.data?.error || err.response?.data?.message || 'Periksa konfigurasi gateway', variant: 'destructive' })
    } finally { setTesting(false) }
  }

  return (
    <div className="w-full min-w-0 space-y-3 px-2.5 sm:px-4 md:px-6 py-3 sm:py-5 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <h1 className="text-base sm:text-2xl font-bold text-foreground leading-tight truncate">
            WhatsApp Gateway
          </h1>
          <p className="text-[11px] sm:text-sm text-muted-foreground mt-0.5">
            Konfigurasi StarSender untuk pengiriman notifikasi WhatsApp
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1e3a5f] hover:bg-[#2d5a8a] h-8 sm:h-9 shrink-0 px-2 sm:px-3 text-xs"
        >
          {saving ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Save size={14} className="shrink-0" />}
          <span className="hidden min-[400px]:inline ml-1 whitespace-nowrap">Simpan Pengaturan</span>
        </Button>
      </div>

      {/* ── Info card ── */}
      <div className="bg-[#1e3a5f]/5 border border-[#1e3a5f]/15 rounded-xl px-3 py-2.5 flex items-start gap-2.5">
        <MessageCircle size={16} className="text-[#1e3a5f] shrink-0 mt-0.5" />
        <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
          Pengaturan ini tersimpan di database dan langsung dipakai untuk mengirim notifikasi WhatsApp
          setiap ada formulir kandidat baru. Tidak perlu merestart server setelah menyimpan.
        </p>
      </div>

      {/* ── Card Container ── */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-3 py-2 border-b flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-gray-500" />
            <span className="font-medium text-gray-700 text-xs sm:text-sm">Konfigurasi StarSender</span>
            {loading && <Loader2 size={12} className="animate-spin text-gray-400" />}
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="animate-spin mx-auto text-gray-300" size={24} />
            <p className="text-gray-400 text-xs mt-2">Memuat pengaturan...</p>
          </div>
        ) : (
          <div className="p-3 sm:p-5 space-y-4">
            {FIELDS.map(field => (
              <div key={field.key} className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">{field.label}</label>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Input
                      type={field.secret && !visible[field.key] ? 'password' : 'text'}
                      value={values[field.key] || ''}
                      onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="h-9 text-xs sm:text-sm pr-16 font-mono"
                    />
                    {field.secret && (
                      <button
                        type="button"
                        onClick={() => setVisible(v => ({ ...v, [field.key]: !v[field.key] }))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                        title={visible[field.key] ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {visible[field.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-2 text-[11px] shrink-0"
                    onClick={() => handleReset(field.key)}
                    title="Reset ke default"
                  >
                    <RotateCcw size={13} />
                    <span className="hidden min-[420px]:inline ml-1">Reset</span>
                  </Button>
                </div>
                <p className="text-[10px] sm:text-[11px] text-gray-400">{field.help}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        {!loading && (
          <div className="px-3 py-2.5 border-t bg-gray-50/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 justify-between">
            <p className="text-[10px] sm:text-[11px] text-gray-400">
              Klik <span className="font-medium text-gray-600">Simpan Pengaturan</span> lalu gunakan
              tombol test untuk memastikan gateway berfungsi.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="h-8 px-3 text-xs bg-[#1e3a5f] hover:bg-[#2d5a8a] flex-1 sm:flex-none"
              >
                {saving && <Loader2 size={12} className="mr-1 animate-spin" />}
                Simpan Pengaturan
              </Button>
              <Button
                onClick={handleTest}
                disabled={testing}
                className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
              >
                {testing ? <Loader2 size={12} className="mr-1 animate-spin" /> : <Send size={12} className="mr-1" />}
                Kirim Test WA
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}