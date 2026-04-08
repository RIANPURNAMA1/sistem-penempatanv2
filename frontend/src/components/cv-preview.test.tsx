import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import KandidatCVPreview from '../components/KandidatCVPreview'
import { TemplateClassic, TemplateModern, TemplateSimple } from '../components/cv-templates'

const mockData = {
  nama_romaji: 'John Doe',
  nama_katakana: 'ジョン・ドー',
  tempat_lahir: 'Jakarta',
  tanggal_lahir: '1995-05-15',
  umur: 29,
  jenis_kelamin: 'Laki-laki',
  pendidikan_terakhir: 'S1',
  agama: 'Kristen',
  golongan_darah: 'A',
  nomor_hp: '081234567890',
  email: 'john@example.com',
  level_jlpt: 'N3',
  level_jft: 'F',
  hobi: 'Olahraga',
  keahlian: 'Programming',
}

describe('KandidatCVPreview', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <KandidatCVPreview data={mockData} onClose={() => {}} />
      </BrowserRouter>
    )
    expect(screen.getByText('Preview CV')).toBeInTheDocument()
  })

  it('shows all template buttons', () => {
    render(
      <BrowserRouter>
        <KandidatCVPreview data={mockData} onClose={() => {}} />
      </BrowserRouter>
    )
    expect(screen.getByText('Classic')).toBeInTheDocument()
    expect(screen.getByText('Modern')).toBeInTheDocument()
    expect(screen.getByText('Simple')).toBeInTheDocument()
  })

  it('shows download buttons', () => {
    render(
      <BrowserRouter>
        <KandidatCVPreview data={mockData} onClose={() => {}} />
      </BrowserRouter>
    )
    expect(screen.getByText('PDF')).toBeInTheDocument()
    expect(screen.getByText('Excel')).toBeInTheDocument()
    expect(screen.getByText('Word')).toBeInTheDocument()
  })

  it('displays kandidat name', () => {
    render(
      <BrowserRouter>
        <KandidatCVPreview data={mockData} onClose={() => {}} />
      </BrowserRouter>
    )
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})

describe('CV Templates', () => {
  it('TemplateClassic renders correctly', () => {
    const { container } = render(<TemplateClassic data={mockData} />)
    expect(container.querySelector('.border-2')).toBeInTheDocument()
  })

  it('TemplateModern renders correctly', () => {
    const { container } = render(<TemplateModern data={mockData} />)
    expect(container.querySelector('.grid')).toBeInTheDocument()
  })

  it('TemplateSimple renders correctly', () => {
    const { container } = render(<TemplateSimple data={mockData} />)
    expect(container.querySelector('.p-4')).toBeInTheDocument()
  })
})
