'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type NavItem = { label?: string; href?: string; boxed?: boolean }

export function Nav({
  brandName,
  brandTagline,
  items,
  showLanguageSwitch,
}: {
  brandName?: string
  brandTagline?: string
  items?: NavItem[]
  showLanguageSwitch?: boolean
}) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  // La cabecera pasa a fondo oscuro tras 60px de scroll, igual que en el original.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = items ?? []

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`} id="nav">
      <Link href="/#inicio" className="brand" aria-label={brandName}>
        <span className="mark">
          <svg className="glyph" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 13c4-1 7-3 9-7 1 3 3 5 6 5-1 2-4 4-8 4-3 0-6-1-7-2zm9 1c-2 2-5 4-9 4 3 2 8 2 11-1 2-2 3-4 3-6-2 1-3 2-5 3z" />
          </svg>
          <span className="name">{brandName?.replace(' ', ' ')}</span>
        </span>
        <span className="tag">{brandTagline}</span>
      </Link>

      <nav className={`links${open ? ' open' : ''}`} id="links">
        {links.map((item, i) => (
          <Link
            key={`${item.href}-${i}`}
            href={item.href || '#'}
            className={
              item.boxed ? 'boxed' : i === 0 ? 'active' : undefined
            }
            onClick={() => setOpen(false)}
          >
            {item.label}
            {!item.boxed && <span className="ul" />}
          </Link>
        ))}
        {showLanguageSwitch && (
          <span className="lang">
            <span className="flag">
              <i />
              <i />
              <i />
            </span>
            ES ▾
          </span>
        )}
      </nav>

      <button
        className="nav-toggle"
        id="navToggle"
        aria-label="Menú"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  )
}
