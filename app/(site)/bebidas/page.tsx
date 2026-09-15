import type { Metadata } from 'next'
import Link from 'next/link'

import { drinksPage, siteSettings } from '@/lib/content'

export const metadata: Metadata = {
  title: `${drinksPage.title} – ${siteSettings.siteTitle}`,
  description: drinksPage.intro,
}

export default function BebidasPage() {
  const page = drinksPage
  const drinks = page.drinks

  return (
    <div className="bebidas-page">
      <nav>
        <Link href="/" className="logo">
          {siteSettings.brandName}
          <span>{siteSettings.brandTagline}</span>
        </Link>
        <Link href="/" className="back">
          {page.backLabel}
        </Link>
      </nav>

      <section className="hero">
        {page.heroLabel && <p className="hero-label">{page.heroLabel}</p>}
        <h1>{page.title}</h1>
        <div className="divider" />
        {page.intro && <p>{page.intro}</p>}
      </section>

      <main className="menu-section">
        {page.sectionTitle && (
          <p className="section-title">{page.sectionTitle}</p>
        )}
        <div className="drinks-grid">
          {drinks.map((d, i) => (
            <div className="card" key={i}>
              <div className="card-visual">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.image.url}
                  alt={d.name || ''}
                  loading="lazy"
                  decoding="async"
                />
                {d.tag && (
                  <div className="overlay">
                    <span className="flavor-tag">{d.tag}</span>
                  </div>
                )}
              </div>
              <div className="card-body">
                <div className="card-name">{d.name}</div>
                <div className="card-desc">{d.description}</div>
                <div className="card-footer">
                  <span className="price">{d.price}</span>
                  <div className="size-tags">
                    {(d.sizes ?? []).map((s) => (
                      <span className="size-tag" key={s}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer>{page.footerText}</footer>
    </div>
  )
}
