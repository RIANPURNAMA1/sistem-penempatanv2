import { describe, it, expect, vi, beforeAll } from 'vitest'
import { generateCVPDF, generateCVExcel, generateCVWord } from './cvGenerator'

global.URL.createObjectURL = vi.fn(() => 'blob:http://localhost')
global.URL.revokeObjectURL = vi.fn()
global.document.body.appendChild = vi.fn()
global.document.body.removeChild = vi.fn()

const mockKandidatData = {
  nama_romaji: 'John Doe',
  nama_katakana: 'ジョン・ドー',
  nama: 'John Doe',
  tempat_lahir: 'Jakarta',
  tanggal_lahir: '1995-05-15',
  umur: 29,
  jenis_kelamin: 'Laki-laki',
  pendidikan_terakhir: 'S1',
  agama: 'Kristen',
  golongan_darah: 'A',
  sim_dimiliki: 'SIM A',
  ukuran_baju: 'L',
  tinggi_badan: 175,
  berat_badan: 70,
  nomor_hp: '081234567890',
  email: 'john@example.com',
  alamat_lengkap: 'Jl. Jakarta No. 1',
  level_jlpt: 'N3',
  level_jft: 'F',
  sertifikat_ssw: 'Pengembangan Software',
  lama_belajar_jepang: '2 tahun',
  level_bahasa_jepang: 'Menengah',
  pernah_ke_jepang: true,
  keluarga_di_jepang: false,
  tujuan_ke_jepang: 'Bekerja',
  alasan_ke_jepang: 'Pengalaman luar negeri',
  hobi: 'Olahraga',
  keahlian: 'Programming',
  pendidikan: [
    {
      jenjang: 'S1',
      nama_sekolah: 'Universitas Indonesia',
      bulan_masuk: 'Agustus',
      tahun_masuk: '2013',
      bulan_lulus: 'Mei',
      tahun_lulus: '2017',
     jurusan: 'Teknik Informatika'
    }
  ],
  pengalaman: [
    {
      nama_perusahaan: 'PT Tech Indonesia',
      posisi: 'Software Engineer',
      bulan_masuk: 'Juli',
      tahun_masuk: '2017',
      bulan_keluar: 'Desember',
      tahun_keluar: '2023',
      masih_bekerja: false,
      deskripsi_pekerjaan: 'Develop web applications'
    }
  ],
  keluarga: [
    { hubungan: 'Ayah', nama: 'John Smith', usia: 55, pekerjaan: 'Wiraswasta' },
    { hubungan: 'Ibu', nama: 'Jane Doe', usia: 52, pekerjaan: 'Guru' }
  ]
}

describe('cvGenerator', () => {
  describe('generateCVPDF', () => {
    it('should generate PDF without errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await generateCVPDF(mockKandidatData)
      
      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle missing optional fields', async () => {
      const minimalData = {
        nama_romaji: 'Test User',
        email: 'test@example.com'
      }
      
      await generateCVPDF(minimalData)
    })
  })

  describe('generateCVExcel', () => {
    it('should generate Excel without errors', async () => {
      await generateCVExcel(mockKandidatData)
    })

    it('should handle empty arrays', async () => {
      const emptyData = {
        nama_romaji: 'Test User',
        email: 'test@example.com',
        pendidikan: [],
        pengalaman: [],
        keluarga: []
      }
      
      await generateCVExcel(emptyData)
    })
  })

  describe('generateCVWord', () => {
    it('should generate Word without errors', async () => {
      await generateCVWord(mockKandidatData)
    })

    it('should handle missing fields', async () => {
      const partialData = {
        nama_romaji: 'Partial User'
      }
      
      await generateCVWord(partialData)
    })
  })
})
