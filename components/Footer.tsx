import Link from 'next/link'

type ScheduleRow = { days?: string; hours?: string }
type Social = { network?: string; url?: string }

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  google: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M21 12.2c0 5-3.5 8.3-8.7 8.3a8.5 8.5 0 1 1 5.8-14.7l-2.4 2.3A5.1 5.1 0 1 0 17.4 13H12.3v-3H21z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  ),
  tripadvisor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="7" cy="13" r="3.4" />
      <circle cx="17" cy="13" r="3.4" />
      <path d="M7 13h0M17 13h0" strokeLinecap="round" />
      <path d="M4 9c2.4-1.6 5.1-2 8-2s5.6.4 8 2" strokeLinecap="round" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 3c.3 2.2 1.6 3.7 3.8 3.9v2.7c-1.3.1-2.5-.3-3.8-1v6.1c0 3.4-2.6 5.6-5.7 5.3A5.2 5.2 0 0 1 6 14.6c.4-2.4 2.6-4.1 5-3.8v2.8c-1.1-.3-2.2.3-2.4 1.4-.2 1 .4 2 1.5 2.2 1.2.2 2.2-.6 2.2-1.9V3z" />
    </svg>
  ),
}

export function Footer({
  brandName,
  brandTagline,
  scheduleTitle,
  schedule,
  reserveTitle,
  reserveLinkLabel,
  reserveLinkHref,
  socialTitle,
  socials,
  copyright,
}: {
  brandName?: string
  brandTagline?: string
  scheduleTitle?: string
  schedule?: ScheduleRow[]
  reserveTitle?: string
  reserveLinkLabel?: string
  reserveLinkHref?: string
  socialTitle?: string
  socials?: Social[]
  copyright?: string
}) {
  // Se pintan todos los iconos, como en el diseño original, pero sólo son
  // enlaces los que tienen URL. Sin ella queda el icono sin ser clicable,
  // en vez de un enlace muerto a "#".
  const shown = (socials ?? []).filter((s) => s.network && SOCIAL_ICONS[s.network])

  return (
    <footer id="footer">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-col">
            <div className="foot-brand">
              <span className="name">{brandName}</span>
              <span className="tag">{brandTagline}</span>
            </div>
          </div>

          <div className="foot-col">
            <svg className="foot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" strokeLinecap="round" />
            </svg>
            <div className="foot-title">{scheduleTitle}</div>
            <div className="hours">
              {(schedule ?? []).map((row, i) => (
                <span key={i}>
                  <b>{row.days}:</b> {row.hours}
                  {i < (schedule?.length ?? 0) - 1 && <br />}
                </span>
              ))}
            </div>
          </div>

          <div className="foot-col">
            <svg className="foot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3l3 5-2 2c1 3 4 6 7 7l2-2 5 3-2 4c-9 0-18-9-18-18z" strokeLinejoin="round" />
            </svg>
            <div className="foot-title">{reserveTitle}</div>
            <Link href={reserveLinkHref || '#reservas'} className="foot-link">
              {reserveLinkLabel}
            </Link>
          </div>

          <div className="foot-col">
            <svg className="foot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" strokeLinejoin="round" />
            </svg>
            <div className="foot-title">{socialTitle}</div>
            <div className="socials">
              {shown.map((s, i) =>
                s.url ? (
                  <a
                    key={i}
                    href={s.url}
                    aria-label={s.network}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {SOCIAL_ICONS[s.network as string]}
                  </a>
                ) : (
                  <span key={i} aria-label={s.network}>
                    {SOCIAL_ICONS[s.network as string]}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
        <div className="copy">{copyright}</div>
      </div>
    </footer>
  )
}
