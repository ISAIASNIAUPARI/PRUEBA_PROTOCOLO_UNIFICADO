'use client'

import Link from 'next/link'

import { EditableImage } from '@/components/editable/EditableImage'
import { EditableText } from '@/components/editable/EditableText'
import type { Drink, DrinksPage as DrinksPageT, SiteSettings } from '@/lib/types'

export function DrinksPage({
  data,
  brandName,
  brandTagline,
  edit,
  onChange,
}: {
  data: DrinksPageT
  brandName?: SiteSettings['brandName']
  brandTagline?: SiteSettings['brandTagline']
  edit?: boolean
  onChange?: (next: DrinksPageT) => void
}) {
  const drinks = data.drinks

  function patch(next: Partial<DrinksPageT>) {
    onChange?.({ ...data, ...next })
  }

  function updateDrink(index: number, next: Partial<Drink>) {
    const list = drinks.slice()
    list[index] = { ...list[index], ...next }
    patch({ drinks: list })
  }

  return (
    <div className="bebidas-page">
      <nav>
        <Link href="/" className="logo" onClick={(e) => edit && e.preventDefault()}>
          {brandName}
          <span>{brandTagline}</span>
        </Link>
        <Link href="/" className="back" onClick={(e) => edit && e.preventDefault()}>
          <EditableText as="span" edit={edit} value={data.backLabel} onChange={(v) => patch({ backLabel: v })} />
        </Link>
      </nav>

      <section className="hero">
        {(data.heroLabel || edit) && (
          <p className="hero-label">
            <EditableText as="span" edit={edit} value={data.heroLabel} onChange={(v) => patch({ heroLabel: v })} />
          </p>
        )}
        <h1>
          <EditableText as="span" edit={edit} value={data.title} onChange={(v) => patch({ title: v })} />
        </h1>
        <div className="divider" />
        {(data.intro || edit) && (
          <p>
            <EditableText as="span" edit={edit} value={data.intro} onChange={(v) => patch({ intro: v })} />
          </p>
        )}
      </section>

      <main className="menu-section">
        {(data.sectionTitle || edit) && (
          <p className="section-title">
            <EditableText as="span" edit={edit} value={data.sectionTitle} onChange={(v) => patch({ sectionTitle: v })} />
          </p>
        )}
        <div className="drinks-grid">
          {drinks.map((d, i) => (
            <div className="card" key={i}>
              <div className="card-visual">
                {edit ? (
                  <EditableImage
                    edit
                    fill
                    src={d.image?.url}
                    alt={d.image?.alt}
                    aspectRatio={1}
                    imgClassName="h-full w-full object-cover"
                    focalX={d.image?.focalX}
                    focalY={d.image?.focalY}
                    onChange={(url) => updateDrink(i, { image: { ...(d.image ?? { url: '' }), url } })}
                    onFocalChange={(x, y) => updateDrink(i, { image: { ...(d.image ?? { url: '' }), focalX: x, focalY: y } })}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.image?.url}
                    alt={d.image?.alt || d.name || ''}
                    loading="lazy"
                    decoding="async"
                    style={
                      d.image?.focalX != null && d.image?.focalY != null
                        ? { objectPosition: `${d.image.focalX}% ${d.image.focalY}%` }
                        : undefined
                    }
                  />
                )}
                {(d.tag || edit) && (
                  <div className="overlay">
                    <span className="flavor-tag">
                      <EditableText as="span" edit={edit} value={d.tag} onChange={(v) => updateDrink(i, { tag: v })} />
                    </span>
                  </div>
                )}
              </div>
              <div className="card-body">
                <div className="card-name">
                  <EditableText as="span" edit={edit} value={d.name} onChange={(v) => updateDrink(i, { name: v })} />
                </div>
                <div className="card-desc">
                  <EditableText as="span" edit={edit} value={d.description} onChange={(v) => updateDrink(i, { description: v })} />
                </div>
                <div className="card-footer">
                  <span className="price">
                    <EditableText as="span" edit={edit} value={d.price} onChange={(v) => updateDrink(i, { price: v })} />
                  </span>
                  <div className="size-tags">
                    {(d.sizes ?? []).map((s, si) => (
                      <span className="size-tag" key={si}>
                        {edit ? (
                          <EditableText
                            as="span"
                            edit
                            value={s}
                            onChange={(v) => {
                              const sizes = (d.sizes ?? []).slice()
                              sizes[si] = v
                              updateDrink(i, { sizes })
                            }}
                          />
                        ) : (
                          s
                        )}
                      </span>
                    ))}
                  </div>
                </div>
                {edit && (
                  <button
                    type="button"
                    onClick={() => patch({ drinks: drinks.filter((_, j) => j !== i) })}
                    className="mt-2 text-xs text-red-600 hover:underline"
                  >
                    Eliminar bebida
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {edit && (
          <button
            type="button"
            onClick={() =>
              patch({
                drinks: [
                  ...drinks,
                  {
                    name: 'Nueva bebida',
                    tag: '',
                    price: 'desde $0',
                    description: '',
                    sizes: ['Small', 'Large'],
                    image: { url: '' },
                  } satisfies Drink,
                ],
              })
            }
            className="mt-6 rounded-md border border-dashed border-white/40 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
          >
            + Añadir bebida
          </button>
        )}
      </main>

      <footer>
        <EditableText as="span" edit={edit} value={data.footerText} onChange={(v) => patch({ footerText: v })} />
      </footer>
    </div>
  )
}
