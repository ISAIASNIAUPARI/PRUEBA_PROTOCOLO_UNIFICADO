import { About } from '@/components/About'
import { DynamicSection } from '@/components/sections/DynamicSection'
import { FloatingButtons } from '@/components/FloatingButtons'
import { Footer } from '@/components/Footer'
import { FrameScroll } from '@/components/FrameScroll'
import { Hero } from '@/components/Hero'
import { MenuSection } from '@/components/MenuSection'
import { Nav } from '@/components/Nav'
import { Objects3D } from '@/components/Objects3D'
import { Reservations } from '@/components/Reservations'
import { ScrollEffects } from '@/components/ScrollEffects'
import { Specials } from '@/components/Specials'
import {
  about,
  experience,
  footer,
  getDynamicSections,
  hero,
  menu,
  objects3d,
  pageLayout,
  reservations,
  siteSettings,
  specials,
} from '@/lib/content'

function renderBaseSection(id: string) {
  switch (id) {
    case 'hero':
      return <Hero key={id} title={hero.title} slides={hero.slides} buttons={hero.buttons} />
    case 'about':
      return <About key={id} heading={about.heading} body={about.body} imageLeft={about.imageLeft} imageRight={about.imageRight} />
    case 'experience':
      return experience.enabled !== false ? <FrameScroll key={id} heading={experience.heading} subheading={experience.subheading} /> : null
    case 'objects3d':
      return objects3d.enabled !== false ? (
        <Objects3D key={id} heading={objects3d.heading} subheading={objects3d.subheading} items={objects3d.items} />
      ) : null
    case 'specials':
      return <Specials key={id} heading={specials.heading} subheading={specials.subheading} videoUrl={specials.videoUrl} dishes={specials.dishes} />
    case 'menu':
      return (
        <MenuSection
          key={id}
          heading={menu.heading}
          subheading={menu.subheading}
          watermark={menu.watermark}
          videoUrl={menu.videoUrl}
          categories={menu.categories}
          buttons={menu.buttons}
        />
      )
    case 'reservations':
      return (
        <Reservations
          key={id}
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
        />
      )
    default:
      return null
  }
}

export default function HomePage() {
  const dynamicSections = getDynamicSections()

  return (
    <>
      <ScrollEffects />

      <Nav
        brandName={siteSettings.brandName}
        brandTagline={siteSettings.brandTagline}
        items={siteSettings.navItems}
        showLanguageSwitch={siteSettings.showLanguageSwitch}
      />

      {pageLayout.sections
        .filter((s) => s.visible)
        .map((s) =>
          s.type ? (
            dynamicSections[s.id] ? (
              <DynamicSection key={s.id} id={s.id} type={s.type} data={dynamicSections[s.id].data} />
            ) : null
          ) : (
            renderBaseSection(s.id)
          )
        )}

      <Footer
        brandName={siteSettings.brandName}
        brandTagline={siteSettings.brandTagline}
        scheduleTitle={footer.scheduleTitle}
        schedule={footer.schedule}
        reserveTitle={footer.reserveTitle}
        reserveButtons={footer.reserveButtons}
        socialTitle={footer.socialTitle}
        socials={footer.socials}
        copyright={footer.copyright}
      />

      <FloatingButtons
        drinksEnabled={siteSettings.drinksButtonEnabled}
        drinksLabel={siteSettings.drinksButtonLabel}
        chatEnabled={siteSettings.chatButtonEnabled}
        chatWebhookUrl={siteSettings.chatWebhookUrl}
        chatTitle={siteSettings.chatTitle}
        chatSubtitle={siteSettings.chatSubtitle}
        chatWelcome={siteSettings.chatWelcome}
        chatPlaceholder={siteSettings.chatPlaceholder}
        chatNotifications={siteSettings.chatNotifications}
      />
    </>
  )
}
