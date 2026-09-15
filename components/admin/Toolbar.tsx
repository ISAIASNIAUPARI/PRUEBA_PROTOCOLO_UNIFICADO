'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState } from 'react'

import { useEdit } from './EditProvider'

const LayoutPanel = dynamic(() => import('./LayoutPanel'), { ssr: false })
const ThemePanel = dynamic(() => import('./ThemePanel'), { ssr: false })

export function Toolbar() {
  const { save, saving, saved, error, dirty, viewMode, setViewMode } = useEdit()
  const [panel, setPanel] = useState<'layout' | 'theme' | null>(null)

  return (
    <div className="sticky top-0 z-[999] flex flex-wrap items-center justify-between gap-3 border-b border-admin-line bg-white px-4 py-3 shadow-sm">
      <span className="font-medium text-admin-ink">Panel de edición — La Gloria Familia Unida</span>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-md border border-admin-line">
          <button
            type="button"
            onClick={() => setViewMode('desktop')}
            title="Vista escritorio"
            className={`px-2.5 py-1.5 text-sm ${viewMode === 'desktop' ? 'bg-admin-primary text-white' : 'text-admin-ink hover:bg-admin-bg'}`}
          >
            🖥️
          </button>
          <button
            type="button"
            onClick={() => setViewMode('mobile')}
            title="Vista móvil"
            className={`px-2.5 py-1.5 text-sm ${viewMode === 'mobile' ? 'bg-admin-primary text-white' : 'text-admin-ink hover:bg-admin-bg'}`}
          >
            📱
          </button>
        </div>

        <button
          type="button"
          onClick={() => setPanel('layout')}
          disabled={viewMode === 'mobile'}
          title={viewMode === 'mobile' ? 'Organizar página solo está disponible en vista escritorio' : undefined}
          className="rounded-md border border-admin-line px-3 py-1.5 text-sm font-medium text-admin-ink hover:bg-admin-bg disabled:cursor-not-allowed disabled:opacity-40"
        >
          ☰ Organizar página
        </button>
        <button
          type="button"
          onClick={() => setPanel('theme')}
          className="rounded-md border border-admin-line px-3 py-1.5 text-sm font-medium text-admin-ink hover:bg-admin-bg"
        >
          🎨 Personalizar tema
        </button>
        <Link
          href="/admin/bebidas"
          className="rounded-md border border-admin-line px-3 py-1.5 text-sm font-medium text-admin-ink hover:bg-admin-bg"
        >
          🍹 Bebidas
        </Link>

        {saving && <span className="text-sm text-admin-ink/60">Guardando…</span>}
        {!saving && saved && <span className="text-sm text-admin-accent">✓ Guardado</span>}
        {!saving && error && <span className="text-sm text-admin-danger">{error}</span>}
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="rounded-md bg-admin-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-admin-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          Guardar
        </button>
        <a
          href="/api/admin/logout"
          className="rounded-md border border-admin-line px-4 py-2 text-sm font-medium text-admin-ink hover:bg-admin-bg"
        >
          Salir
        </a>
      </div>

      {panel === 'layout' && <LayoutPanel onClose={() => setPanel(null)} />}
      {panel === 'theme' && <ThemePanel onClose={() => setPanel(null)} />}
    </div>
  )
}
