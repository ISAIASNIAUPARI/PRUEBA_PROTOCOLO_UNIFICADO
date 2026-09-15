import type { Metadata } from 'next'

import { DrinksPage } from '@/components/DrinksPage'
import { drinksPage, siteSettings } from '@/lib/content'

export const metadata: Metadata = {
  title: `${drinksPage.title} – ${siteSettings.siteTitle}`,
  description: drinksPage.intro,
}

export default function BebidasPage() {
  return <DrinksPage data={drinksPage} brandName={siteSettings.brandName} brandTagline={siteSettings.brandTagline} />
}
