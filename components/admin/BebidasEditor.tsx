'use client'

import Link from 'next/link'
import { useState } from 'react'

import { DrinksPage } from '@/components/DrinksPage'
import type { DrinksPage as DrinksPageT, SiteSettings } from '@/lib/types'

export function BebidasEditor({
  initialDrinksPage,
  brandName,
  brandTagline,
}: {
  initialDrinksPage: DrinksPageT
  brandName: SiteSettings['brandName']
  brandTagline: SiteSettings['brandTagline']
}) {
  const [data, setData] = useState(initialDrinksPage)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: [{ sectionId: 'drinksPage', data }] }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudo guardar.')
      setDirty(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-admin-bg text-admin-ink" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
      <div className="sticky top-0 z-[999] flex flex-wrap items-center justify-between gap-3 border-b border-admin-line bg-white px-4 py-3 shadow-sm">
        <span className="font-medium text-admin-ink">Panel de edición — Bebidas</span>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="rounded-md border border-admin-line px-3 py-1.5 text-sm font-medium text-admin-ink hover:bg-admin-bg">
            ← Volver
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
        </div>
      </div>
      <DrinksPage
        edit
        data={data}
        brandName={brandName}
        brandTagline={brandTagline}
        onChange={(next) => {
          setData(next)
          setDirty(true)
          setSaved(false)
        }}
      />
    </div>
  )
}
