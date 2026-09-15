import { AdminApp } from '@/components/admin/AdminApp'
import { EditProvider } from '@/components/admin/EditProvider'
import {
  about,
  drinksPage,
  experience,
  footer,
  getDynamicSections,
  hero,
  location,
  menu,
  objects3d,
  pageLayout,
  reservations,
  siteSettings,
  specials,
  theme,
} from '@/lib/content'

export default function AdminPage() {
  const dynamicSections = getDynamicSections()
  const dynamicData: Record<string, unknown> = {}
  for (const [id, section] of Object.entries(dynamicSections)) {
    dynamicData[id] = section.data
  }

  const initialData = {
    siteSettings,
    hero,
    about,
    experience,
    objects3d,
    specials,
    menu,
    reservations,
    location,
    footer,
    drinksPage,
    pageLayout,
    theme,
    ...dynamicData,
  }

  return (
    <EditProvider initialData={initialData} initialLayout={pageLayout} initialTheme={theme}>
      <AdminApp />
    </EditProvider>
  )
}
