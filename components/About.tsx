export function About({
  heading,
  body,
  imageLeft,
  imageRight,
}: {
  heading?: string
  body?: string
  imageLeft?: { url: string; alt?: string } | null
  imageRight?: { url: string; alt?: string } | null
}) {
  return (
    <section className="about" id="sobre">
      <div className="plate" />
      <div className="wrap">
        <div className="about-grid">
          <div className="framed reveal">
            {imageLeft && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={imageLeft.url}
                alt={imageLeft.alt || ''}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: 'center top' }}
              />
            )}
          </div>
          <div className="about-copy reveal">
            <h2>{heading}</h2>
            {body && <p>{body}</p>}
          </div>
          <div className="framed reveal">
            {imageRight && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={imageRight.url}
                alt={imageRight.alt || ''}
                loading="lazy"
                decoding="async"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
