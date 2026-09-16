'use client'

import { SIZE_PX, SIZE_STEPS, WEIGHT_STEPS, type SizeStep, type TextSize } from '@/lib/text-colors'

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
export function Sidebar({ mobileView }: { mobileView?: boolean }) {
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

            {handlers.current.onFontSizeChange && (
              <SizeControl
                mobileView={!!mobileView}
                value={selected.fontSize}
                onChange={(next) => handlers.current.onFontSizeChange?.(next)}
              />
            )}

            {handlers.current.onFontWeightChange && (
              <WeightControl
                value={selected.fontWeight}
                onChange={(next) => handlers.current.onFontWeightChange?.(next)}
              />
            )}
          </div>
        )}

        {selected.kind === 'media' && <div className="admin-sidebar-media">{handlers.current.renderControls?.()}</div>}

        {selected.kind === 'buttons' && handlers.current.renderControls?.()}
      </div>
    </aside>
  )
}

/**
 * Tamaño de letra, en dos filas independientes: escritorio y móvil.
 *
 * Se separan a propósito — el mismo valor en px se ve mucho más grande en una
 * pantalla de 390px, así que un único control obligaría a elegir cuál de las
 * dos vistas se sacrifica. Sin valor guardado no hay ningún botón activo: el
 * texto hereda el tamaño del CSS del sitio.
 */
function SizeControl({
  mobileView,
  value,
  onChange,
}: {
  mobileView: boolean
  value?: TextSize
  onChange: (next: TextSize | undefined) => void
}) {
  // Solo se ofrece la fila de la vista que se está previsualizando. Mostrar
  // las dos confundía: estando en el marco de móvil se podía tocar sin querer
  // el tamaño de escritorio y no se veía ningún efecto.
  const view: 'd' | 'm' = mobileView ? 'm' : 'd'
  const label = mobileView ? '📱 Móvil' : '🖥 Escritorio'
  const actual = value?.[view]

  return (
    <div>
      <span className="admin-sidebar-sublabel">Tamaño de letra</span>
      <div className="mt-2">
        <span className="admin-sidebar-rowlabel">{label}</span>
        <div className="admin-sidebar-steps">
          {SIZE_STEPS.map((step: SizeStep) => {
            const px = SIZE_PX[view][step]
            return (
              <button
                key={step}
                type="button"
                title={`${px}px`}
                className={`admin-sidebar-step ${actual === px ? 'is-active' : ''}`}
                onClick={() => onChange({ ...value, [view]: px })}
              >
                {step}
              </button>
            )
          })}
          {/* Reset de ESTA vista, al final de la fila — mismo gesto que la ×
              de los círculos de color. Solo limpia la vista visible: el valor
              de la otra se conserva. */}
          <button
            type="button"
            title="Volver al tamaño original"
            className={`admin-sidebar-step admin-sidebar-reset ${actual == null ? 'is-active' : ''}`}
            onClick={() => onChange({ ...value, [view]: undefined })}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

/** "Ancho" (font-weight): un solo valor para ambas vistas. */
function WeightControl({ value, onChange }: { value?: number; onChange: (next: number | undefined) => void }) {
  return (
    <div>
      <span className="admin-sidebar-sublabel">Ancho</span>
      <div className="admin-sidebar-steps mt-2">
        {WEIGHT_STEPS.map((w) => (
          <button
            key={w.value}
            type="button"
            style={{ fontWeight: w.value }}
            className={`admin-sidebar-step ${value === w.value ? 'is-active' : ''}`}
            onClick={() => onChange(w.value)}
          >
            {w.label}
          </button>
        ))}
        <button
          type="button"
          title="Volver al ancho original"
          className={`admin-sidebar-step admin-sidebar-reset ${value == null ? 'is-active' : ''}`}
          onClick={() => onChange(undefined)}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
