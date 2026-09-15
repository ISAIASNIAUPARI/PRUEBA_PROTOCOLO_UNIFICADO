'use client'

import { useState } from 'react'

import type { Theme } from '@/lib/types'

import { useEdit } from './EditProvider'

const FIELDS: { key: keyof Theme; label: string }[] = [
  { key: 'colorPrimary', label: 'Primario' },
  { key: 'colorSecondary', label: 'Secundario' },
  { key: 'colorAccent', label: 'Acento' },
]

export default function ThemePanel({ onClose }: { onClose: () => void }) {
  const { theme, setThemePreview, saveTheme, themeSaving, themeError } = useEdit()
  const [openedWith] = useState<Theme>(theme)
  const [saved, setSaved] = useState(false)

  function revertAndClose() {
    setThemePreview(openedWith)
    onClose()
  }

  async function handleSave() {
    try {
      await saveTheme(theme)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      // el error ya queda expuesto vía themeError
    }
  }

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/50 p-4" onClick={revertAndClose}>
      <div className="w-full max-w-sm rounded-lg bg-white p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-admin-ink">🎨 Personalizar tema</h3>
          <button type="button" onClick={revertAndClose} className="rounded px-2 text-admin-ink/60 hover:bg-admin-bg">
            ×
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {FIELDS.map((f) => (
            <div key={f.key} className="flex items-center justify-between gap-3">
              <label className="text-sm text-admin-ink">{f.label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme[f.key]}
                  onChange={(e) => setThemePreview({ ...theme, [f.key]: e.target.value })}
                  className="h-8 w-10 cursor-pointer rounded border border-admin-line"
                />
                <span className="w-16 font-mono text-xs text-admin-ink/60">{theme[f.key]}</span>
              </div>
            </div>
          ))}
        </div>

        {themeError && <p className="mt-3 text-xs text-admin-danger">{themeError}</p>}
        {saved && <p className="mt-3 text-xs text-admin-accent">✓ Tema guardado</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={revertAndClose} className="rounded-md border border-admin-line px-3 py-1.5 text-sm hover:bg-admin-bg">
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={themeSaving}
            className="rounded-md bg-admin-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-admin-primary-dark disabled:opacity-40"
          >
            {themeSaving ? 'Guardando…' : 'Guardar tema'}
          </button>
        </div>
      </div>
    </div>
  )
}
