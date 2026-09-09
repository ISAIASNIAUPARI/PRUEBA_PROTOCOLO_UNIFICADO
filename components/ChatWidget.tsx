'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type Msg = { role: 'user' | 'bot'; text: string }

/** Cada aviso se ve 4 s y descansa 2 s: un mensaje nuevo cada 6 s. */
const NOTIF_VISIBLE_MS = 4000
const NOTIF_HIDDEN_MS = 2000

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
  webhookUrl,
  title,
  subtitle,
  welcome,
  placeholder,
  notifications,
}: {
  webhookUrl: string
  title?: string
  subtitle?: string
  welcome?: string
  placeholder?: string
  notifications?: string[]
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
      }, NOTIF_VISIBLE_MS)
    }

    // Un respiro antes del primer aviso: que no salte nada más entrar.
    timer = setTimeout(show, 2500)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [notifications, open, everOpened])

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
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId.current, message: text }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      const reply =
        typeof data?.reply === 'string' && data.reply.trim()
          ? data.reply
          : 'No he podido responder a eso. ¿Puedes intentarlo de otra forma?'
      setMsgs((m) => [...m, { role: 'bot', text: reply }])
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
