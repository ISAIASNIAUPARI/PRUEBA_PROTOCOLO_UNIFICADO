import fs from 'node:fs'
import path from 'node:path'

import aboutJson from '@/content/about.json'
import drinksPageJson from '@/content/drinksPage.json'
import experienceJson from '@/content/experience.json'
import footerJson from '@/content/footer.json'
import heroJson from '@/content/hero.json'
import menuJson from '@/content/menu.json'
import objects3dJson from '@/content/objects3d.json'
import pageLayoutJson from '@/content/pageLayout.json'
import reservationsJson from '@/content/reservations.json'
import siteSettingsJson from '@/content/siteSettings.json'
import specialsJson from '@/content/specials.json'
import themeJson from '@/content/theme.json'
import type {
  About,
  DrinksPage,
  DynamicSectionType,
  Experience,
  Footer,
  Hero,
  MenuSectionData,
  Objects3D,
  PageLayout,
  Reservations,
  SiteSettings,
  Specials,
  Theme,
} from '@/lib/types'

/**
 * Cada sección real de la web, tipada, leída de /content/*.json.
 * El admin escribe estos mismos archivos vía commit a GitHub.
 */
export const siteSettings = siteSettingsJson as SiteSettings
export const hero = heroJson as Hero
export const about = aboutJson as About
export const experience = experienceJson as Experience
export const objects3d = objects3dJson as Objects3D
export const specials = specialsJson as Specials
export const menu = menuJson as MenuSectionData
export const reservations = reservationsJson as Reservations
export const footer = footerJson as Footer
export const drinksPage = drinksPageJson as DrinksPage
export const pageLayout = pageLayoutJson as PageLayout
export const theme = themeJson as Theme

/** Mapa sectionId -> ruta del archivo en el repo, usado por /api/admin/save. */
export const CONTENT_FILES: Record<string, string> = {
  siteSettings: 'content/siteSettings.json',
  hero: 'content/hero.json',
  about: 'content/about.json',
  experience: 'content/experience.json',
  objects3d: 'content/objects3d.json',
  specials: 'content/specials.json',
  menu: 'content/menu.json',
  reservations: 'content/reservations.json',
  footer: 'content/footer.json',
  drinksPage: 'content/drinksPage.json',
  pageLayout: 'content/pageLayout.json',
  theme: 'content/theme.json',
}

/** Ruta del archivo para cualquier sectionId — base o dinámica (plantilla). */
export function sectionFilePath(sectionId: string): string {
  return CONTENT_FILES[sectionId] ?? `content/sections/${sectionId}.json`
}

/**
 * Lee content/sections/*.json del disco (server-only, vía fs — no se puede
 * import() estático porque el set de secciones dinámicas lo crea el cliente
 * desde /admin y no se conoce al momento de compilar).
 */
export function getDynamicSections(): Record<string, { type: DynamicSectionType; data: unknown }> {
  const dir = path.join(process.cwd(), 'content', 'sections')
  const result: Record<string, { type: DynamicSectionType; data: unknown }> = {}
  if (!fs.existsSync(dir)) return result

  const dynamicEntries = pageLayout.sections.filter((s) => s.type)
  for (const entry of dynamicEntries) {
    const filePath = path.join(dir, `${entry.id}.json`)
    if (!fs.existsSync(filePath)) continue
    try {
      const raw = fs.readFileSync(filePath, 'utf-8')
      result[entry.id] = { type: entry.type as DynamicSectionType, data: JSON.parse(raw) }
    } catch {
      // Sección corrupta o ilegible: se omite en vez de romper toda la página.
    }
  }
  return result
}
