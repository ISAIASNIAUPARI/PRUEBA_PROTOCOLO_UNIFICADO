'use client'

import { About } from '@/components/About'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/Hero'
import { Location } from '@/components/Location'
import { MenuSection } from '@/components/MenuSection'
import { Nav } from '@/components/Nav'
import { Objects3D } from '@/components/Objects3D'
import { Reservations } from '@/components/Reservations'
import { DynamicSection } from '@/components/sections/DynamicSection'
import { Specials } from '@/components/Specials'
import type {
  About as AboutT,
  Experience,
  Footer as FooterT,
  Hero as HeroT,
  LocationSection,
  MenuSectionData,
  Objects3D as Objects3DT,
  Reservations as ReservationsT,
  SiteSettings,
  Specials as SpecialsT,
} from '@/lib/types'

import { useEdit } from './EditProvider'
import { Toolbar } from './Toolbar'

function PositionBadge({ n }: { n: number }) {
  return (
    <span className="pointer-events-none absolute left-2 top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs font-medium text-white">
      {n}
    </span>
  )
}

export function AdminApp() {
  const { data, update, layout, viewMode } = useEdit()

  const siteSettings = data.siteSettings as SiteSettings
  const hero = data.hero as HeroT
  const about = data.about as AboutT
  const experience = data.experience as Experience
  const objects3d = data.objects3d as Objects3DT
  const specials = data.specials as SpecialsT
  const menu = data.menu as MenuSectionData
  const reservations = data.reservations as ReservationsT
  const location = data.location as LocationSection
  const footer = data.footer as FooterT

  function renderBaseSection(id: string) {
    switch (id) {
      case 'hero':
        return <Hero edit title={hero.title} slides={hero.slides} buttons={hero.buttons} onChange={(next) => update('hero', next)} />
      case 'about':
        return (
          <About
            edit
            heading={about.heading}
            body={about.body}
            imageLeft={about.imageLeft}
            imageRight={about.imageRight}
            onChange={(next) => update('about', next)}
          />
        )
      case 'experience':
        return (
          <div className="border-t border-dashed border-admin-line bg-admin-bg px-4 py-3 text-xs text-admin-ink/60">
            Sección &ldquo;{experience.heading}&rdquo; (animación por scroll) — no editable desde aquí.
          </div>
        )
      case 'objects3d':
        return (
          <Objects3D
            edit
            heading={objects3d.heading}
            subheading={objects3d.subheading}
            items={objects3d.items}
            onChange={(next) => update('objects3d', next)}
          />
        )
      case 'specials':
        return (
          <Specials
            edit
            heading={specials.heading}
            subheading={specials.subheading}
            videoUrl={specials.videoUrl}
            dishes={specials.dishes}
            onChange={(next) => update('specials', next)}
          />
        )
      case 'menu':
        return (
          <MenuSection
            edit
            heading={menu.heading}
            subheading={menu.subheading}
            watermark={menu.watermark}
            videoUrl={menu.videoUrl}
            categories={menu.categories}
            buttons={menu.buttons}
            onChange={(next) => update('menu', next)}
          />
        )
      case 'reservations':
        return (
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
        )
      case 'location':
        return (
          <Location
            edit
            subtitle={location.subtitle}
            heading={location.heading}
            address={location.address}
            whatsappNumber={location.whatsappNumber}
            email={location.email}
            hoursText={location.hoursText}
            mapUrl={location.mapUrl}
            mapEmbedUrl={location.mapEmbedUrl}
            formTitle={location.formTitle}
            formSubmitLabel={location.formSubmitLabel}
            onChange={(next) => update('location', next)}
          />
        )
      default:
        return null
    }
  }

  const page = (
    <>
      <Nav
        brandName={siteSettings.brandName}
        brandTagline={siteSettings.brandTagline}
        items={siteSettings.navItems}
        showLanguageSwitch={siteSettings.showLanguageSwitch}
      />

      {layout.sections.map((s, i) => (
        <div key={s.id} className={`relative ${s.visible ? '' : 'opacity-60'}`}>
          <PositionBadge n={i + 1} />
          {!s.visible && (
            <div className="relative z-20 bg-yellow-100 px-4 py-1 text-center text-xs text-yellow-800">Sección oculta — no se muestra en el sitio público</div>
          )}
          {s.type ? (
            <DynamicSection id={s.id} type={s.type} data={data[s.id]} edit onChange={(next) => update(s.id, next)} />
          ) : (
            renderBaseSection(s.id)
          )}
        </div>
      ))}

      <Footer
        edit
        brandName={siteSettings.brandName}
        brandTagline={siteSettings.brandTagline}
        scheduleTitle={footer.scheduleTitle}
        schedule={footer.schedule}
        reserveTitle={footer.reserveTitle}
        reserveButtons={footer.reserveButtons}
        socialTitle={footer.socialTitle}
        socials={footer.socials}
        copyright={footer.copyright}
        onChange={(next) => update('footer', next)}
      />
    </>
  )

  return (
    <>
      <Toolbar />
      {viewMode === 'mobile' ? (
        <div className="flex justify-center bg-admin-line py-6">
          <div className="w-[390px] max-w-full overflow-hidden rounded-[2rem] border-8 border-admin-ink bg-white shadow-xl">{page}</div>
        </div>
      ) : (
        page
      )}
    </>
  )
}
