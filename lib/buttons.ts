import type { ButtonRef, ThemeColorChoice } from '@/lib/types'

/** Construye el link real a partir de hrefType + href guardado. */
export function resolveButtonHref(button: Pick<ButtonRef, 'href' | 'hrefType'>): string {
  switch (button.hrefType) {
    case 'whatsapp': {
      const digits = button.href.replace(/\D/g, '')
      return digits ? `https://wa.me/${digits}` : '#'
    }
    case 'phone': {
      const digits = button.href.replace(/[^\d+]/g, '')
      return digits ? `tel:${digits}` : '#'
    }
    case 'anchor':
    case 'url':
    default:
      return button.href || '#'
  }
}

export function isSafeHref(href: string): boolean {
  return !/^\s*(javascript:|data:)/i.test(href)
}

export function newButtonId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `btn-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function themeColorVar(choice: ThemeColorChoice | undefined | null): string | undefined {
  if (!choice) return undefined
  return `var(--color-${choice})`
}
