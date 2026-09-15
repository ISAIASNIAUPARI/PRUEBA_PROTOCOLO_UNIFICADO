export type ImageRef = { url: string; alt?: string }
export type ButtonRef = { text: string; href: string }

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
  chatNotifications: string[]
}

export type Hero = {
  title: string
  slides: ImageRef[]
  buttons: ButtonRef[]
}

export type About = {
  heading: string
  body: string
  imageLeft: ImageRef | null
  imageRight: ImageRef | null
}

export type Experience = {
  heading: string
  subheading: string
  enabled: boolean
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
  enabled: boolean
  heading: string
  subheading: string
  items: Object3DItem[]
}

export type Dish = { name: string; url: string }

export type Specials = {
  heading: string
  subheading: string
  videoUrl: string
  dishes: Dish[]
}

export type MenuItem = { name: string; description: string; price: string }
export type MenuCategory = { title: string; items: MenuItem[] }

export type MenuSectionData = {
  heading: string
  subheading: string
  watermark: string
  videoUrl: string
  button: ButtonRef
  categories: MenuCategory[]
}

export type Reservations = {
  heading: string
  lead: string
  backgroundUrl: string | null
  backgroundAlt?: string
  partySizeOptions: string[]
  submitLabel: string
  reservationEmail: string
  orText?: string
  phoneDisplay?: string
  phoneNumber?: string
  contactName?: string
  address?: string
  contactEmail?: string
}

export type ScheduleRow = { days: string; hours: string }
export type Social = { network: string; url?: string }

export type Footer = {
  scheduleTitle: string
  schedule: ScheduleRow[]
  reserveTitle: string
  reserveButton: ButtonRef
  socialTitle: string
  socials: Social[]
  copyright: string
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
}
