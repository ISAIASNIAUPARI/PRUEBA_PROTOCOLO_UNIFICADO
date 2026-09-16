'use client'

import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { normalizeChatNotifications, type ChatNotification, type SiteSettings } from '@/lib/types'

import { useState } from 'react'

import { useEdit } from './EditProvider'

/**
 * Configuración del sitio: ajustes que no pertenecen a ninguna sección.
 *
 * Los cambios entran en el mismo flujo que el resto del contenido (se marcan
 * como pendientes y se publican con el botón "Guardar" de la barra), así que
 * no hace falta ningún endpoint propio.
 */
const MAX_MESSAGES = 10
const MIN_SEC = 2
const MAX_SEC = 35
const DEFAULT_SEC = 4

type RowProps = {
  index: number
  message: ChatNotification
  total: number
  onTextChange: (value: string) => void
  onToggle: () => void
  onDelete: () => void
}

/**
 * El contenido de una fila, sin nada de arrastre. Se pinta en dos sitios: en
 * el listado y, mientras se arrastra, dentro del <DragOverlay>.
 */
function MessageRowBody({
  message,
  index,
  total,
  onTextChange,
  onToggle,
  onDelete,
  dragHandle,
  flashing,
}: RowProps & { dragHandle?: React.ReactNode; flashing?: boolean }) {
  return (
    <>
      {flashing && <div className="pointer-events-none absolute inset-0 animate-section-flash" />}
      {dragHandle ?? <span className="select-none px-1 text-admin-ink/40">⠿</span>}
      <input
        type="text"
        value={message.text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={`Mensaje ${index + 1}`}
        className={`w-full rounded-md border border-admin-line px-3 py-2 text-sm text-admin-ink ${
          message.enabled ? '' : 'bg-admin-bg text-admin-ink/40 line-through'
        }`}
      />
      <button
        type="button"
        onClick={onToggle}
        title={message.enabled ? 'Desactivar (no aparece en la web)' : 'Activar'}
        className="rounded px-1 text-admin-ink/70 hover:bg-admin-bg"
      >
        {message.enabled ? '👁' : '🚫'}
      </button>
      {total > 1 && (
        <button
          type="button"
          onClick={onDelete}
          title="Quitar este mensaje"
          className="rounded px-2 py-1 text-admin-ink/50 hover:bg-admin-bg hover:text-admin-danger"
        >
          ×
        </button>
      )}
    </>
  )
}

/**
 * Una fila del listado de avisos. Mismo patrón de arrastre que
 * LayoutPanel: asa a la izquierda, eje vertical y sin salir del contenedor.
 *
 * El id de arrastre es la POSICIÓN (`msg-0`, `msg-1`…) y no un id propio del
 * mensaje: estos avisos no llevan estilos ni nada indexado por su identidad,
 * así que la posición basta y el JSON se queda con la forma que el cliente
 * ve. Va prefijado porque dnd-kit trata un id `0` como ausente.
 *
 * Mientras se arrastra, la fila se queda quieta y atenuada marcando el hueco
 * — quien sigue al cursor es la copia del <DragOverlay>. Sin overlay la fila
 * original SÍ se movía, pero la pintaban encima las filas siguientes (es un
 * hermano anterior y no tiene fondo propio), así que desaparecía a mitad del
 * arrastre y el cursor no arrastraba nada visible.
 */
function SortableMessageRow({ dragId, flashing, ...props }: RowProps & { dragId: string; flashing?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: dragId })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : undefined }}
      className="relative mb-2 flex items-center gap-2 overflow-hidden rounded-md"
    >
      <MessageRowBody
        {...props}
        flashing={flashing}
        dragHandle={
          <span
            {...attributes}
            {...listeners}
            title="Arrastrar para reordenar"
            className="cursor-grab select-none px-1 text-admin-ink/40 active:cursor-grabbing"
          >
            ⠿
          </span>
        }
      />
    </div>
  )
}

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { data, update } = useEdit()
  const settings = data.siteSettings as SiteSettings

  function patch(next: Partial<SiteSettings>) {
    update('siteSettings', { ...settings, ...next })
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  // Cuál se está arrastrando (para pintar la copia del overlay) y cuál acaba
  // de aterrizar (para el destello verde de confirmación, como al reordenar
  // secciones en "Organizar página").
  const [dragging, setDragging] = useState<string | null>(null)
  const [landed, setLanded] = useState<string | null>(null)

  function flashLanded(dragId: string) {
    setLanded(dragId)
    setTimeout(() => setLanded((cur) => (cur === dragId ? null : cur)), 2000)
  }

  // Siempre al menos una casilla: un chat sin ningún aviso deja la burbuja
  // muda y nadie entiende por qué el panel no muestra nada que editar.
  const stored = normalizeChatNotifications(settings.chatNotifications)
  const messages: ChatNotification[] = stored.length ? stored : [{ text: '', enabled: true }]

  // Se reescribe siempre en el formato nuevo: el contenido viejo (`string[]`)
  // migra solo en cuanto el cliente toca cualquier cosa de este listado.
  function setMessages(next: ChatNotification[]) {
    patch({ chatNotifications: next })
  }

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      {/*
        Tres franjas: cabecera y pie quietos, y SOLO el cuerpo con scroll.
        Con 10 avisos el contenido pasa de largo de la pantalla; si scrollara
        el modal entero, el botón "Listo" se iría fuera de la vista y el
        cliente no encontraría cómo cerrarlo.

        El alto del cuerpo no se fija a mano: la caja se topa en 85vh y el
        cuerpo se queda con lo que sobre (`flex-1` + `min-h-0`). Una altura
        calculada a ojo se rompe en cuanto la cabecera envuelve en dos líneas
        o cambia el aviso amarillo.
      */}
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-lg bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-none items-center justify-between border-b border-admin-line px-4 py-3">
          <h3 className="text-sm font-semibold text-admin-ink">⚙️ Configuración</h3>
          <button type="button" onClick={onClose} className="rounded px-2 text-admin-ink/60 hover:bg-admin-bg">
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2.5">

        <label className="mb-1 block text-sm font-medium text-admin-ink" htmlFor="n8n-webhook">
          URL del agente de chat (N8N)
        </label>
        <input
          id="n8n-webhook"
          type="url"
          value={settings.chatWebhookUrl ?? ''}
          onChange={(e) => patch({ chatWebhookUrl: e.target.value })}
          placeholder="https://…/webhook/…"
          spellCheck={false}
          className="w-full rounded-md border border-admin-line px-3 py-2 font-mono text-xs text-admin-ink"
        />
        <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs leading-snug text-amber-900">
          Cambiar esta URL desconecta el chat hasta que la nueva URL de N8N esté activa.
        </p>
        <p className="mt-2 text-xs leading-snug text-admin-ink/60">
          Si se deja vacía, el chat no aparece en la web — tampoco el círculo flotante.
        </p>

        <label className="mt-4 flex items-center gap-2 text-sm text-admin-ink">
          <input
            type="checkbox"
            checked={!!settings.chatButtonEnabled}
            onChange={(e) => patch({ chatButtonEnabled: e.target.checked })}
          />
          Mostrar el chat en la web
        </label>

        <h4 className="mt-4 text-sm font-semibold text-admin-ink">Mensajes del chat</h4>
        <p className="mb-2 text-xs leading-snug text-admin-ink/60">
          Aparecen en la burbuja flotante, uno por uno en rotación. Arrastra ⠿ para cambiar el orden; 👁 desactiva un mensaje sin borrarlo.
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragStart={({ active }) => setDragging(String(active.id))}
          onDragCancel={() => setDragging(null)}
          onDragEnd={({ active, over }) => {
            setDragging(null)
            if (!over || active.id === over.id) return
            const from = messages.findIndex((_, i) => `msg-${i}` === active.id)
            const to = messages.findIndex((_, i) => `msg-${i}` === over.id)
            if (from === -1 || to === -1) return
            setMessages(arrayMove(messages, from, to))
            // Las filas se identifican por posición, así que el destello va en
            // la posición de DESTINO: es donde el cliente acaba de soltarla.
            flashLanded(`msg-${to}`)
          }}
        >
          <SortableContext items={messages.map((_, i) => `msg-${i}`)} strategy={verticalListSortingStrategy}>
            {messages.map((m, i) => (
              <SortableMessageRow
                key={`msg-${i}`}
                dragId={`msg-${i}`}
                flashing={landed === `msg-${i}`}
                index={i}
                message={m}
                total={messages.length}
                onTextChange={(value) => setMessages(messages.map((q, j) => (j === i ? { ...q, text: value } : q)))}
                onToggle={() => setMessages(messages.map((q, j) => (j === i ? { ...q, enabled: !q.enabled } : q)))}
                onDelete={() => setMessages(messages.filter((_, j) => j !== i))}
              />
            ))}
          </SortableContext>

          {/* La copia que sigue al cursor: siempre por encima de todo, con el
              verde de confirmación del admin para que se vea qué se mueve. */}
          <DragOverlay>
            {dragging ? (
              <div className="flex items-center gap-2 rounded-md border border-admin-accent bg-admin-accent/35 shadow-lg" data-drag-overlay>
                <MessageRowBody
                  index={messages.findIndex((_, i) => `msg-${i}` === dragging)}
                  message={messages[messages.findIndex((_, i) => `msg-${i}` === dragging)] ?? { text: '', enabled: true }}
                  total={messages.length}
                  onTextChange={() => {}}
                  onToggle={() => {}}
                  onDelete={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {messages.length < MAX_MESSAGES && (
          <button
            type="button"
            onClick={() => setMessages([...messages, { text: '', enabled: true }])}
            className="rounded-md border border-dashed border-admin-line px-3 py-1.5 text-sm text-admin-ink hover:bg-admin-bg"
          >
            + Añadir mensaje
          </button>
        )}

        <label className="mt-4 block text-sm font-medium text-admin-ink" htmlFor="chat-interval">
          Intervalo (segundos)
        </label>
        <input
          id="chat-interval"
          type="number"
          min={MIN_SEC}
          max={MAX_SEC}
          value={settings.chatIntervalSec ?? DEFAULT_SEC}
          // El mínimo se aplica al soltar y no al teclear: hacerlo en cada
          // pulsación impide escribir "12" (el "1" saltaría al mínimo al
          // instante). El máximo sí se aplica ya, porque pasarse no es un
          // paso intermedio hacia ningún valor válido.
          onChange={(e) => patch({ chatIntervalSec: Math.min(Number(e.target.value), MAX_SEC) })}
          onBlur={(e) => {
            const n = Number(e.target.value)
            patch({ chatIntervalSec: Number.isFinite(n) ? Math.min(Math.max(Math.round(n), MIN_SEC), MAX_SEC) : DEFAULT_SEC })
          }}
          className="w-24 rounded-md border border-admin-line px-3 py-2 text-sm text-admin-ink"
        />
        <p className="mt-1 text-xs leading-snug text-admin-ink/60">
          Cuánto se ve cada mensaje antes de pasar al siguiente. Con un solo mensaje no hay rotación: se queda fijo.
        </p>

        </div>

        {/* Aviso y botón en la MISMA fila: apilados, el pie se comía 79px de
            alto fijo que le hacían falta al listado. */}
        <div className="flex flex-none items-center justify-between gap-3 border-t border-admin-line px-4 py-2.5">
          <p className="text-xs leading-snug text-admin-ink/50">
            Los cambios se publican con «Guardar».
          </p>
          <button
            type="button"
            onClick={onClose}
            className="flex-none rounded-md border border-admin-line px-3 py-1.5 text-sm hover:bg-admin-bg"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  )
}
