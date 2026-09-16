'use client'

import Link from 'next/link'

import { EditableImage } from '@/components/editable/EditableImage'
import { EditableText } from '@/components/editable/EditableText'
import { textColorProps, textSizeProps } from '@/lib/text-colors'
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

  const color = textColorProps(data.textColors, (tc) => patch({ textColors: tc }))

  const sizeWeight = textSizeProps(data.textSizes, data.textWeights, (next) => patch(next))

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
          <EditableText as="span" edit={edit} value={data.backLabel} onChange={(v) => patch({ backLabel: v })} {...color('backLabel')} {...sizeWeight('backLabel')} />
        </Link>
      </nav>

      <section className="hero">
        {(data.heroLabel || edit) && (
          <p className="hero-label">
            <EditableText as="span" edit={edit} value={data.heroLabel} onChange={(v) => patch({ heroLabel: v })} {...color('heroLabel')} {...sizeWeight('heroLabel')} />
          </p>
        )}
        <h1>
          <EditableText as="span" edit={edit} value={data.title} onChange={(v) => patch({ title: v })} {...color('title')} {...sizeWeight('title')} />
        </h1>
        <div className="divider" />
        {(data.intro || edit) && (
          <p>
            <EditableText as="span" edit={edit} value={data.intro} onChange={(v) => patch({ intro: v })} {...color('intro')} {...sizeWeight('intro')} />
          </p>
        )}
      </section>

      <main className="menu-section">
        {(data.sectionTitle || edit) && (
          <p className="section-title">
            <EditableText as="span" edit={edit} value={data.sectionTitle} onChange={(v) => patch({ sectionTitle: v })} {...color('sectionTitle')} {...sizeWeight('sectionTitle')} />
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
                      <EditableText as="span" edit={edit} value={d.tag} onChange={(v) => updateDrink(i, { tag: v })} {...color(`drinks.${i}.tag`)} {...sizeWeight(`drinks.${i}.tag`)} />
                    </span>
                  </div>
                )}
              </div>
              <div className="card-body">
                <div className="card-name">
                  <EditableText as="span" edit={edit} value={d.name} onChange={(v) => updateDrink(i, { name: v })} {...color(`drinks.${i}.name`)} {...sizeWeight(`drinks.${i}.name`)} />
                </div>
                <div className="card-desc">
                  <EditableText as="span" edit={edit} value={d.description} onChange={(v) => updateDrink(i, { description: v })} {...color(`drinks.${i}.description`)} {...sizeWeight(`drinks.${i}.description`)} />
                </div>
                <div className="card-footer">
                  <span className="price">
                    <EditableText as="span" edit={edit} value={d.price} onChange={(v) => updateDrink(i, { price: v })} {...color(`drinks.${i}.price`)} {...sizeWeight(`drinks.${i}.price`)} />
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
                            {...color(`drinks.${i}.sizes.${si}`)} {...sizeWeight(`drinks.${i}.sizes.${si}`)}
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
        <EditableText as="span" edit={edit} value={data.footerText} onChange={(v) => patch({ footerText: v })} {...color('footerText')} {...sizeWeight('footerText')} />
      </footer>
    </div>
  )
}
