import { AdminApp } from '@/components/admin/AdminApp'
import { EditProvider } from '@/components/admin/EditProvider'
import {
  about,
  drinksPage,
  experience,
  footer,
  hero,
  menu,
  objects3d,
  reservations,
  siteSettings,
  specials,
} from '@/lib/content'

export default function AdminPage() {
  const initialData = {
    siteSettings,
    hero,
    about,
    experience,
    objects3d,
    specials,
    menu,
    reservations,
    footer,
    drinksPage,
  }

  return (
    <EditProvider initialData={initialData}>
      <AdminApp />
    </EditProvider>
  )
}
