export type ImageRef = { url: string; alt?: string; focalX?: number; focalY?: number }

import type { TextColors, TextSize, TextSizes, TextWeights } from './text-colors'

export type { TextColors, TextSize, TextSizes, TextWeights }

export type ThemeColorChoice = 'primary' | 'secondary' | 'accent'
export type ButtonHrefType = 'anchor' | 'url' | 'whatsapp' | 'phone'

export type ButtonRef = {
  id: string
  text: string
  href: string
  hrefType: ButtonHrefType
  /** Posición libre (%, 0-100) dentro de la sección — independientes entre vistas. */
  desktopX?: number
  desktopY?: number
  mobileX?: number
  mobileY?: number
  color?: ThemeColorChoice
}

/**
 * Un aviso de la burbuja. `enabled: false` lo deja en el listado del panel
 * pero fuera de la rotación del sitio público: apagar un mensaje no obliga a
 * borrarlo y volver a escribirlo.
 */
export type ChatNotification = { text: string; enabled: boolean }

/** Acepta el formato viejo (`string[]`) y el nuevo. Un string suelto se da
 *  por activo: así estaba antes, y apagarlo en la migración sería cambiarle
 *  el sitio al cliente sin que lo pidiera. */
export function normalizeChatNotifications(raw: unknown): ChatNotification[] {
  if (!Array.isArray(raw)) return []
  return raw.map((n) =>
    typeof n === 'string'
      ? { text: n, enabled: true }
      : { text: String((n as ChatNotification)?.text ?? ''), enabled: (n as ChatNotification)?.enabled !== false }
  )
}

export type SiteSettings = {
  brandName: string
  brandTagline: string
  siteTitle: string
  siteDescription: string
  navItems: { label: string; href: string; boxed?: boolean }[]
  showLanguageSwitch: boolean
  drinksButtonEnabled: boolean
  drinksButtonLabel: string
  chatButtonEnabled: boolean
  chatWebhookUrl: string
  chatTitle: string
  chatSubtitle: string
  chatWelcome: string
  chatPlaceholder: string
  /**
   * Avisos rotativos de la burbuja flotante. Hasta 10, editables y
   * reordenables desde Configuración. El contenido antiguo los guardaba como
   * `string[]` pelado: `normalizeChatNotifications()` acepta las dos formas.
   */
  chatNotifications: (string | ChatNotification)[]
  /** Segundos que cada aviso permanece visible. Entre 2 y 35. */
  chatIntervalSec?: number
}

export type LocationSection = {
  subtitle: string
  heading: string
  address: string
  whatsappNumber: string
  email: string
  hoursText: string
  /** Link tal cual lo comparte Google Maps (puede ser corto) — solo para el botón "Abrir en Maps". */
  mapUrl: string
  /** Link largo con coordenadas ("...@lat,lng,zoomz...") — solo para armar el iframe. Si está vacío, se arma el mapa buscando por `address`. */
  mapEmbedUrl: string
  formTitle: string
  formSubmitLabel: string
  /** Overrides por texto de esta sección (ver lib/text-colors.ts). */
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
}

export type Theme = {
  colorPrimary: string
  colorSecondary: string
  colorAccent: string
}

export type SectionLayoutEntry = {
  id: string
  label: string
  visible: boolean
  /** Solo presente en secciones dinámicas creadas desde plantilla. */
  type?: DynamicSectionType
}

export type PageLayout = { sections: SectionLayoutEntry[] }

export type Hero = {
  title: string
  slides: ImageRef[]
  buttons: ButtonRef[]
  /** Overrides por texto de esta sección (ver lib/text-colors.ts). */
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
}

export type About = {
  heading: string
  body: string
  imageLeft: ImageRef | null
  imageRight: ImageRef | null
  /** Overrides por texto de esta sección (ver lib/text-colors.ts). */
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
}

export type Experience = {
  heading: string
  subheading: string
  /** Overrides por texto de esta sección (ver lib/text-colors.ts). */
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
}

export type Object3DItem = {
  id: string
  label: string
  name: string
  description: string
  price?: string
  modelUrl: string
}

export type Objects3D = {
  heading: string
  subheading: string
  items: Object3DItem[]
  /** Overrides por texto de esta sección (ver lib/text-colors.ts). */
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
}

export type Dish = { name: string; url: string; focalX?: number; focalY?: number }

export type Specials = {
  heading: string
  subheading: string
  videoUrl: string
  dishes: Dish[]
  /** Overrides por texto de esta sección (ver lib/text-colors.ts). */
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
}

export type MenuItem = { name: string; description: string; price: string }
export type MenuCategory = { title: string; items: MenuItem[] }

export type MenuSectionData = {
  heading: string
  subheading: string
  watermark: string
  videoUrl: string
  buttons: ButtonRef[]
  categories: MenuCategory[]
  /** Overrides por texto de esta sección (ver lib/text-colors.ts). */
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
}

export type Reservations = {
  heading: string
  lead: string
  backgroundUrl: string | null
  backgroundAlt?: string
  backgroundFocalX?: number
  backgroundFocalY?: number
  partySizeOptions: string[]
  submitLabel: string
  reservationEmail: string
  orText?: string
  phoneDisplay?: string
  phoneNumber?: string
  contactName?: string
  address?: string
  contactEmail?: string
  /** Overrides por texto de esta sección (ver lib/text-colors.ts). */
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
}

export type ScheduleRow = { days: string; hours: string }
export type Social = { network: string; url?: string }

export type Footer = {
  scheduleTitle: string
  schedule: ScheduleRow[]
  reserveTitle: string
  reserveButtons: ButtonRef[]
  socialTitle: string
  socials: Social[]
  copyright: string
  /** Overrides por texto de esta sección (ver lib/text-colors.ts). */
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
}

export type Drink = {
  name: string
  tag: string
  price: string
  description: string
  sizes: string[]
  image: ImageRef
}

export type DrinksPage = {
  heroLabel: string
  title: string
  intro: string
  backLabel: string
  sectionTitle: string
  footerText: string
  drinks: Drink[]
  /** Overrides por texto de esta sección (ver lib/text-colors.ts). */
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
}

// ---- Secciones dinámicas desde plantilla (Fase D, Parte 3) ----

export type DynamicSectionType = 'cta-banner' | 'menu-grid' | 'text-block' | 'photo-gallery' | 'faq'

export const DYNAMIC_SECTION_LABELS: Record<DynamicSectionType, string> = {
  'cta-banner': 'Llamada a la acción',
  'menu-grid': 'Carta / Menú',
  'text-block': 'Bloque de texto',
  'photo-gallery': 'Galería de fotos',
  faq: 'Preguntas frecuentes',
}

export type CtaBannerData = {
  subtitle: string
  heading: string
  body: string
  backgroundImage: ImageRef | null
  backgroundColor?: ThemeColorChoice
  buttons: ButtonRef[]
  /** Overrides por texto de esta sección (ver lib/text-colors.ts). */
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
}

export type MenuGridItem = { id: string; image: ImageRef | null; name: string; price: string; description: string }
export type MenuGridData = {
  subtitle: string
  heading: string
  backgroundColor?: ThemeColorChoice
  items: MenuGridItem[]
  /** Overrides por texto de esta sección (ver lib/text-colors.ts). */
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
}

/**
 * Un párrafo nace SIEMPRE con id estable: los overrides de color y tamaño se
 * guardan por esa clave, así que sin id se guardarían por posición y se
 * desplazarían al reordenar o borrar (ver Parte 6 de la nota 20 del cerebro).
 *
 * El contenido antiguo guardaba `string[]` pelado. `normalizeParagraphs()` lo
 * convierte al vuelo usando el ÍNDICE como id ("0", "1", …), que es justo la
 * clave con la que se guardaron sus overrides: así el estilo ya aplicado no se
 * pierde en la migración. Los párrafos nuevos usan un uuid.
 */
export type TextBlockParagraph = { id: string; text: string }

/** Id de párrafo nuevo. No se reutiliza `newButtonId()` de lib/buttons.ts
 *  porque ese módulo ya importa de acá y se armaría un ciclo. */
export function newParagraphId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function normalizeParagraphs(raw: unknown): TextBlockParagraph[] {
  if (!Array.isArray(raw)) return []
  return raw.map((p, i) =>
    typeof p === 'string'
      ? { id: String(i), text: p }
      : { id: String((p as TextBlockParagraph)?.id ?? i), text: String((p as TextBlockParagraph)?.text ?? '') }
  )
}

export type TextBlockData = {
  subtitle: string
  heading: string
  /** Puede venir como `string[]` del contenido antiguo: normalizar al leer. */
  paragraphs: TextBlockParagraph[] | string[]
  image: ImageRef | null
  backgroundColor?: ThemeColorChoice
  /** Overrides por texto de esta sección (ver lib/text-colors.ts). */
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
}

export type PhotoGalleryItem = { id: string; image: ImageRef; caption: string }
export type PhotoGalleryData = {
  subtitle: string
  heading: string
  backgroundColor?: ThemeColorChoice
  photos: PhotoGalleryItem[]
  /** Overrides por texto de esta sección (ver lib/text-colors.ts). */
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
}

export type FaqItem = { id: string; question: string; answer: string }
export type FaqData = {
  subtitle: string
  heading: string
  backgroundColor?: ThemeColorChoice
  items: FaqItem[]
  /** Overrides por texto de esta sección (ver lib/text-colors.ts). */
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
}

export function emptySectionData(type: DynamicSectionType): unknown {
  switch (type) {
    case 'cta-banner':
      return { subtitle: '', heading: '', body: '', backgroundImage: null, buttons: [] } satisfies CtaBannerData
    case 'menu-grid':
      return { subtitle: '', heading: '', items: [] } satisfies MenuGridData
    case 'text-block':
      return { subtitle: '', heading: '', paragraphs: [{ id: newParagraphId(), text: '' }], image: null } satisfies TextBlockData
    case 'photo-gallery':
      return { subtitle: '', heading: '', photos: [] } satisfies PhotoGalleryData
    case 'faq':
      return { subtitle: '', heading: '', items: [] } satisfies FaqData
  }
}
