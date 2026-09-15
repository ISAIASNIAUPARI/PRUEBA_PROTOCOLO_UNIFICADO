'use client'

import { useEdit } from './EditProvider'

export function Toolbar() {
  const { save, saving, saved, error, dirty } = useEdit()

  return (
    <div className="sticky top-0 z-[999] flex flex-wrap items-center justify-between gap-3 border-b border-admin-line bg-white px-4 py-3 shadow-sm">
      <span className="font-medium text-admin-ink">Panel de edición — La Gloria Familia Unida</span>
      <div className="flex items-center gap-3">
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
    </div>
  )
}
