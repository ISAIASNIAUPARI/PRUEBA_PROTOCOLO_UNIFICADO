'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState } from 'react'

import { ColorSwatchPicker } from './ColorSwatchPicker'
import { useEdit } from './EditProvider'
import { useSelection } from './Selection'

const LayoutPanel = dynamic(() => import('./LayoutPanel'), { ssr: false })
const ThemePanel = dynamic(() => import('./ThemePanel'), { ssr: false })
const SettingsPanel = dynamic(() => import('./SettingsPanel'), { ssr: false })

/**
 * Columna izquierda del admin (Fase E). Reúne dos cosas que antes vivían
 * encima del preview:
 *
 *  1. La barra de herramientas (guardar, organizar, tema, configuración…).
 *  2. El editor del elemento seleccionado en el preview.
 *
 * El preview de la derecha es solo lectura: todo lo que MODIFICA algo se hace
 * desde acá, así el cliente puede recorrer la web entera sin miedo a disparar
 * una acción por accidente.
 */
export function Sidebar() {
  const { save, saving, saved, error, dirty, viewMode, setViewMode } = useEdit()
  const [panel, setPanel] = useState<'layout' | 'theme' | 'settings' | null>(null)

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-head">
        <span className="admin-sidebar-title">La Gloria Familia Unida</span>

        <div className="admin-sidebar-actions">
          <div className="flex overflow-hidden rounded-md border border-white/15">
            <button
              type="button"
              onClick={() => setViewMode('desktop')}
              title="Vista escritorio"
              className={`px-2.5 py-1.5 text-sm ${viewMode === 'desktop' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'}`}
            >
              🖥️
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mobile')}
              title="Vista móvil"
              className={`px-2.5 py-1.5 text-sm ${viewMode === 'mobile' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'}`}
            >
              📱
            </button>
          </div>

          <button type="button" onClick={() => setPanel('layout')} disabled={viewMode === 'mobile'} className="admin-sidebar-btn">
            ☰ Organizar página
          </button>
          <button type="button" onClick={() => setPanel('theme')} className="admin-sidebar-btn">
            🎨 Personalizar tema
          </button>
          <button type="button" onClick={() => setPanel('settings')} className="admin-sidebar-btn">
            ⚙️ Configuración
          </button>
          <Link href="/admin/bebidas" className="admin-sidebar-btn">
            🍹 Bebidas
          </Link>
        </div>

        <div className="admin-sidebar-save">
          <button type="button" onClick={save} disabled={saving || !dirty} className="admin-sidebar-primary">
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
          <a href="/api/admin/logout" className="admin-sidebar-btn">
            Salir
          </a>
        </div>
        {saved && <p className="admin-sidebar-ok">✓ Guardado</p>}
        {error && <p className="admin-sidebar-err">{error}</p>}
      </div>

      <div className="admin-sidebar-body">
        <SelectionEditor />
      </div>

      {panel === 'layout' && <LayoutPanel onClose={() => setPanel(null)} />}
      {panel === 'theme' && <ThemePanel onClose={() => setPanel(null)} />}
      {panel === 'settings' && <SettingsPanel onClose={() => setPanel(null)} />}
    </aside>
  )
}

function SelectionEditor() {
  const { selected, handlers, clear } = useSelection()

  if (!selected) {
    return <p className="admin-sidebar-empty">Haz clic en cualquier texto para editarlo.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="admin-sidebar-label">{selected.label}</span>
        <button type="button" onClick={clear} className="text-xs text-white/50 hover:text-white" title="Quitar selección">
          ×
        </button>
      </div>

      {selected.kind === 'text' && (
        <>
          <textarea
            value={selected.value ?? ''}
            onChange={(e) => handlers.current.onChange?.(e.target.value)}
            rows={4}
            className="admin-sidebar-input"
            placeholder="Escribe el texto…"
          />

          {handlers.current.onTextColorChange && (
            <div>
              <span className="admin-sidebar-sublabel">Color de texto</span>
              <div className="mt-1.5">
                <ColorSwatchPicker
                  variant="dark"
                  value={selected.textColor}
                  onChange={(next) => handlers.current.onTextColorChange?.(next)}
                />
              </div>
            </div>
          )}
        </>
      )}

      {selected.kind === 'media' && <div className="admin-sidebar-media">{handlers.current.renderControls?.()}</div>}
    </div>
  )
}
