'use client'

import Link from 'next/link'

import { ChatWidget } from './ChatWidget'

/**
 * Los dos elementos flotantes: BEBIDAS (derecha) y el asistente de chat
 * (izquierda, botón circular).
 *
 * El chat sólo se monta si hay un endpoint configurado en Sanity. En la web
 * original este sitio lo ocupaba un botón que apuntaba a "#atencion-pendiente",
 * un ancla inexistente: el visitante pulsaba y no pasaba nada.
 */
export function FloatingButtons({
  drinksEnabled,
  drinksLabel,
  chatEnabled,
  chatWebhookUrl,
  chatTitle,
  chatSubtitle,
  chatWelcome,
  chatPlaceholder,
  chatNotifications,
}: {
  drinksEnabled?: boolean
  drinksLabel?: string
  chatEnabled?: boolean
  chatWebhookUrl?: string
  chatTitle?: string
  chatSubtitle?: string
  chatWelcome?: string
  chatPlaceholder?: string
  chatNotifications?: string[]
}) {
  return (
    <>
      {drinksEnabled && (
        <Link href="/bebidas" id="bebidas-btn">
          {drinksLabel || 'BEBIDAS'}
        </Link>
      )}

      {chatEnabled && chatWebhookUrl && (
        <ChatWidget
          webhookUrl={chatWebhookUrl}
          title={chatTitle}
          subtitle={chatSubtitle}
          welcome={chatWelcome}
          placeholder={chatPlaceholder}
          notifications={chatNotifications}
        />
      )}
    </>
  )
}
