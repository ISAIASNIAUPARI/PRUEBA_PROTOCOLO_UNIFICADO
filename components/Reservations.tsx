'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const MES_FULL = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const MES_ABBR = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const MINS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const MERS = ['a. m.', 'p. m.']

type Props = {
  heading?: string
  lead?: string
  backgroundUrl?: string | null
  backgroundAlt?: string
  partySizeOptions: string[]
  submitLabel: string
  reservationEmail: string
  orText?: string
  phoneDisplay?: string
  phoneNumber?: string
  contactName?: string
  address?: string
  contactEmail?: string
}

export function Reservations({
  heading,
  lead,
  backgroundUrl,
  backgroundAlt,
  partySizeOptions,
  submitLabel,
  reservationEmail,
  orText,
  phoneDisplay,
  phoneNumber,
  contactName,
  address,
  contactEmail,
}: Props) {
  const [openField, setOpenField] = useState<'date' | 'time' | null>(null)
  const [people, setPeople] = useState(partySizeOptions[0] ?? '')
  const [phone, setPhone] = useState('')
  const [btnLabel, setBtnLabel] = useState(submitLabel)
  const [btnDone, setBtnDone] = useState(false)

  // El calendario arranca en el día de hoy. Se calcula en el cliente para
  // no fijar la fecha en el HTML generado durante el build.
  const [today, setToday] = useState<Date | null>(null)
  const [selDate, setSelDate] = useState<Date | null>(null)
  const [viewY, setViewY] = useState(0)
  const [viewM, setViewM] = useState(0)

  useEffect(() => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    setToday(t)
    setSelDate(t)
    setViewY(t.getFullYear())
    setViewM(t.getMonth())
  }, [])

  // Hora por defecto: 08:00 p. m.
  const [hI, setHI] = useState(7)
  const [mI, setMI] = useState(0)
  const [pI, setPI] = useState(1)

  const barRef = useRef<HTMLDivElement>(null)

  // Un clic fuera cierra los desplegables; Escape también.
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenField(null)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenField(null)
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const fmtDate = (d: Date) =>
    `${d.getDate()} ${MES_ABBR[d.getMonth()]} ${d.getFullYear()}`
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  const timeStr = () =>
    `${parseInt(HOURS[hI], 10)}:${MINS[mI]} ${MERS[pI].replace(/\s/g, '')}`

  const step = useCallback(
    (col: 'hour' | 'min' | 'mer', dir: number) => {
      if (col === 'hour') setHI((v) => (v + dir + 12) % 12)
      else if (col === 'min') setMI((v) => (v + dir + 60) % 60)
      else setPI((v) => Math.min(1, Math.max(0, v + dir)))
    },
    []
  )

  /* ---- rueda de hora: arrastre táctil ---- */
  const touch = useRef<{ startY: number | null; acc: number }>({
    startY: null,
    acc: 0,
  })
  const onTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.w-arrow')) return
    touch.current = { startY: e.touches[0].clientY, acc: 0 }
  }
  const makeTouchMove =
    (col: 'hour' | 'min' | 'mer') => (e: React.TouchEvent) => {
      if (touch.current.startY === null) return
      const dy = e.touches[0].clientY - touch.current.startY
      const STEP = 26
      while (Math.abs(dy - touch.current.acc) >= STEP) {
        if (dy - touch.current.acc > 0) {
          step(col, -1)
          touch.current.acc += STEP
        } else {
          step(col, 1)
          touch.current.acc -= STEP
        }
      }
    }
  const onTouchEnd = () => {
    touch.current.startY = null
  }

  /* ---- envío de la reserva ---- */
  function submit() {
    if (!selDate) return
    const fecha = fmtDate(selDate)
    const hora = timeStr()
    const numero = phone.trim()
    const asunto = `Reserva — ${contactName || 'La Gloria Restaurante'} (${people})`
    const cuerpo = `Hola, me gustaría reservar una mesa en ${contactName || 'La Gloria Restaurante'}.

• Personas: ${people}
• Fecha:    ${fecha}
• Hora:     ${hora}
• Número:   ${numero || '(no indicado)'}

Quedo atento(a) a la confirmación. ¡Gracias!`

    setBtnLabel('Enviando…')
    setTimeout(() => {
      window.location.href = `mailto:${reservationEmail}?subject=${encodeURIComponent(
        asunto
      )}&body=${encodeURIComponent(cuerpo)}`
      setBtnDone(true)
      setBtnLabel(
        `✓ ${people.split(' ')[0]} · ${fecha.split(' ').slice(0, 2).join(' ')} · ${hora}`
      )
      setTimeout(() => {
        setBtnDone(false)
        setBtnLabel(submitLabel)
      }, 4200)
    }, 600)
  }

  /* ---- celdas del calendario ---- */
  function calCells() {
    if (!today || !selDate) return null
    const first = new Date(viewY, viewM, 1)
    const offset = (first.getDay() + 6) % 7 // lunes = 0
    const days = new Date(viewY, viewM + 1, 0).getDate()
    const prevDays = new Date(viewY, viewM, 0).getDate()
    const cells: React.ReactNode[] = []

    for (let i = 0; i < offset; i++) {
      cells.push(
        <button className="cal-cell muted" tabIndex={-1} key={`p${i}`}>
          {prevDays - offset + 1 + i}
        </button>
      )
    }
    for (let d = 1; d <= days; d++) {
      const cur = new Date(viewY, viewM, d)
      const cls = ['cal-cell']
      if (sameDay(cur, today)) cls.push('today')
      if (sameDay(cur, selDate)) cls.push('sel')
      cells.push(
        <button
          className={cls.join(' ')}
          key={`d${d}`}
          onClick={() => {
            setSelDate(new Date(viewY, viewM, d))
            setOpenField(null)
          }}
        >
          {d}
        </button>
      )
    }
    const rem = (offset + days) % 7
    if (rem) {
      for (let i = 1; i <= 7 - rem; i++) {
        cells.push(
          <button className="cal-cell muted" tabIndex={-1} key={`n${i}`}>
            {i}
          </button>
        )
      }
    }
    return cells
  }

  /* ---- una columna de la rueda ---- */
  function wheelCol(col: 'hour' | 'min' | 'mer') {
    const vals = col === 'hour' ? HOURS : col === 'min' ? MINS : MERS
    const idx = col === 'hour' ? hI : col === 'min' ? mI : pI
    const wrap = col !== 'mer'
    const n = vals.length
    const items: React.ReactNode[] = []

    for (let off = -2; off <= 2; off++) {
      let j: number
      if (wrap) j = (idx + off + n) % n
      else {
        j = idx + off
        if (j < 0 || j >= n) continue
      }
      const cls = off === 0 ? 'c' : Math.abs(off) === 1 ? 'n1' : 'n2'
      items.push(
        <div className={`w-item ${cls}`} style={{ top: (off + 2) * 31 }} key={off}>
          {vals[j]}
        </div>
      )
    }

    return (
      <div
        className="wcol"
        key={col}
        onWheel={(e) => step(col, e.deltaY > 0 ? 1 : -1)}
        onTouchStart={onTouchStart}
        onTouchMove={makeTouchMove(col)}
        onTouchEnd={onTouchEnd}
      >
        <button
          type="button"
          className="w-arrow up"
          aria-label="subir"
          onClick={() => step(col, -1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="w-view">{items}</div>
        <button
          type="button"
          className="w-arrow down"
          aria-label="bajar"
          onClick={() => step(col, 1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <section className="reservas" id="reservas">
      {backgroundUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          className="bg"
          src={backgroundUrl}
          alt={backgroundAlt || ''}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="bg-empty" />
      )}
      <div className="scrim" />
      <div className="inner">
        <h2 className="reveal">{heading}</h2>
        {lead && <p className="lead reveal">{lead}</p>}

        <div className="resbar reveal" ref={barRef}>
          <div className="field sel-field">
            <svg className="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" />
            </svg>
            <select
              id="people"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              aria-label="Número de personas"
            >
              {partySizeOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>

          <div className={`field${openField === 'date' ? ' open' : ''}`} id="dateField">
            <svg className="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 9h18M8 3v4M16 3v4" strokeLinecap="round" />
            </svg>
            <button
              type="button"
              className="picker-trigger"
              aria-haspopup="dialog"
              aria-expanded={openField === 'date'}
              onClick={(e) => {
                e.stopPropagation()
                setOpenField((f) => (f === 'date' ? null : 'date'))
              }}
            >
              <span>{selDate ? fmtDate(selDate) : 'Fecha'}</span>
              <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="popover cal-pop" role="dialog" aria-label="Selecciona la fecha">
              <div className="cal-head">
                <div className="cal-nav">
                  <button
                    type="button"
                    className="cal-arrow"
                    aria-label="Mes anterior"
                    onClick={() => {
                      if (viewM === 0) {
                        setViewM(11)
                        setViewY((y) => y - 1)
                      } else setViewM((m) => m - 1)
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <span className="cal-mlabel">{MES_FULL[viewM]}</span>
                  <button
                    type="button"
                    className="cal-arrow"
                    aria-label="Mes siguiente"
                    onClick={() => {
                      if (viewM === 11) {
                        setViewM(0)
                        setViewY((y) => y + 1)
                      } else setViewM((m) => m + 1)
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                <div className="cal-nav">
                  <button
                    type="button"
                    className="cal-arrow"
                    aria-label="Año anterior"
                    onClick={() => setViewY((y) => y - 1)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <span className="cal-ylabel">{viewY || ''}</span>
                  <button
                    type="button"
                    className="cal-arrow"
                    aria-label="Año siguiente"
                    onClick={() => setViewY((y) => y + 1)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="cal-week">
                <span>L</span><span>M</span><span>X</span><span>J</span>
                <span>V</span><span>S</span><span>D</span>
              </div>
              <div className="cal-grid">{calCells()}</div>
            </div>
          </div>

          <div className={`field${openField === 'time' ? ' open' : ''}`} id="timeField">
            <svg className="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" strokeLinecap="round" />
            </svg>
            <button
              type="button"
              className="picker-trigger"
              aria-haspopup="dialog"
              aria-expanded={openField === 'time'}
              onClick={(e) => {
                e.stopPropagation()
                setOpenField((f) => (f === 'time' ? null : 'time'))
              }}
            >
              <span>{timeStr()}</span>
              <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="popover time-pop" role="dialog" aria-label="Selecciona la hora">
              <div className="wheel">
                <div className="wheel-bar" />
                {wheelCol('hour')}
                {wheelCol('min')}
                {wheelCol('mer')}
              </div>
              <button
                type="button"
                className="time-ok"
                onClick={() => setOpenField(null)}
              >
                Listo
              </button>
            </div>
          </div>

          <div className="field" id="phoneField">
            <svg className="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3l3 5-2 2c1 3 4 6 7 7l2-2 5 3-2 4c-9 0-18-9-18-18z" strokeLinejoin="round" />
            </svg>
            <input
              type="tel"
              className="tel"
              id="phone"
              placeholder="Número"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button
            type="button"
            id="findBtn"
            onClick={submit}
            style={btnDone ? { background: '#1f8a5b', color: '#fff' } : undefined}
          >
            {btnLabel}
          </button>
        </div>

        {orText && <div className="or">{orText}</div>}
        {phoneDisplay && (
          <a href={`tel:${phoneNumber || ''}`} className="phone-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3l3 5-2 2c1 3 4 6 7 7l2-2 5 3-2 4c-9 0-18-9-18-18z" strokeLinejoin="round" />
            </svg>
            {phoneDisplay}
          </a>
        )}

        <div className="res-contact reveal">
          {contactName && <div className="nm">{contactName}</div>}
          {address && (
            <div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z" strokeLinejoin="round" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              {address}
            </div>
          )}
          {contactEmail && (
            <div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M4 7l8 6 8-6" strokeLinecap="round" />
              </svg>
              {contactEmail}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
