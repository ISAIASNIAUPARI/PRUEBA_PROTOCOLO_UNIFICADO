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

import { normalizeChatNotifications, type ChatNotification, type SiteSettings } from '@/lib/types'

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

/**
 * Una fila del listado de avisos. Mismo patrón de arrastre que
 * LayoutPanel: asa a la izquierda, eje vertical y sin salir del contenedor.
 *
 * El id de arrastre es la POSICIÓN (`msg-0`, `msg-1`…) y no un id propio del
 * mensaje: estos avisos no llevan estilos ni nada indexado por su identidad,
 * así que la posición basta y el JSON se queda con la forma que el cliente
 * ve. Va prefijado porque dnd-kit trata un id `0` como ausente.
 */
function MessageRow({
  dragId,
  index,
  message,
  total,
  onTextChange,
  onToggle,
  onDelete,
}: {
  dragId: string
  index: number
  message: ChatNotification
  total: number
  onTextChange: (value: string) => void
  onToggle: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: dragId })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`mb-2 flex items-center gap-2 ${isDragging ? 'opacity-50' : ''}`}
    >
      <span
        {...attributes}
        {...listeners}
        title="Arrastrar para reordenar"
        className="cursor-grab select-none px-1 text-admin-ink/40 active:cursor-grabbing"
      >
        ⠿
      </span>
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
      <div className="w-full max-w-lg rounded-lg bg-white p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-admin-ink">⚙️ Configuración</h3>
          <button type="button" onClick={onClose} className="rounded px-2 text-admin-ink/60 hover:bg-admin-bg">
            ×
          </button>
        </div>

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

        <h4 className="mt-5 text-sm font-semibold text-admin-ink">Mensajes del chat</h4>
        <p className="mb-2 text-xs leading-snug text-admin-ink/60">
          Aparecen en la burbuja flotante, uno por uno en rotación. Arrastra ⠿ para cambiar el orden; 👁 desactiva un mensaje sin borrarlo.
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={({ active, over }) => {
            if (!over || active.id === over.id) return
            const from = messages.findIndex((_, i) => `msg-${i}` === active.id)
            const to = messages.findIndex((_, i) => `msg-${i}` === over.id)
            if (from === -1 || to === -1) return
            setMessages(arrayMove(messages, from, to))
          }}
        >
          <SortableContext items={messages.map((_, i) => `msg-${i}`)} strategy={verticalListSortingStrategy}>
            {messages.map((m, i) => (
              <MessageRow
                key={`msg-${i}`}
                dragId={`msg-${i}`}
                index={i}
                message={m}
                total={messages.length}
                onTextChange={(value) => setMessages(messages.map((q, j) => (j === i ? { ...q, text: value } : q)))}
                onToggle={() => setMessages(messages.map((q, j) => (j === i ? { ...q, enabled: !q.enabled } : q)))}
                onDelete={() => setMessages(messages.filter((_, j) => j !== i))}
              />
            ))}
          </SortableContext>
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

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-admin-line px-3 py-1.5 text-sm hover:bg-admin-bg"
          >
            Listo
          </button>
        </div>
        <p className="mt-2 text-right text-xs text-admin-ink/50">
          Los cambios se publican con «Guardar», como el resto del contenido.
        </p>
      </div>
    </div>
  )
}
