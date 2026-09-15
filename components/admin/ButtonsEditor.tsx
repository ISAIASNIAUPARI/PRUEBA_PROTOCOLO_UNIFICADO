'use client'

import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { isSafeHref, newButtonId } from '@/lib/buttons'
import type { ButtonHrefType, ButtonRef } from '@/lib/types'

import { ColorSwatchPicker } from './ColorSwatchPicker'
import { useEdit } from './EditProvider'

const MAX_BUTTONS = 5
const TYPE_LABELS: Record<ButtonHrefType, string> = {
  anchor: 'Misma página',
  url: 'URL externa',
  whatsapp: 'WhatsApp',
  phone: 'Teléfono',
}

function Row({
  button,
  index,
  onChange,
  onRemove,
  onMove,
  total,
  anchorOptions,
}: {
  button: ButtonRef
  index: number
  onChange: (next: ButtonRef) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
  total: number
  anchorOptions: { value: string; label: string }[]
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: button.id })
  const roleLabel = index === 0 ? 'Primario' : index === 1 ? 'Secundario' : 'Terciario'

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-md border border-white/15 bg-white/5 p-2 ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span {...attributes} {...listeners} className="cursor-grab select-none text-white/40 active:cursor-grabbing" title="Arrastrar para reordenar">
          ⠿
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-white/50">{roleLabel}</span>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="rounded px-1.5 py-0.5 text-white/70 hover:bg-white/10 disabled:opacity-30">
            ↑
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} className="rounded px-1.5 py-0.5 text-white/70 hover:bg-white/10 disabled:opacity-30">
            ↓
          </button>
          <button type="button" onClick={onRemove} className="rounded px-1.5 py-0.5 text-white/70 hover:bg-white/10">
            ×
          </button>
        </div>
      </div>

      <input
        type="text"
        value={button.text}
        onChange={(e) => onChange({ ...button, text: e.target.value })}
        placeholder="Texto del botón"
        className="mb-1.5 w-full rounded border border-white/15 bg-white/10 px-2 py-1 text-sm text-white placeholder:text-white/40"
      />

      <select
        value={button.hrefType}
        onChange={(e) => onChange({ ...button, hrefType: e.target.value as ButtonHrefType, href: '' })}
        className="mb-1.5 w-full rounded border border-white/15 bg-white/10 px-2 py-1 text-sm text-white"
      >
        {(Object.keys(TYPE_LABELS) as ButtonHrefType[]).map((t) => (
          <option key={t} value={t} className="text-black">
            {TYPE_LABELS[t]}
          </option>
        ))}
      </select>

      {button.hrefType === 'anchor' ? (
        <select
          value={button.href}
          onChange={(e) => onChange({ ...button, href: e.target.value })}
          className="mb-1.5 w-full rounded border border-white/15 bg-white/10 px-2 py-1 text-sm text-white"
        >
          <option value="" className="text-black">
            — elegir sección —
          </option>
          {anchorOptions.map((o) => (
            <option key={o.value} value={o.value} className="text-black">
              {o.label}
            </option>
          ))}
        </select>
      ) : button.hrefType === 'url' ? (
        <input
          type="url"
          value={button.href}
          onChange={(e) => isSafeHref(e.target.value) && onChange({ ...button, href: e.target.value })}
          placeholder="https://…"
          className="mb-1.5 w-full rounded border border-white/15 bg-white/10 px-2 py-1 text-sm text-white placeholder:text-white/40"
        />
      ) : (
        <input
          type="tel"
          value={button.href}
          onChange={(e) => onChange({ ...button, href: e.target.value.replace(/[^\d+]/g, '') })}
          placeholder={button.hrefType === 'whatsapp' ? 'Número (código de país, sin +)' : 'Número de teléfono'}
          className="mb-1.5 w-full rounded border border-white/15 bg-white/10 px-2 py-1 text-sm text-white placeholder:text-white/40"
        />
      )}

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-white/50">Color</span>
        <ColorSwatchPicker variant="dark" value={button.color} onChange={(color) => onChange({ ...button, color })} />
      </div>
    </div>
  )
}

export default function ButtonsEditor({
  sectionLabel,
  buttons,
  onChange,
  onClose,
}: {
  sectionLabel: string
  buttons: ButtonRef[]
  onChange: (next: ButtonRef[]) => void
  onClose: () => void
}) {
  const { layout } = useEdit()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const anchorOptions = layout.sections.map((s, i) => ({ value: `#${sectionAnchorId(s.id)}`, label: `${i + 1}. ${s.label}` }))

  function addButton() {
    if (buttons.length >= MAX_BUTTONS) return
    onChange([...buttons, { id: newButtonId(), text: 'Nuevo botón', href: '', hrefType: 'anchor' }])
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= buttons.length) return
    onChange(arrayMove(buttons, index, target))
  }

  return (
    <div className="fixed bottom-4 right-4 z-[900] w-[260px] max-w-[90vw] rounded-lg bg-[#1c1c1a] p-3 text-white shadow-2xl">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold">Botones de «{sectionLabel}»</h4>
        <button type="button" onClick={onClose} className="rounded px-1.5 text-white/60 hover:bg-white/10">
          ×
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={(e) => {
          const { active, over } = e
          if (!over || active.id === over.id) return
          const oldIndex = buttons.findIndex((b) => b.id === active.id)
          const newIndex = buttons.findIndex((b) => b.id === over.id)
          if (oldIndex === -1 || newIndex === -1) return
          onChange(arrayMove(buttons, oldIndex, newIndex))
        }}
      >
        <SortableContext items={buttons.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
            {buttons.map((b, i) => (
              <Row
                key={b.id}
                button={b}
                index={i}
                total={buttons.length}
                anchorOptions={anchorOptions}
                onChange={(next) => {
                  const copy = buttons.slice()
                  copy[i] = next
                  onChange(copy)
                }}
                onRemove={() => onChange(buttons.filter((_, j) => j !== i))}
                onMove={(dir) => move(i, dir)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={addButton}
        disabled={buttons.length >= MAX_BUTTONS}
        className="mt-2 w-full rounded-md border border-dashed border-white/25 py-1.5 text-sm text-white/70 hover:bg-white/5 disabled:opacity-30"
      >
        + Añadir botón {buttons.length >= MAX_BUTTONS ? '(máx. 5)' : ''}
      </button>
    </div>
  )
}

/** El id de layout (contentKey) no siempre coincide con el id real del ancla
 * en el DOM (algunos vienen del diseño original en español) — mapa manual
 * para las secciones base de este proyecto; una sección dinámica usa su
 * propio id tal cual. */
function sectionAnchorId(layoutId: string): string {
  const map: Record<string, string> = {
    hero: 'inicio',
    about: 'sobre',
    experience: 'experiencia',
    objects3d: 'objetos3d',
    specials: 'especiales',
    menu: 'menu',
    reservations: 'reservas',
  }
  return map[layoutId] ?? layoutId
}
