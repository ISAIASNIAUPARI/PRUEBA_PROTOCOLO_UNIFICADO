'use client'

import { About } from '@/components/About'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/Hero'
import { MenuSection } from '@/components/MenuSection'
import { Nav } from '@/components/Nav'
import { Objects3D } from '@/components/Objects3D'
import { Reservations } from '@/components/Reservations'
import { Specials } from '@/components/Specials'
import type {
  About as AboutT,
  Experience,
  Footer as FooterT,
  Hero as HeroT,
  MenuSectionData,
  Objects3D as Objects3DT,
  Reservations as ReservationsT,
  SiteSettings,
  Specials as SpecialsT,
} from '@/lib/types'

import { useEdit } from './EditProvider'
import { Toolbar } from './Toolbar'

/**
 * Cablea cada sección real del sitio en modo edit=true. Reutiliza los
 * mismos componentes que ve el visitante público — el cliente ve
 * exactamente lo que va a publicar.
 */
export function AdminApp() {
  const { data, update } = useEdit()

  const siteSettings = data.siteSettings as SiteSettings
  const hero = data.hero as HeroT
  const about = data.about as AboutT
  const experience = data.experience as Experience
  const objects3d = data.objects3d as Objects3DT
  const specials = data.specials as SpecialsT
  const menu = data.menu as MenuSectionData
  const reservations = data.reservations as ReservationsT
  const footer = data.footer as FooterT

  return (
    <>
      <Toolbar />

      <Nav
        brandName={siteSettings.brandName}
        brandTagline={siteSettings.brandTagline}
        items={siteSettings.navItems}
        showLanguageSwitch={siteSettings.showLanguageSwitch}
      />

      <Hero edit title={hero.title} slides={hero.slides} buttons={hero.buttons} onChange={(next) => update('hero', next)} />

      <About
        edit
        heading={about.heading}
        body={about.body}
        imageLeft={about.imageLeft}
        imageRight={about.imageRight}
        onChange={(next) => update('about', next)}
      />

      {/* La animación de frames y los objetos 3D no llevan overlay de edición: son
          media técnico generado aparte (ver protocolo de frames/3D), no contenido
          de texto o imagen simple del día a día del cliente. */}
      {experience.enabled !== false && (
        <div className="border-t border-dashed border-admin-line bg-admin-bg px-4 py-2 text-xs text-admin-ink/60">
          Sección &ldquo;{experience.heading}&rdquo; (animación por scroll) — no editable desde aquí.
        </div>
      )}

      {objects3d.enabled !== false && (
        <Objects3D
          edit
          heading={objects3d.heading}
          subheading={objects3d.subheading}
          items={objects3d.items}
          onChange={(next) => update('objects3d', next)}
        />
      )}

      <Specials
        edit
        heading={specials.heading}
        subheading={specials.subheading}
        videoUrl={specials.videoUrl}
        dishes={specials.dishes}
        onChange={(next) => update('specials', next)}
      />

      <MenuSection
        edit
        heading={menu.heading}
        subheading={menu.subheading}
        watermark={menu.watermark}
        videoUrl={menu.videoUrl}
        categories={menu.categories}
        button={menu.button}
        onChange={(next) => update('menu', next)}
      />

      <Reservations
        edit
        heading={reservations.heading}
        lead={reservations.lead}
        backgroundUrl={reservations.backgroundUrl}
        backgroundAlt={reservations.backgroundAlt}
        partySizeOptions={reservations.partySizeOptions}
        submitLabel={reservations.submitLabel}
        reservationEmail={reservations.reservationEmail}
        orText={reservations.orText}
        phoneDisplay={reservations.phoneDisplay}
        phoneNumber={reservations.phoneNumber}
        contactName={reservations.contactName}
        address={reservations.address}
        contactEmail={reservations.contactEmail}
        onChange={(next) => update('reservations', next)}
      />

      <Footer
        edit
        brandName={siteSettings.brandName}
        brandTagline={siteSettings.brandTagline}
        scheduleTitle={footer.scheduleTitle}
        schedule={footer.schedule}
        reserveTitle={footer.reserveTitle}
        reserveButton={footer.reserveButton}
        socialTitle={footer.socialTitle}
        socials={footer.socials}
        copyright={footer.copyright}
        onChange={(next) => update('footer', next)}
      />
    </>
  )
}
