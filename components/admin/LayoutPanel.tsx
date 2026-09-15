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
import { useState } from 'react'

import { DYNAMIC_SECTION_LABELS, type DynamicSectionType, type SectionLayoutEntry } from '@/lib/types'

import { useEdit } from './EditProvider'

const BASE_SECTION_IDS = new Set(['hero', 'about', 'experience', 'objects3d', 'specials', 'menu', 'reservations', 'location'])

function Row({
  entry,
  index,
  total,
  movedId,
  onMove,
  onToggle,
  onDelete,
}: {
  entry: SectionLayoutEntry
  index: number
  total: number
  movedId: string | null
  onMove: (dir: -1 | 1) => void
  onToggle: () => void
  onDelete?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: entry.id })
  const isDynamic = !BASE_SECTION_IDS.has(entry.id)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative flex items-center gap-2 overflow-hidden rounded-md border border-admin-line p-2 ${
        entry.visible ? 'bg-white' : 'bg-admin-bg'
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      {movedId === entry.id && <div className="pointer-events-none absolute inset-0 animate-section-flash" />}

      <span {...attributes} {...listeners} className="cursor-grab select-none text-admin-ink/40 active:cursor-grabbing" title="Arrastrar para reordenar">
        ⠿
      </span>
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-admin-line text-[11px] text-admin-ink/70">{index + 1}</span>

      <span className="flex-1 truncate text-sm text-admin-ink">
        {entry.label}
        {!entry.visible && <span className="ml-1.5 text-xs text-admin-ink/40">(oculta)</span>}
      </span>

      <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="rounded px-1 text-admin-ink/70 hover:bg-admin-bg disabled:opacity-30">
        ↑
      </button>
      <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} className="rounded px-1 text-admin-ink/70 hover:bg-admin-bg disabled:opacity-30">
        ↓
      </button>
      <button type="button" onClick={onToggle} title={entry.visible ? 'Ocultar' : 'Mostrar'} className="rounded px-1 text-admin-ink/70 hover:bg-admin-bg">
        {entry.visible ? '👁' : '🚫'}
      </button>
      {isDynamic && onDelete && (
        <button type="button" onClick={onDelete} title="Eliminar sección" className="rounded px-1 text-admin-danger hover:bg-admin-bg">
          🗑
        </button>
      )}
    </div>
  )
}

export default function LayoutPanel({ onClose }: { onClose: () => void }) {
  const { layout, updateLayout, movedId, flash, createSection, deleteSection, sectionsBusy, sectionsError } = useEdit()
  const [showNewModal, setShowNewModal] = useState(false)
  const [newType, setNewType] = useState<DynamicSectionType>('text-block')
  const [newLabel, setNewLabel] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= layout.sections.length) return
    const next = arrayMove(layout.sections, index, target)
    updateLayout({ sections: next })
    flash(layout.sections[index].id)
  }

  function toggle(index: number) {
    const next = layout.sections.slice()
    next[index] = { ...next[index], visible: !next[index].visible }
    updateLayout({ sections: next })
    flash(next[index].id)
  }

  async function handleCreate() {
    if (!newLabel.trim()) return
    try {
      await createSection(newType, newLabel.trim())
      setShowNewModal(false)
      setNewLabel('')
    } catch {
      // el error ya queda expuesto vía sectionsError
    }
  }

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-admin-ink">☰ Organizar página</h3>
          <button type="button" onClick={onClose} className="rounded px-2 text-admin-ink/60 hover:bg-admin-bg">
            ×
          </button>
        </div>

        {sectionsError && <p className="mb-2 text-xs text-admin-danger">{sectionsError}</p>}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={(e) => {
            const { active, over } = e
            if (!over || active.id === over.id) return
            const oldIndex = layout.sections.findIndex((s) => s.id === active.id)
            const newIndex = layout.sections.findIndex((s) => s.id === over.id)
            if (oldIndex === -1 || newIndex === -1) return
            updateLayout({ sections: arrayMove(layout.sections, oldIndex, newIndex) })
            flash(active.id as string)
          }}
        >
          <SortableContext items={layout.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {layout.sections.map((entry, i) => (
                <Row
                  key={entry.id}
                  entry={entry}
                  index={i}
                  total={layout.sections.length}
                  movedId={movedId}
                  onMove={(dir) => move(i, dir)}
                  onToggle={() => toggle(i)}
                  onDelete={!BASE_SECTION_IDS.has(entry.id) ? () => setDeleteConfirm(entry.id) : undefined}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="mt-3 w-full rounded-md border border-dashed border-admin-line py-2 text-sm text-admin-ink/70 hover:bg-admin-bg"
        >
          + Nueva sección
        </button>
      </div>

      {showNewModal && (
        <div className="fixed inset-0 z-[950] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowNewModal(false)}>
          <div className="w-full max-w-sm rounded-lg bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <h4 className="mb-3 text-sm font-semibold text-admin-ink">Nueva sección</h4>
            <label className="mb-1 block text-xs text-admin-ink/60">Plantilla</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as DynamicSectionType)}
              className="mb-3 w-full rounded border border-admin-line px-2 py-1.5 text-sm"
            >
              {(Object.keys(DYNAMIC_SECTION_LABELS) as DynamicSectionType[]).map((t) => (
                <option key={t} value={t}>
                  {DYNAMIC_SECTION_LABELS[t]}
                </option>
              ))}
            </select>
            <label className="mb-1 block text-xs text-admin-ink/60">Nombre</label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="ej. Promo de verano"
              className="mb-3 w-full rounded border border-admin-line px-2 py-1.5 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowNewModal(false)} className="rounded-md border border-admin-line px-3 py-1.5 text-sm hover:bg-admin-bg">
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newLabel.trim() || sectionsBusy}
                className="rounded-md bg-admin-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-admin-primary-dark disabled:opacity-40"
              >
                {sectionsBusy ? 'Creando…' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[950] flex items-center justify-center bg-black/60 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-sm rounded-lg bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <p className="mb-4 text-sm text-admin-ink">¿Eliminar esta sección? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteConfirm(null)} className="rounded-md border border-admin-line px-3 py-1.5 text-sm hover:bg-admin-bg">
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = deleteConfirm
                  setDeleteConfirm(null)
                  if (id) {
                    try {
                      await deleteSection(id)
                    } catch {
                      // el error ya queda expuesto vía sectionsError
                    }
                  }
                }}
                disabled={sectionsBusy}
                className="rounded-md bg-admin-danger px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
