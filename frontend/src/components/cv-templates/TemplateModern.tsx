import { createContext, useContext, useRef, useState, useEffect } from 'react'
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

// ── ikon border (gaya Excel) ──
function BorderSideIcon({ side }: { side: 'top' | 'bottom' | 'left' | 'right' }) {
  const line =
    side === 'top'
      ? { x1: 3, y1: 3.5, x2: 13, y2: 3.5 }
      : side === 'bottom'
        ? { x1: 3, y1: 12.5, x2: 13, y2: 12.5 }
        : side === 'left'
          ? { x1: 3.5, y1: 3, x2: 3.5, y2: 13 }
          : { x1: 12.5, y1: 3, x2: 12.5, y2: 13 }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="3" width="10" height="10" rx="1" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="1.6 1.6" />
      <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function BorderAllIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <line x1="8" y1="3" x2="8" y2="13" stroke="currentColor" strokeWidth="1" />
      <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function BorderNoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 1.6" />
      <line x1="4.5" y1="11.5" x2="11.5" y2="4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

interface CVTemplateProps {
  data: any
  editable?: boolean
  onEdit?: (path: string, value: string) => void
}

// ── context untuk toolbar rich-text ──
interface RichTextCtx {
  activeEl: HTMLElement | null
  setActiveEl: (el: HTMLElement | null) => void
  version: number
  commit: () => void
}
const RichTextContext = createContext<RichTextCtx | null>(null)

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function isHtml(s: string) {
  return /<[a-z][\s\S]*>/i.test(s)
}

// ── helper map agama → kanji
const agamaMap: Record<string, string> = {
  Islam: 'イスラム',
  Kristen: 'キリスト',
  Katolik: 'カトリック',
  Hindu: 'ヒンドゥー',
  Buddha: '仏教',
  Konghucu: '儒教',
}

// ── helper map SSW → kanji
const sswMap: Record<string, string> = {
  Pertanian: '農業',
  'Kaigo (perawat)': '介護',
  'Pengolahan Makanan: ': '飲食料品',
  'Pengolahan Makanan': '飲食料品',
  Restoran: '外食業',
  'Building Cleaning': 'ビルクリーニング',
  Driver: '自動車運送業',
  'Hanya JFT': '国際交流基金日本語基礎テスト',
}

function EditableCell({
  value,
  path,
  editable,
  onEdit,
  style,
  as = 'td',
  ...rest
}: {
  value: string
  path: string
  editable?: boolean
  onEdit?: (path: string, value: string) => void
  style?: React.CSSProperties
  as?: 'td' | 'div'
  [key: string]: any
}) {
  const Tag: any = as
  const ctx = useContext(RichTextContext)
  const ref = useRef<HTMLElement | null>(null)
  const lastValue = useRef<string | null>(null)
  const mounted = useRef(false)

  const baseStyle: React.CSSProperties = {
    ...style,
    ...(editable
      ? {
          outline: 'none',
          cursor: 'text',
          borderRadius: '2px',
        }
      : {}),
  }

  // set HTML awal saat mount & sinkronkan bila value dari luar berubah
  useEffect(() => {
    if (!editable || !ref.current) return
    if (!mounted.current) {
      mounted.current = true
      ref.current.innerHTML = isHtml(value) ? value : escapeHtml(value || '')
      lastValue.current = value
      return
    }
    // jangan sentuh DOM bila cell ini sedang aktif diedit (hindari caret hilang)
    if (ctx?.activeEl === ref.current) {
      lastValue.current = value
      return
    }
    if (value !== lastValue.current) {
      ref.current.innerHTML = isHtml(value) ? value : escapeHtml(value || '')
      lastValue.current = value
    }
  }, [value, editable, ctx?.activeEl])

  const readHtml = (el: HTMLElement) => {
    const html = el.innerHTML.replace(/(<br>\s*)+$/i, '').trim()
    const plain = el.innerText.replace(/\n$/, '')
    if (!plain) return ''
    // simpan HTML hanya jika ada formatting, jika tidak simpan teks polos
    return isHtml(html) ? html : plain
  }

  if (!editable) {
    return (
      <Tag style={baseStyle} {...rest}>
        {isHtml(value || '') ? (
          <span dangerouslySetInnerHTML={{ __html: value }} />
        ) : (
          value
        )}
      </Tag>
    )
  }

  return (
    <Tag
      ref={ref as any}
      style={baseStyle}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onFocus={(e: any) => {
        e.currentTarget.style.background = '#fff8d6'
        e.currentTarget.style.boxShadow = 'inset 0 0 0 1.5px #f0ad4e'
        ctx?.setActiveEl(e.currentTarget)
      }}
      onMouseUp={(e: any) => ctx?.setActiveEl(e.currentTarget)}
      onKeyUp={(e: any) => ctx?.setActiveEl(e.currentTarget)}
      onBlur={(e: any) => {
        e.currentTarget.style.background = ''
        e.currentTarget.style.boxShadow = ''
        const next = readHtml(e.currentTarget)
        if (next !== lastValue.current) {
          lastValue.current = next
          onEdit?.(path, next)
        }
        if (ctx?.activeEl === e.currentTarget) ctx.setActiveEl(null)
      }}
      {...rest}
    />
  )
}

// ── Toolbar rich-text melayang ──
function RichTextToolbar() {
  const ctx = useContext(RichTextContext)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const [, force] = useState(0)

  const recompute = () => {
    if (!ctx?.activeEl) {
      setPos(null)
      return
    }
    const r = ctx.activeEl.getBoundingClientRect()
    const W = 360
    setPos({
      top: Math.max(8, r.top - 44),
      left: Math.max(8, Math.min(window.innerWidth - W - 8, r.left + r.width / 2 - W / 2)),
    })
  }

  useEffect(() => {
    recompute()
    if (!ctx?.activeEl) return
    const onScroll = () => recompute()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx?.activeEl, ctx?.version])

  if (!ctx || !pos) return null

  const cmd = (command: string) => {
    const el = ctx.activeEl
    if (!el) return
    el.focus()
    document.execCommand(command, false)
    ctx.commit()
    // paksa re-render toolbar untuk memperbarui status aktif tombol
    force((n) => n + 1)
  }

  const isActive = (command: string) => {
    try {
      return document.queryCommandState(command)
    } catch {
      return false
    }
  }

  // ── toggle border per sisi (seperti Excel) ──
  const sideActive = (side: 'top' | 'bottom' | 'left' | 'right'): boolean => {
    const el = ctx?.activeEl
    if (!el) return false
    const v = getComputedStyle(el)[`border${side[0].toUpperCase()}${side.slice(1)}Style` as any]
    return !!v && v !== 'none'
  }

  const toggleBorder = (side: 'top' | 'bottom' | 'left' | 'right') => {
    const el = ctx?.activeEl
    if (!el) return
    const prop = `border${side[0].toUpperCase()}${side.slice(1)}` as any
    const cur = getComputedStyle(el)[`border${side[0].toUpperCase()}${side.slice(1)}Style` as any]
    const has = !!cur && cur !== 'none'
    ;(el.style as any)[prop] = has ? 'none' : '1px solid #000'
    force((n) => n + 1)
  }

  const showBorders = () => {
    const el = ctx?.activeEl
    if (!el) return
    ;(el.style as any).borderTop = '1px solid #000'
    ;(el.style as any).borderBottom = '1px solid #000'
    ;(el.style as any).borderLeft = '1px solid #000'
    ;(el.style as any).borderRight = '1px solid #000'
    force((n) => n + 1)
  }

  const clearBorders = () => {
    const el = ctx?.activeEl
    if (!el) return
    ;(el.style as any).borderTop = 'none'
    ;(el.style as any).borderBottom = 'none'
    ;(el.style as any).borderLeft = 'none'
    ;(el.style as any).borderRight = 'none'
    force((n) => n + 1)
  }

  const Btn = ({
    children,
    onClick,
    active,
    title,
  }: {
    children: React.ReactNode
    onClick: () => void
    active?: boolean
    title: string
  }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex items-center justify-center w-7 h-7 rounded transition-colors ${
        active
          ? 'bg-slate-200 text-slate-900'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )

  const Sep = () => <span className="mx-1 h-5 w-px bg-slate-200" />

  return (
    <div
      className="fixed z-[60] flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white px-1.5 py-1 shadow-xl"
      style={{ top: pos.top, left: pos.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <Btn title="Tebal (Bold)" active={isActive('bold')} onClick={() => cmd('bold')}>
        <span className="font-bold text-sm leading-none">B</span>
      </Btn>
      <Btn title="Miring (Italic)" active={isActive('italic')} onClick={() => cmd('italic')}>
        <span className="italic text-sm leading-none" style={{ fontFamily: 'Georgia, serif' }}>I</span>
      </Btn>
      <Sep />
      <Btn title="Rata kiri" active={isActive('justifyLeft')} onClick={() => cmd('justifyLeft')}>
        <AlignLeft size={15} />
      </Btn>
      <Btn title="Rata tengah" active={isActive('justifyCenter')} onClick={() => cmd('justifyCenter')}>
        <AlignCenter size={15} />
      </Btn>
      <Btn title="Rata kanan" active={isActive('justifyRight')} onClick={() => cmd('justifyRight')}>
        <AlignRight size={15} />
      </Btn>
      <Sep />
      <Btn title="Tampilkan semua garis (All)" onClick={showBorders}>
        <BorderAllIcon />
      </Btn>
      <Btn title="Garis atas" active={sideActive('top')} onClick={() => toggleBorder('top')}>
        <BorderSideIcon side="top" />
      </Btn>
      <Btn title="Garis bawah" active={sideActive('bottom')} onClick={() => toggleBorder('bottom')}>
        <BorderSideIcon side="bottom" />
      </Btn>
      <Btn title="Garis kiri" active={sideActive('left')} onClick={() => toggleBorder('left')}>
        <BorderSideIcon side="left" />
      </Btn>
      <Btn title="Garis kanan" active={sideActive('right')} onClick={() => toggleBorder('right')}>
        <BorderSideIcon side="right" />
      </Btn>
      <Btn title="Hapus semua garis (No Border)" onClick={clearBorders}>
        <BorderNoneIcon />
      </Btn>
    </div>
  )
}

export default function TemplateModern({ data, editable, onEdit }: CVTemplateProps) {
  const [activeEl, setActiveEl] = useState<HTMLElement | null>(null)
  const [version, setVersion] = useState(0)
  const activeElRef = useRef<HTMLElement | null>(null)
  activeElRef.current = activeEl

  const commit = () => {
    const el = activeElRef.current
    if (!el) return
    const html = el.innerHTML.replace(/(<br>\s*)+$/i, '').trim()
    const plain = el.innerText.replace(/\n$/, '')
    const next = !plain ? '' : isHtml(html) ? html : plain
    const path = el.dataset?.path
    if (path) onEdit?.(path, next)
    setVersion((v) => v + 1)
  }

  const cell = (
    value: any,
    path: string,
    style?: React.CSSProperties,
    props?: Record<string, any>,
  ) => (
    <EditableCell
      value={value === undefined || value === null ? '' : String(value)}
      path={path}
      editable={editable && !path.includes('.-1.')}
      onEdit={onEdit}
      style={style}
      data-path={path}
      {...props}
    />
  )
  // Kelompokkan keluarga berdasarkan hubungan
  const keluarga: any[] = data.keluarga || []
  const ayah      = keluarga.find(k => k.hubungan === 'Ayah')
  const ibu       = keluarga.find(k => k.hubungan === 'Ibu')
  const kakaks    = keluarga.filter(k => k.hubungan === 'Kakak')
  const adiks     = keluarga.filter(k => k.hubungan === 'Adik')
  const lainnya   = keluarga.filter(k => !['Ayah','Ibu','Kakak','Adik'].includes(k.hubungan))

  return (
    <RichTextContext.Provider value={{ activeEl, setActiveEl, version, commit }}>
      {editable && <RichTextToolbar />}
      <div style={{ fontFamily: '"MS PGothic", "ＭＳ Ｐゴシック", "MS Gothic", sans-serif', fontSize: '10px', lineHeight: 1.15, padding: '10px', background: '#fff', color: '#000' }}>

      {/* ── JUDUL ── */}
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px' }}>RIWAYAT HIDUP</div>
        <div style={{ fontSize: '10px', letterSpacing: '1px' }}>実習生経歴書</div>
      </div>

      {/* ── BARIS ATAS: PAS FOTO + TABEL IDENTITAS ── */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>

        {/* PAS FOTO */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'stretch' }}>
          {data.pas_foto ? (
            <img
              src={data.pas_foto}
              alt="Pas Foto"
              style={{ width: '185px', height: 'auto', objectFit: 'cover', display: 'block', border: '1px solid #000' }}
            />
          ) : (
            <div style={{ width: '185px', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '9px', textAlign: 'center' }}>
              Pas Foto
            </div>
          )}
        </div>

        {/* TABEL IDENTITAS */}
        <table style={tbl}>
          <tbody>
            {/* Baris 1 — Nomor + Tinggi */}
            <tr>
              <td style={{ ...td, ...bg, textAlign: 'center', width: '90px' }} rowSpan={2}>実習生 NOMOR</td>
              {cell(data.nomor_peserta || '', 'nomor_peserta', { ...td, width: '100px' }, { rowSpan: 2 })}
              <td style={{ ...td, ...bg, width: '130px' }}>身長 TINGGI BADAN</td>
              {cell(data.tinggi_badan || '', 'tinggi_badan', { ...td, textAlign: 'center', width: '50px' }, { colSpan: 2 })}
              <td style={{ ...td, textAlign: 'center', width: '30px' }} colSpan={2}>CM</td>
            </tr>
            {/* Baris 2 — Berat */}
            <tr>
              <td style={{ ...td, ...bg }}>体重 BERAT BADAN</td>
              {cell(data.berat_badan || '', 'berat_badan', { ...td, textAlign: 'center' }, { colSpan: 2 })}
              <td style={{ ...td, textAlign: 'center' }} colSpan={2}>KG</td>
            </tr>

            {/* Baris 3 — Label Nama + Ukuran Sepatu */}
            <tr>
              <td style={{ ...td, ...bg, textAlign: 'center' }} colSpan={2}>名前 NAMA</td>
              <td style={{ ...td, ...bg }}>靴サイズ UKURAN SEPATU</td>
              {cell(data.panjang_telapak_kaki || '', 'panjang_telapak_kaki', { ...td, textAlign: 'center' }, { colSpan: 2 })}
              <td style={{ ...td, textAlign: 'center' }} colSpan={2}>CM</td>
            </tr>

            {/* Baris 4 — Nama Katakana + Lingkar Pinggang */}
            <tr>
              {cell(data.nama_katakana || '…………………', 'nama_katakana', { ...td, textAlign: 'center' }, { colSpan: 2 })}
              <td style={{ ...td, ...bg }}>ウェスト LINGKAR PINGGANG</td>
              {cell(data.lingkar_pinggang || '', 'lingkar_pinggang', { ...td, textAlign: 'center' }, { colSpan: 2 })}
              <td style={{ ...td, textAlign: 'center' }} colSpan={2}>CM</td>
            </tr>

            {/* Baris 5 — Nama Romaji + Golongan Darah */}
            <tr>
              {cell(data.nama_romaji || '…………………', 'nama_romaji', { ...td, textAlign: 'center' }, { colSpan: 2 })}
              <td style={{ ...td, ...bg }}>血液型 GOLONGAN DARAH</td>
              {cell(data.golongan_darah || '', 'golongan_darah', { ...td, textAlign: 'center' }, { colSpan: 2 })}
              <td style={{ ...td, textAlign: 'center' }} colSpan={2}>型</td>
            </tr>

            {/* Baris 6 — Label TGL Lahir + Penglihatan */}
            <tr>
              <td style={{ ...td, ...bg, textAlign: 'center' }} colSpan={2}>生年月日 TANGGAL LAHIR</td>
              <td style={{ ...td, ...bg }}>視力 PENGLIHATAN</td>
              <td style={{ ...td, textAlign: 'center', width: '22px' }}>右</td>
              {cell(data.penglihatan_kanan || '', 'penglihatan_kanan', { ...td, textAlign: 'center', width: '45px' })}
              <td style={{ ...td, textAlign: 'center', width: '22px' }}>左</td>
              {cell(data.penglihatan_kiri || '', 'penglihatan_kiri', { ...td, textAlign: 'center', width: '45px' })}
            </tr>

            {/* Baris 7 — Tanggal Lahir + Status Pernikahan */}
            <tr>
              {cell(data.tanggal_lahir ? formatDate(data.tanggal_lahir) : '…………………', 'tanggal_lahir', { ...td, textAlign: 'center' }, { colSpan: 2 })}
              <td style={{ ...td, ...bg }}>配偶者 STATUS PERNIKAHAN</td>
              {cell(
                `${data.status_pernikahan || ''}`,
                'status_pernikahan',
                { ...td, textAlign: 'center' },
                { colSpan: 4 },
              )}
            </tr>

            {/* Baris 8 — Label Tempat Lahir + Agama */}
            <tr>
              <td style={{ ...td, ...bg, textAlign: 'center' }} colSpan={2}>出身地 TEMPAT LAHIR</td>
              <td style={{ ...td, ...bg }}>宗教 AGAMA</td>
              {cell(
                `${data.agama || ''} （${agamaMap[data.agama] || '-'}）`,
                'agama',
                { ...td, textAlign: 'center' },
                { colSpan: 4 },
              )}
            </tr>

            {/* Baris 9 — Tempat Lahir + Pernah ke Jepang */}
            <tr>
              {cell(data.tempat_lahir || '', 'tempat_lahir', { ...td, textAlign: 'center' }, { colSpan: 2 })}
              <td style={{ ...td, ...bg }}>訪日経験 PERNAH KE JEPANG</td>
              {cell(
                data.pernah_ke_jepang === 'Ya' ? 'Ya（有）' : 'Tidak（無）',
                'pernah_ke_jepang',
                { ...td, textAlign: 'center' },
                { colSpan: 4 },
              )}
            </tr>

            {/* Baris 10 — Usia + Paspor */}
            <tr>
              <td style={{ ...td, ...bg, textAlign: 'center' }}>年齢 USIA</td>
              {cell(data.umur ? `${data.umur} 歳` : '', 'umur', { ...td, textAlign: 'center' })}
              <td style={{ ...td, ...bg }}>旅券の有無 PASPOR</td>
              {cell(data.paspor || 'TIDAK (無)', 'paspor', { ...td, textAlign: 'center' }, { colSpan: 4 })}
            </tr>

            {/* Baris 11 — Jenis Kelamin + Tangan Dominan */}
            <tr>
              <td style={{ ...td, ...bg, textAlign: 'center' }}>性別 JENIS KELAMIN</td>
              {cell(
                `${data.jenis_kelamin || ''} （${data.jenis_kelamin === 'Laki-laki' ? '男' : '女'}）`,
                'jenis_kelamin',
                { ...td, textAlign: 'center' },
              )}
              <td style={{ ...td, ...bg }}>利き手 TANGAN DOMINAN</td>
              {cell(
                `${data.tangan_dominan || ''} （${data.tangan_dominan === 'Kanan' ? '右' : '左'}）`,
                'tangan_dominan',
                { ...td, textAlign: 'center' },
                { colSpan: 4 },
              )}
            </tr>

            {/* Baris 12-14 — No HP + Riwayat Penyakit / Merokok / Alkohol */}
            <tr>
              <td style={{ ...td, ...bg, textAlign: 'center' }} rowSpan={3}>携帯電話番号 NO HP</td>
              {cell(`(+62) ${data.nomor_hp || ''}`, 'nomor_hp', { ...td, textAlign: 'center' }, { rowSpan: 3 })}
              <td style={{ ...td, ...bg }}>病歴 RIWAYAT PENYAKIT</td>
              {cell(
                `${data.riwayat_penyakit || 'Tidak Ada'}（${data.riwayat_penyakit && data.riwayat_penyakit !== 'Tidak Ada' ? '有' : '無'}）`,
                'riwayat_penyakit',
                { ...td, textAlign: 'center' },
                { colSpan: 4 },
              )}
            </tr>
            <tr>
              <td style={{ ...td, ...bg }}>タバコ MEROKOK</td>
              {cell(
                `${data.merokok || ''} （${data.merokok === 'Ya' ? '有' : '無'}）`,
                'merokok',
                { ...td, textAlign: 'center' },
                { colSpan: 4 },
              )}
            </tr>
            <tr>
              <td style={{ ...td, ...bg }}>飲酒 MINUM ALKOHOL</td>
              {cell(
                `${data.minum_alkohol || ''} （${data.minum_alkohol === 'Ya' ? '有' : '無'}）`,
                'minum_alkohol',
                { ...td, textAlign: 'center' },
                { colSpan: 4 },
              )}
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── ALAMAT ── */}
      <table style={{ ...tbl, marginTop: '0' }}>
        <tbody>
          <tr>
            <td style={{ ...td, ...bg, textAlign: 'center' }}>現住所　ALAMAT RUMAH</td>
          </tr>
          <tr>
            {cell(data.alamat_lengkap || '', 'alamat_lengkap', { ...td, textAlign: 'center' })}
          </tr>
        </tbody>
      </table>

      {/* ── KONTAK DARURAT ── */}
      <table style={tbl}>
        <tbody>
          <tr>
            <td style={{ ...td, ...bg }}>緊急時の連絡先 Informasi Kontak Darurat</td>
            {cell(`電話番号　： ${data.nomor_hp || data.kontak_ortu_hp || ''}`, 'nomor_hp', td, { colSpan: 2 })}
          </tr>
        </tbody>
      </table>

      {/* ── PENDIDIKAN ── */}
      <table style={tbl}>
        <tbody>
          <tr>
            <td style={{ ...td, ...bg, textAlign: 'center' }} colSpan={5}>学歴 PENDIDIKAN</td>
          </tr>
          <tr style={bg}>
            <td style={{ ...td, ...bg, width: '96px', textAlign: 'center' }} colSpan={3}>期間 TAHUN</td>
            <td style={{ ...td, ...bg, width: '383px', textAlign: 'center' }}>学校名 NAMA SEKOLAH</td>
            <td style={{ ...td, ...bg, textAlign: 'center' }}>専攻 JURUSAN</td>
          </tr>
          {(data.pendidikan || []).map((p: any, i: number) => (
            <tr key={i} style={{ textAlign: 'center' }}>
              {cell(p.bulan_masuk ? `${p.tahun_masuk}年 ${p.bulan_masuk}月` : (p.tahun_masuk || ''), `pendidikan.${i}.tahun_masuk`, { ...td, width: '96px' })}
              <td style={{ ...td, width: '20px', textAlign: 'center' }}>-</td>
              {cell(p.bulan_lulus ? `${p.tahun_lulus}年 ${p.bulan_lulus}月` : (p.tahun_lulus || ''), `pendidikan.${i}.tahun_lulus`, { ...td, width: '96px' })}
              {cell(p.nama_sekolah || '', `pendidikan.${i}.nama_sekolah`, { ...td, width: '383px' })}
              {cell(p.jurusan || '', `pendidikan.${i}.jurusan`, td)}
            </tr>
          ))}
          {/* baris kosong */}
          <tr>
            <td style={{ ...td, height: '20px' }} colSpan={5}></td>
          </tr>
        </tbody>
      </table>

      {/* ── PENGALAMAN KERJA ── */}
      <table style={tbl}>
        <tbody>
          <tr>
            <td style={{ ...td, ...bg, textAlign: 'center' }} colSpan={6}>職歴 PENGALAMAN KERJA</td>
          </tr>
          <tr>
            <td style={{ ...td, ...bg, textAlign: 'center', width: '96px' }} colSpan={3}>期間 TAHUN</td>
            <td style={{ ...td, ...bg, textAlign: 'center', width: '383px' }}>会社名 NAMA PERUSAHAAN</td>
            <td style={{ ...td, ...bg, textAlign: 'center', width: '122px' }}>職種 JENIS KERJA</td>
            <td style={{ ...td, ...bg, textAlign: 'center' }}>月収/円 GAJI</td>
          </tr>
          {(data.pengalaman || []).map((p: any, i: number) => (
            <tr key={i} style={{ textAlign: 'center' }}>
              {cell(p.bulan_masuk ? `${p.tahun_masuk}年 ${p.bulan_masuk}月` : (p.tahun_masuk || ''), `pengalaman.${i}.tahun_masuk`, { ...td, width: '95px' })}
              <td style={{ ...td, width: '20px', textAlign: 'center' }}>-</td>
              {cell(
                p.masih_bekerja ? '現在' : (p.bulan_keluar ? `${p.tahun_keluar}年 ${p.bulan_keluar}月` : (p.tahun_keluar || '')),
                `pengalaman.${i}.tahun_keluar`,
                { ...td, width: '94px' },
              )}
              {cell(p.nama_perusahaan || '', `pengalaman.${i}.nama_perusahaan`, { ...td, width: '383px' })}
              {cell(p.posisi || '', `pengalaman.${i}.posisi`, { ...td, width: '122px' })}
              <td style={td}>-</td>
            </tr>
          ))}
          <tr>
            <td style={{ ...td, height: '20px' }} colSpan={6}></td>
          </tr>
        </tbody>
      </table>

      {/* ── DATA KELUARGA ── */}
      <table style={tbl}>
        <tbody>
          <tr>
            <td style={{ ...td, ...bg, textAlign: 'center' }} colSpan={5}>家族構成 SUSUNAN KELUARGA KANDUNG</td>
          </tr>
          <tr>
            <td style={{ ...td, ...bg, textAlign: 'center', width: '160px' }}>続柄 URUTAN KELUARGA</td>
            <td style={{ ...td, ...bg, textAlign: 'center', width: '220px' }}>名前 NAMA ANGGOTA KELUARGA</td>
            <td style={{ ...td, ...bg, textAlign: 'center' }}>年齢 USIA</td>
            <td style={{ ...td, ...bg, textAlign: 'center' }}>職業 PEKERJAAN</td>
            <td style={{ ...td, ...bg, textAlign: 'center' }}>月収/円 GAJI</td>
          </tr>

          {/* Ayah */}
          <tr>
            <td style={td}>AYAH （父）</td>
            {cell(ayah?.nama || '', `keluarga.${keluarga.indexOf(ayah)}.nama`, td)}
            {cell(ayah?.usia ? `${ayah.usia} 歳` : '', `keluarga.${keluarga.indexOf(ayah)}.usia`, { ...td, textAlign: 'center' })}
            {cell(ayah?.pekerjaan || '', `keluarga.${keluarga.indexOf(ayah)}.pekerjaan`, td)}
            <td style={td}>なし</td>
          </tr>

          {/* Ibu */}
          <tr>
            <td style={td}>IBU （母）</td>
            {cell(ibu?.nama || '', `keluarga.${keluarga.indexOf(ibu)}.nama`, td)}
            {cell(ibu?.usia ? `${ibu.usia} 歳` : '', `keluarga.${keluarga.indexOf(ibu)}.usia`, { ...td, textAlign: 'center' })}
            {cell(ibu?.pekerjaan || '', `keluarga.${keluarga.indexOf(ibu)}.pekerjaan`, td)}
            <td style={td}>なし</td>
          </tr>

          {/* Kakak */}
          {kakaks.map((k, i) => (
            <tr key={`kakak-${i}`}>
              <td style={td}>KAKAK （兄/姉）</td>
              {cell(k.nama || '', `keluarga.${keluarga.indexOf(k)}.nama`, td)}
              {cell(k.usia ? `${k.usia} 歳` : '', `keluarga.${keluarga.indexOf(k)}.usia`, { ...td, textAlign: 'center' })}
              {cell(k.pekerjaan || '', `keluarga.${keluarga.indexOf(k)}.pekerjaan`, td)}
              <td style={td}>なし</td>
            </tr>
          ))}

          {/* Adik */}
          {adiks.map((k, i) => (
            <tr key={`adik-${i}`}>
              <td style={td}>ADIK （弟/妹）</td>
              {cell(k.nama || '', `keluarga.${keluarga.indexOf(k)}.nama`, td)}
              {cell(k.usia ? `${k.usia} 歳` : '', `keluarga.${keluarga.indexOf(k)}.usia`, { ...td, textAlign: 'center' })}
              {cell(k.pekerjaan || '', `keluarga.${keluarga.indexOf(k)}.pekerjaan`, td)}
              <td style={td}>なし</td>
            </tr>
          ))}

          {/* Lainnya */}
          {lainnya.map((k, i) => (
            <tr key={`lain-${i}`}>
              {cell(k.hubungan || '', `keluarga.${keluarga.indexOf(k)}.hubungan`, td)}
              {cell(k.nama || '', `keluarga.${keluarga.indexOf(k)}.nama`, td)}
              {cell(k.usia ? `${k.usia} 歳` : '', `keluarga.${keluarga.indexOf(k)}.usia`, { ...td, textAlign: 'center' })}
              {cell(k.pekerjaan || '', `keluarga.${keluarga.indexOf(k)}.pekerjaan`, td)}
              <td style={td}>なし</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── INFORMASI PERSONAL ── */}
      <table style={tbl}>
        <tbody>
          <tr>
            <td style={{ ...td, ...bg, textAlign: 'center' }} colSpan={2}>個人情報　INFORMASI PERSONAL</td>
          </tr>
          <tr>
            <td style={{ ...td, ...bg, width: '209px' }}>自己ＰＲ　PROMOSI DIRI</td>
            {cell(data.kelebihan_diri || '', 'kelebihan_diri', td)}
          </tr>
          <tr>
            <td style={{ ...td, ...bg }}>日本へ行く目的　TUJUAN KE JEPANG</td>
            {cell(data.tujuan_ke_jepang || '', 'tujuan_ke_jepang', td)}
          </tr>
          <tr>
            <td style={{ ...td, ...bg }}>回国後の目標　TUJUAN SETELAH PULANG DARI JEPANG</td>
            {cell(data.cita_cita_setelah_jepang || '', 'cita_cita_setelah_jepang', td)}
          </tr>
          <tr>
            <td style={{ ...td, ...bg }}>長所　KELEBIHAN</td>
            {cell(data.kelebihan_diri || '', 'kelebihan_diri', td)}
          </tr>
          <tr>
            <td style={{ ...td, ...bg }}>短所　KEKURANGAN</td>
            {cell(data.kekurangan_diri || '', 'kekurangan_diri', td)}
          </tr>
          <tr>
            <td style={{ ...td, ...bg }}>特技 KEAHLIAN KHUSUS</td>
            {cell(data.keahlian || '', 'keahlian', td)}
          </tr>
          <tr>
            <td style={{ ...td, ...bg }}>趣味　HOBI</td>
            {cell(data.hobi || '', 'hobi', td)}
          </tr>
        </tbody>
      </table>

      {/* ── SERTIFIKAT ── */}
      <table style={tbl}>
        <tbody>
          <tr>
            <td style={{ ...td, ...bg, textAlign: 'center' }} colSpan={7}>面鏡・資格　SERTIFIKAT YANG DIMILIKI</td>
          </tr>
          <tr>
            <td style={{ ...td, ...bg, width: '104px' }}>日本語能力試験 JLPT / SETARA</td>
            {cell(
              data.level_jlpt ? `${data.level_jlpt}（有）` : (data.level_jft ? `JFT ${data.level_jft}（有）` : 'Tidak Ada（無）'),
              'level_jlpt',
              { ...td, width: '105px' },
            )}
            {cell(data.level_jft || '', 'level_jft', td)}
            <td style={{ ...td, ...bg }}>運転免許　SURAT IZIN MENGEMUDI (SIM)</td>
            {cell(data.sim_dimiliki ? `${data.sim_dimiliki}（有）` : 'Tidak Ada（無）', 'sim_dimiliki', td)}
            <td style={{ ...td, ...bg }}>他　LAIN-LAIN</td>
            {cell(
              data.sertifikat_ssw ? `${data.sertifikat_ssw} （${sswMap[data.sertifikat_ssw] || '-'}）` : '',
              'sertifikat_ssw',
              td,
            )}
          </tr>
        </tbody>
      </table>

      {/* ── KERABAT / KENALAN DI JEPANG ── */}
      <table style={tbl}>
        <tbody>
          <tr>
            <td style={{ ...td, ...bg, textAlign: 'center' }} colSpan={5}>在日親戚・知人　KERABAT / KENALAN DI JEPANG</td>
          </tr>
          <tr>
            <td style={{ ...td, ...bg, width: '209px', textAlign: 'center' }}>名前 NAMA</td>
            <td style={{ ...td, ...bg, textAlign: 'center' }}>関係　HUBUNGAN</td>
            <td style={{ ...td, ...bg, textAlign: 'center' }}>職業 PEKERJAAN</td>
            <td style={{ ...td, ...bg, textAlign: 'center' }}>年齢 USIA</td>
            <td style={{ ...td, ...bg, textAlign: 'center' }}>日本の住所 ALAMAT DI JEPANG</td>
          </tr>
          <tr>
            {cell(data.kenalan_jepang_detail || '', 'kenalan_jepang_detail', { ...td, height: '25px' })}
            {cell(data.hubungan_keluarga_jepang || '', 'hubungan_keluarga_jepang', td)}
            <td style={td}></td>
            <td style={td}></td>
            <td style={td}></td>
          </tr>
        </tbody>
      </table>

      {/* ── CATATAN TAMBAHAN ── */}
      <table style={tbl}>
        <tbody>
          <tr>
            <td style={{ ...td, ...bg, textAlign: 'center' }}>付記　CATATAN TAMBAHAN</td>
          </tr>
          <tr>
            {cell(data.catatan_tambahan || '', 'catatan_tambahan', { ...td, height: '40px', verticalAlign: 'top' })}
          </tr>
        </tbody>
      </table>

      </div>
    </RichTextContext.Provider>
  )
}

// ── STYLE HELPERS ──
const tbl: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '10px',
  tableLayout: 'fixed',
  fontFamily: '"MS PGothic", "ＭＳ Ｐゴシック", "MS Gothic", sans-serif',
}

const td: React.CSSProperties = {
  border: '1px solid #000',
  padding: '3px 5px',
  verticalAlign: 'middle',
  fontSize: '10px',
}

const bg: React.CSSProperties = {
  backgroundColor: '#a5bfdf',
}