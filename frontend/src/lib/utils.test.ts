import { describe, it, expect } from 'vitest'
import { formatDate, formatCurrency, cn } from './utils'

describe('utils', () => {
  describe('formatDate', () => {
    it('should return - for null', () => {
      expect(formatDate(null)).toBe('-')
    })

    it('should return - for empty string', () => {
      expect(formatDate('')).toBe('-')
    })

    it('should format date correctly', () => {
      const result = formatDate('2024-01-15')
      expect(result).toContain('15')
      expect(result).toContain('Januari')
      expect(result).toContain('2024')
    })

    it('should format date with Date object', () => {
      const date = new Date('2024-06-20')
      const result = formatDate(date)
      expect(result).toContain('20')
      expect(result).toContain('Juni')
    })
  })

  describe('formatCurrency', () => {
    it('should format number as IDR currency', () => {
      const result = formatCurrency(1000000)
      expect(result).toContain('Rp')
      expect(result).toContain('1.000.000')
    })

    it('should format zero', () => {
      const result = formatCurrency(0)
      expect(result).toContain('Rp')
    })
  })

  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('foo', 'bar')
      expect(result).toContain('foo')
      expect(result).toContain('bar')
    })

    it('should handle conditional classes', () => {
      const result = cn('foo', false && 'bar', 'baz')
      expect(result).toContain('foo')
      expect(result).toContain('baz')
      expect(result).not.toContain('bar')
    })
  })
})
