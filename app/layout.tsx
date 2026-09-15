import type { Metadata } from 'next'
import {
  Montserrat,
  Pinyon_Script,
  Playfair_Display,
  Poppins,
} from 'next/font/google'

/**
 * Layout raíz.
 *
 * Sólo carga las fuentes y la etiqueta <html>. El CSS del sitio se importa
 * en app/(site)/layout.tsx.
 *
 * Las fuentes son las mismas de Google que usaba el HTML original, pero
 * servidas desde nuestro propio dominio: sin peticiones a terceros y sin
 * el parpadeo de texto que provoca @import.
 */

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-poppins',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const pinyon = Pinyon_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-pinyon',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'La Gloria Familia Unida',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} ${playfair.variable} ${pinyon.variable} ${montserrat.variable}`}
    >
      <head>
        {/* Pre-conecta a CDNs externos antes de que el parser llegue a las imágenes */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
      </head>
      <body>{children}</body>
    </html>
  )
}
