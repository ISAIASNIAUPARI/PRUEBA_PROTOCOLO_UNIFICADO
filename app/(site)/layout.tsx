import type { Metadata } from 'next'

import '../globals.css'

import { siteSettings } from '@/content/site'

export const metadata: Metadata = {
  title: siteSettings.siteTitle,
  description: siteSettings.siteDescription,
}

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
