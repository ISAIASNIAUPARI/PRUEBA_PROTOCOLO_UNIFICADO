'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type Msg = { role: 'user' | 'bot'; text: string }

/** Segundos visibles por aviso si el sitio no configura `chatIntervalSec`. */
const NOTIF_VISIBLE_SEC_DEFAULT = 4
/** Descanso entre un aviso y el siguiente. Fijo: marca el cambio de mensaje. */
const NOTIF_HIDDEN_MS = 2000
const NOTIF_SEC_MIN = 2
const NOTIF_SEC_MAX = 30

/**
 * Identificador de conversación. Se guarda en el navegador para que el
 * agente mantenga el hilo si el visitante recarga o cambia de página.
 */
function getSessionId(): string {
  const KEY = 'lagloria.chat.sessionId'
  try {
    const saved = localStorage.getItem(KEY)
    if (saved) return saved
    const fresh =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `web-${Math.random().toString(36).slice(2)}-${performance.now().toString(36)}`
    localStorage.setItem(KEY, fresh)
    return fresh
  } catch {
    // Navegación privada con almacenamiento bloqueado: sesión de un solo uso.
    return `web-${Math.random().toString(36).slice(2)}`
  }
}

export function ChatWidget({
  title,
  subtitle,
  welcome,
  placeholder,
  notifications,
  intervalSec,
}: {
  title?: string
  subtitle?: string
  welcome?: string
  placeholder?: string
  notifications?: string[]
  intervalSec?: number
}) {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [notifIdx, setNotifIdx] = useState(0)
  const [notifOn, setNotifOn] = useState(false)
  const [everOpened, setEverOpened] = useState(false)

  const sessionId = useRef<string>('')
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    sessionId.current = getSessionId()
  }, [])

  /* ---- avisos en bucle junto al botón ---- */
  useEffect(() => {
    const list = notifications ?? []
    if (!list.length || open || everOpened) {
      setNotifOn(false)
      return
    }
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>

    // El intervalo lo decide el cliente desde Configuración. Se acota al
    // rango que ofrece ese panel: un JSON editado a mano no puede dejar el
    // aviso parpadeando 10 veces por segundo ni congelado media hora.
    const visibleMs =
      Math.min(Math.max(Math.round(intervalSec || NOTIF_VISIBLE_SEC_DEFAULT), NOTIF_SEC_MIN), NOTIF_SEC_MAX) * 1000

    // Con un solo aviso no hay rotación: se muestra y se queda. Ocultarlo
    // para volver a mostrar el MISMO texto solo se vería como un parpadeo.
    if (list.length === 1) {
      timer = setTimeout(() => {
        if (!cancelled) setNotifOn(true)
      }, 2500)
      return () => {
        cancelled = true
        clearTimeout(timer)
      }
    }

    const show = () => {
      if (cancelled) return
      setNotifOn(true)
      timer = setTimeout(() => {
        if (cancelled) return
        setNotifOn(false)
        timer = setTimeout(() => {
          if (cancelled) return
          setNotifIdx((i) => (i + 1) % list.length)
          show()
        }, NOTIF_HIDDEN_MS)
      }, visibleMs)
    }

    // Un respiro antes del primer aviso: que no salte nada más entrar.
    timer = setTimeout(show, 2500)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [notifications, intervalSec, open, everOpened])

  /* ---- desplazar al último mensaje ---- */
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [msgs, sending, open])

  /* ---- abrir / cerrar ---- */
  // El actualizador se mantiene puro: React puede invocarlo más de una vez
  // por render, así que los efectos de abrir el chat viven en su propio efecto.
  const toggle = useCallback(() => setOpen((v) => !v), [])

  useEffect(() => {
    if (!open) return
    setEverOpened(true)
    setNotifOn(false)
    if (welcome) {
      setMsgs((m) => (m.length ? m : [{ role: 'bot', text: welcome }]))
    }
    const t = setTimeout(() => inputRef.current?.focus(), 250)
    return () => clearTimeout(t)
  }, [open, welcome])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  /* ---- enviar mensaje al agente ---- */
  async function send() {
    const text = input.trim()
    if (!text || sending) return

    setInput('')
    setError(null)
    setMsgs((m) => [...m, { role: 'user', text }])
    setSending(true)

    try {
      // Se habla con NUESTRA ruta, no con n8n: así la URL del agente no
      // aparece nunca en el HTML ni en el JS del sitio público.
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId.current, message: text }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok || typeof data.reply !== 'string') throw new Error('sin respuesta')
      setMsgs((m) => [...m, { role: 'bot', text: data.reply }])
    } catch {
      // Nunca fingimos una respuesta: si falla, se dice.
      setError(
        'No se pudo conectar con el asistente. Vuelve a intentarlo o llámanos por teléfono.'
      )
    } finally {
      setSending(false)
    }
  }

  const list = notifications ?? []
  const showNotif = notifOn && !open && !everOpened && list.length > 0

  return (
    <>
      {/* burbuja de aviso */}
      {showNotif && (
        <div className="chat-notif" role="status" aria-live="polite">
          {list[notifIdx]}
        </div>
      )}

      {/* botón circular */}
      <button
        type="button"
        id="chat-fab"
        className={open ? 'is-open' : undefined}
        onClick={toggle}
        aria-label={open ? 'Cerrar el chat' : title || 'Abrir el chat'}
        aria-expanded={open}
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* ventana de chat */}
      <div className={`chat-panel${open ? ' is-open' : ''}`} role="dialog" aria-label={title || 'Chat'} aria-hidden={!open}>
        <header className="chat-head">
          <div className="chat-avatar" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="chat-head-txt">
            <strong>{title}</strong>
            {subtitle && <span>{subtitle}</span>}
          </div>
          <button type="button" className="chat-close" onClick={() => setOpen(false)} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="chat-msgs" ref={listRef}>
          {msgs.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>
              {m.text}
            </div>
          ))}
          {sending && (
            <div className="chat-msg bot chat-typing" aria-label="Escribiendo">
              <i /><i /><i />
            </div>
          )}
          {error && <div className="chat-error">{error}</div>}
        </div>

        <form
          className="chat-form"
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder || 'Escribe tu mensaje…'}
            aria-label="Tu mensaje"
            disabled={sending}
          />
          <button type="submit" disabled={sending || !input.trim()} aria-label="Enviar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12l16-8-6 16-2.5-6.5z" />
            </svg>
          </button>
        </form>
      </div>
    </>
  )
}
