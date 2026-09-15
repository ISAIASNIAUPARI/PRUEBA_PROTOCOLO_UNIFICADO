import { NextResponse } from 'next/server'

import { siteSettings } from '@/lib/content'

/**
 * Proxy del chat: el visitante habla con ESTA ruta, y el servidor reenvía el
 * mensaje al webhook de n8n.
 *
 * Por qué un proxy y no llamar a n8n desde el navegador: la URL del agente es
 * un dato de configuración del cliente y no debe aparecer en el HTML ni en el
 * JS que se descarga en el sitio público (tampoco en una variable
 * NEXT_PUBLIC_). Con este paso intermedio el navegador solo conoce /api/chat;
 * la URL real se lee del JSON de contenido en el servidor.
 *
 * Es una ruta PÚBLICA a propósito — la usa cualquier visitante del sitio, no
 * el panel de administración (por eso vive fuera de /api/admin, que el
 * middleware protege con sesión).
 */
export async function POST(req: Request) {
  const webhook = siteSettings.chatWebhookUrl?.trim()
  if (!webhook) {
    return NextResponse.json({ ok: false, error: 'El chat no está configurado.' }, { status: 503 })
  }

  let sessionId = ''
  let message = ''
  try {
    const body = (await req.json()) as { sessionId?: unknown; message?: unknown }
    sessionId = typeof body.sessionId === 'string' ? body.sessionId.slice(0, 200) : ''
    message = typeof body.message === 'string' ? body.message.trim() : ''
  } catch {
    return NextResponse.json({ ok: false, error: 'Petición inválida.' }, { status: 400 })
  }

  if (!message) {
    return NextResponse.json({ ok: false, error: 'Mensaje vacío.' }, { status: 400 })
  }
  // Tope defensivo: esta ruta es pública y el mensaje se reenvía a un tercero.
  if (message.length > 2000) {
    return NextResponse.json({ ok: false, error: 'El mensaje es demasiado largo.' }, { status: 413 })
  }

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message }),
      signal: AbortSignal.timeout(30_000),
    })
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: `El agente respondió ${res.status}.` }, { status: 502 })
    }

    const data = (await res.json().catch(() => ({}))) as { reply?: unknown }
    const reply = typeof data.reply === 'string' ? data.reply.trim() : ''
    // Nunca se inventa una respuesta: si el agente no devuelve nada usable, se
    // dice, y el widget muestra su mensaje de error.
    if (!reply) {
      return NextResponse.json({ ok: false, error: 'El agente no devolvió una respuesta.' }, { status: 502 })
    }
    return NextResponse.json({ ok: true, reply })
  } catch {
    return NextResponse.json({ ok: false, error: 'No se pudo contactar con el agente.' }, { status: 502 })
  }
}
