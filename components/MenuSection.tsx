'use client'

import { useEffect, useRef } from 'react'

import { CloudinaryVideo } from '@/components/editable/CloudinaryVideo'
import { EditableButton } from '@/components/editable/EditableButton'
import { EditableText } from '@/components/editable/EditableText'
import type { ButtonRef, MenuCategory } from '@/lib/types'

import { SealCloche } from './Seal'

type MenuData = {
  heading?: string
  subheading?: string
  watermark?: string
  videoUrl: string
  categories: MenuCategory[]
  button?: ButtonRef
}

export function MenuSection({
  heading,
  subheading,
  watermark,
  videoUrl,
  categories,
  button,
  edit,
  onChange,
}: MenuData & {
  edit?: boolean
  onChange?: (next: MenuData) => void
}) {
  const vidRef = useRef<HTMLVideoElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // El vídeo sólo se descarga y reproduce cuando la sección entra en pantalla.
  useEffect(() => {
    const vid = vidRef.current
    const section = sectionRef.current
    if (!vid || !section || edit) return

    let loaded = false
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            if (!loaded) {
              vid.load()
              loaded = true
            }
            vid.play().catch(() => {})
          } else {
            vid.pause()
          }
        })
      },
      { threshold: 0.15 }
    )
    obs.observe(section)
    return () => obs.disconnect()
  }, [edit])

  function patch(next: Partial<MenuData>) {
    onChange?.({ heading, subheading, watermark, videoUrl, categories, button, ...next })
  }

  return (
    <section className="menu" id="menu" ref={sectionRef}>
      {edit ? (
        <div className="vid-bg">
          <CloudinaryVideo
            edit
            src={videoUrl}
            className="h-full w-full object-cover"
            onChange={(url) => patch({ videoUrl: url })}
          />
        </div>
      ) : (
        <video className="vid-bg" id="menuVid" ref={vidRef} muted loop playsInline preload="none" src={videoUrl} />
      )}
      <div className="vid-scrim" />
      {(watermark || edit) && (
        <div className="watermark">
          <EditableText as="span" edit={edit} value={watermark} onChange={(v) => patch({ watermark: v })} />
        </div>
      )}
      <div className="wrap">
        <div className="sec-head reveal">
          <SealCloche />
          <h2>
            <EditableText as="span" edit={edit} value={heading} onChange={(v) => patch({ heading: v })} />
          </h2>
          {(subheading || edit) && (
            <div className="sub">
              <EditableText as="span" edit={edit} value={subheading} onChange={(v) => patch({ subheading: v })} />
            </div>
          )}
          <div className="rule" />
        </div>

        <div className="menu-cols" id="menuCols">
          {categories.map((cat, ci) => (
            <div className="menu-col reveal" key={ci} style={{ transitionDelay: `${ci * 0.08}s` }}>
              <h3 className="menu-cat">
                <EditableText
                  as="span"
                  edit={edit}
                  value={cat.title}
                  onChange={(v) => {
                    const next = categories.slice()
                    next[ci] = { ...cat, title: v }
                    patch({ categories: next })
                  }}
                />
              </h3>
              {(cat.items ?? []).map((it, ii) => (
                <div className="m-item" key={ii}>
                  <div className="m-row">
                    <span className="m-name">
                      <EditableText
                        as="span"
                        edit={edit}
                        value={it.name}
                        onChange={(v) => {
                          const nextCats = categories.slice()
                          const nextItems = (nextCats[ci].items ?? []).slice()
                          nextItems[ii] = { ...it, name: v }
                          nextCats[ci] = { ...nextCats[ci], items: nextItems }
                          patch({ categories: nextCats })
                        }}
                      />
                    </span>
                    <span className="m-price">
                      <EditableText
                        as="span"
                        edit={edit}
                        value={it.price}
                        onChange={(v) => {
                          const nextCats = categories.slice()
                          const nextItems = (nextCats[ci].items ?? []).slice()
                          nextItems[ii] = { ...it, price: v }
                          nextCats[ci] = { ...nextCats[ci], items: nextItems }
                          patch({ categories: nextCats })
                        }}
                      />
                    </span>
                  </div>
                  <div className="m-desc">
                    <EditableText
                      as="span"
                      edit={edit}
                      value={it.description}
                      onChange={(v) => {
                        const nextCats = categories.slice()
                        const nextItems = (nextCats[ci].items ?? []).slice()
                        nextItems[ii] = { ...it, description: v }
                        nextCats[ci] = { ...nextCats[ci], items: nextItems }
                        patch({ categories: nextCats })
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {button?.text && (
          <div className="btn-outline-wrap reveal">
            <EditableButton edit={edit} button={button} className="btn-outline" onChange={(next) => patch({ button: next })} />
          </div>
        )}
      </div>
    </section>
  )
}
