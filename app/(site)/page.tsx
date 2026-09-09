import { About } from '@/components/About'
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
  hero,
  menu,
  objects3d,
  reservations,
  siteSettings,
  specials,
} from '@/content/site'

export default function HomePage() {
  return (
    <>
      <ScrollEffects />

      <Nav
        brandName={siteSettings.brandName}
        brandTagline={siteSettings.brandTagline}
        items={siteSettings.navItems}
        showLanguageSwitch={siteSettings.showLanguageSwitch}
      />

      <Hero title={hero.title} slides={hero.slides} ctas={hero.ctas} />

      <About
        heading={about.heading}
        body={about.body}
        imageLeft={about.imageLeft}
        imageRight={about.imageRight}
      />

      {experience.enabled !== false && (
        <FrameScroll
          heading={experience.heading}
          subheading={experience.subheading}
        />
      )}

      {objects3d.enabled !== false && <Objects3D />}

      <Specials
        heading={specials.heading}
        subheading={specials.subheading}
        videoUrl={specials.videoUrl}
        dishes={specials.dishes}
      />

      <MenuSection
        heading={menu.heading}
        subheading={menu.subheading}
        watermark={menu.watermark}
        videoUrl={menu.videoUrl}
        categories={menu.categories}
        buttonLabel={menu.buttonLabel}
        buttonHref={menu.buttonHref}
      />

      <Reservations
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

      <Footer
        brandName={siteSettings.brandName}
        brandTagline={siteSettings.brandTagline}
        scheduleTitle={footer.scheduleTitle}
        schedule={footer.schedule}
        reserveTitle={footer.reserveTitle}
        reserveLinkLabel={footer.reserveLinkLabel}
        reserveLinkHref={footer.reserveLinkHref}
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
