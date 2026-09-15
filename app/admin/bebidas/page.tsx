import { BebidasEditor } from '@/components/admin/BebidasEditor'
import { drinksPage, siteSettings } from '@/lib/content'

export default function AdminBebidasPage() {
  return <BebidasEditor initialDrinksPage={drinksPage} brandName={siteSettings.brandName} brandTagline={siteSettings.brandTagline} />
}
