'use client'

import { useState } from 'react'

import { EditableText } from '@/components/editable/EditableText'
import { textColorProps, textSizeProps } from '@/lib/text-colors'
import type { LocationSection, TextColors, TextSizes, TextWeights } from '@/lib/types'

/**
 * Sección de ubicación/contacto (Fase D, Parte 11 de 13 - Panel Admin):
 * filas de contacto con ícono, mapa de Google embebido sin API key, botón
 * "Abrir en Maps", y un formulario que arma un mensaje y abre WhatsApp
 * (el sitio no tiene backend de correo).
 */
function extractLatLng(url: string): { lat: string; lng: string } | null {
  const m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  return m ? { lat: m[1], lng: m[2] } : null
}

function buildMapEmbedSrc(data: LocationSection): string {
  const coords = data.mapEmbedUrl ? extractLatLng(data.mapEmbedUrl) : null
  const q = coords ? `${coords.lat},${coords.lng}` : encodeURIComponent(data.address || '')
  return `https://www.google.com/maps?q=${q}&output=embed`
}

function buildMapOpenHref(data: LocationSection): string {
  if (data.mapUrl) return data.mapUrl
  return `https://www.google.com/maps?q=${encodeURIComponent(data.address || '')}`
}

function ContactRow({
  icon,
  value,
  edit,
  onChange,
  placeholder,
  href,
}: {
  icon: string
  value?: string
  edit?: boolean
  onChange?: (v: string) => void
  placeholder: string
  href?: string
}) {
  if (!edit && !value) return null

  const content = (
    <>
      <span aria-hidden="true">{icon}</span>
      <span className="flex-1">
        <EditableText as="span" edit={edit} value={value || (edit ? '' : undefined)} onChange={onChange} />
        {edit && !value && <span className="text-black/30">{placeholder}</span>}
      </span>
    </>
  )

  const rowClass = 'flex items-center gap-3 py-2 text-sm'

  if (!edit && href) {
    return (
      <a href={href} className={`${rowClass} hover:underline`} style={{ color: 'var(--color-accent)' }} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
        {content}
      </a>
    )
  }

  return (
    <div className={rowClass} style={{ color: 'var(--color-accent)' }}>
      {content}
    </div>
  )
}

export function Location({
  subtitle,
  heading,
  address,
  whatsappNumber,
  email,
  hoursText,
  mapUrl,
  mapEmbedUrl,
  formTitle,
  formSubmitLabel,
  textColors,
  textSizes,
  textWeights,
  edit,
  onChange,
}: LocationSection & {
  edit?: boolean
  onChange?: (next: LocationSection) => void
}) {
  const [name, setName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')

  const data: LocationSection = { subtitle, heading, address, whatsappNumber, email, hoursText, mapUrl, mapEmbedUrl, formTitle, formSubmitLabel }

  function patch(next: Partial<LocationSection>) {
    onChange?.({ ...data, textColors, textSizes, textWeights, ...next })
  }

  const color = textColorProps(textColors, (tc) => patch({ textColors: tc }))

  const sizeWeight = textSizeProps(textSizes, textWeights, (next) => patch(next))

  function submitForm(e: React.FormEvent) {
    e.preventDefault()
    if (!whatsappNumber) return
    const lines = [
      `Nombre: ${name || '(no indicado)'}`,
      formEmail && `Correo: ${formEmail}`,
      phone && `Teléfono: ${phone}`,
      `Mensaje: ${message || '(sin mensaje)'}`,
    ].filter(Boolean)
    const text = lines.join('\n')
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <section id="ubicacion" className="px-6 py-20" style={{ backgroundColor: 'var(--color-secondary)' }}>
      <div className="mx-auto max-w-5xl text-center">
        {(subtitle || edit) && (
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--color-primary)' }}>
            <EditableText as="span" edit={edit} value={subtitle} onChange={(v) => patch({ subtitle: v })} {...color('subtitle')} {...sizeWeight('subtitle')} />
          </div>
        )}
        <h2 className="mb-10 text-3xl font-semibold" style={{ color: 'var(--color-accent)' }}>
          <EditableText as="span" edit={edit} value={heading} onChange={(v) => patch({ heading: v })} {...color('heading')} {...sizeWeight('heading')} />
        </h2>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 text-left md:grid-cols-2">
        <div>
          <ContactRow icon="📍" value={address} edit={edit} onChange={(v) => patch({ address: v })} placeholder="Dirección" />
          <ContactRow
            icon="💬"
            value={whatsappNumber}
            edit={edit}
            onChange={(v) => patch({ whatsappNumber: v.replace(/[^\d]/g, '') })}
            placeholder="WhatsApp (código de país, sin +)"
            href={whatsappNumber ? `https://wa.me/${whatsappNumber}` : undefined}
          />
          <ContactRow icon="✉️" value={email} edit={edit} onChange={(v) => patch({ email: v })} placeholder="Correo" href={email ? `mailto:${email}` : undefined} />
          <ContactRow icon="🕐" value={hoursText} edit={edit} onChange={(v) => patch({ hoursText: v })} placeholder="Horario" />

          {(address || edit) && (
            <a
              href={buildMapOpenHref(data)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded px-5 py-2.5 text-sm font-medium text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              Abrir en Maps
            </a>
          )}

          {(address || edit) && (
            <div className="mt-6 aspect-[4/3] w-full overflow-hidden rounded-lg border" style={{ borderColor: 'var(--color-primary)' }}>
              <iframe title="Ubicación en el mapa" src={buildMapEmbedSrc(data)} className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-4 text-lg font-medium" style={{ color: 'var(--color-accent)' }}>
            <EditableText as="span" edit={edit} value={formTitle} onChange={(v) => patch({ formTitle: v })} {...color('formTitle')} {...sizeWeight('formTitle')} />
          </h3>
          <form onSubmit={submitForm} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--color-primary)' }}
            />
            <input
              type="email"
              placeholder="Correo"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="rounded border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--color-primary)' }}
            />
            <input
              type="tel"
              placeholder="Teléfono (opcional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--color-primary)' }}
            />
            <textarea
              placeholder="Mensaje"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="rounded border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--color-primary)' }}
            />
            <button
              type="submit"
              disabled={!whatsappNumber}
              className="rounded px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: 'var(--color-primary)' }}
            >
              <EditableText as="span" edit={edit} value={formSubmitLabel} onChange={(v) => patch({ formSubmitLabel: v })} stopClickNavigation {...color('formSubmitLabel')} {...sizeWeight('formSubmitLabel')} />
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
