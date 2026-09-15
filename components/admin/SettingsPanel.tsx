'use client'

import type { SiteSettings } from '@/lib/types'

import { useEdit } from './EditProvider'

/**
 * Configuración del sitio: ajustes que no pertenecen a ninguna sección.
 *
 * Los cambios entran en el mismo flujo que el resto del contenido (se marcan
 * como pendientes y se publican con el botón "Guardar" de la barra), así que
 * no hace falta ningún endpoint propio.
 */
export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { data, update } = useEdit()
  const settings = data.siteSettings as SiteSettings

  function patch(next: Partial<SiteSettings>) {
    update('siteSettings', { ...settings, ...next })
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
