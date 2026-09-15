import aboutJson from '@/content/about.json'
import drinksPageJson from '@/content/drinksPage.json'
import experienceJson from '@/content/experience.json'
import footerJson from '@/content/footer.json'
import heroJson from '@/content/hero.json'
import menuJson from '@/content/menu.json'
import objects3dJson from '@/content/objects3d.json'
import reservationsJson from '@/content/reservations.json'
import siteSettingsJson from '@/content/siteSettings.json'
import specialsJson from '@/content/specials.json'
import type {
  About,
  DrinksPage,
  Experience,
  Footer,
  Hero,
  MenuSectionData,
  Objects3D,
  Reservations,
  SiteSettings,
  Specials,
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
}
