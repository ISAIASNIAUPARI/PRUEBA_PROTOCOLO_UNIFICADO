'use client'

import { ColorSwatchPicker } from './ColorSwatchPicker'
import { useSelection } from './Selection'

/**
 * Columna de edición del elemento seleccionado (Fase E).
 *
 * Es EXCLUSIVA de la edición: texto y color, o los controles propios de una
 * imagen/video/objeto 3D. Todo lo demás —organizar página, tema,
 * configuración, guardar, salir— vive en la barra superior.
 *
 * Solo se monta cuando hay algo seleccionado: sin selección, el preview ocupa
 * el ancho completo.
 */
export function Sidebar() {
  const { selected, handlers, clear } = useSelection()
  if (!selected) return null

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-head">
        <span className="admin-sidebar-label">{selected.label}</span>
        <button type="button" onClick={clear} className="admin-sidebar-close" title="Cerrar edición">
          ×
        </button>
      </div>

      <div className="admin-sidebar-body">
        {selected.kind === 'text' && (
          <div className="flex flex-col gap-4">
            <textarea
              autoFocus
              value={selected.value ?? ''}
              onChange={(e) => handlers.current.onChange?.(e.target.value)}
              rows={5}
              className="admin-sidebar-input"
              placeholder="Escribe el texto…"
            />

            {handlers.current.onTextColorChange && (
              <div>
                <span className="admin-sidebar-sublabel">Color de texto</span>
                <div className="mt-2">
                  <ColorSwatchPicker
                    variant="dark"
                    value={selected.textColor}
                    onChange={(next) => handlers.current.onTextColorChange?.(next)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {selected.kind === 'media' && <div className="admin-sidebar-media">{handlers.current.renderControls?.()}</div>}
      </div>
    </aside>
  )
}
