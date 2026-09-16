'use client'

import Link from 'next/link'

import { ChatWidget } from './ChatWidget'

/**
 * Los dos elementos flotantes: BEBIDAS (derecha) y el asistente de chat
 * (izquierda, botón circular).
 *
 * El chat sólo se monta si hay un webhook configurado (`chatEnabled` lo
 * resuelve el servidor: la URL en sí nunca baja al navegador). En la web
 * original este sitio lo ocupaba un botón que apuntaba a "#atencion-pendiente",
 * un ancla inexistente: el visitante pulsaba y no pasaba nada.
 */
export function FloatingButtons({
  drinksEnabled,
  drinksLabel,
  chatEnabled,
  chatTitle,
  chatSubtitle,
  chatWelcome,
  chatPlaceholder,
  chatNotifications,
  chatIntervalSec,
}: {
  drinksEnabled?: boolean
  drinksLabel?: string
  chatEnabled?: boolean
  chatTitle?: string
  chatSubtitle?: string
  chatWelcome?: string
  chatPlaceholder?: string
  chatNotifications?: string[]
  chatIntervalSec?: number
}) {
  return (
    <>
      {drinksEnabled && (
        <Link href="/bebidas" id="bebidas-btn">
          {drinksLabel || 'BEBIDAS'}
        </Link>
      )}

      {chatEnabled && (
        <ChatWidget
          title={chatTitle}
          subtitle={chatSubtitle}
          welcome={chatWelcome}
          placeholder={chatPlaceholder}
          notifications={chatNotifications}
          intervalSec={chatIntervalSec}
        />
      )}
    </>
  )
}
