'use client'

import React, { useEffect } from 'react'

import { useIsMobileView } from '@/components/admin/useIsMobileView'
import { EditableModel } from '@/components/editable/EditableModel'
import { EditableText } from '@/components/editable/EditableText'
import type { Object3DItem } from '@/lib/types'

const SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js'

const MV_BASE = {
  'camera-controls': '',
  'disable-zoom': '',
  'disable-pan': '',
  'disable-tap': '',
  'auto-rotate': '',
  'auto-rotate-delay': '0',
  'rotation-per-second': '16deg',
  'interaction-prompt': 'none',
  'touch-action': 'none',
  'camera-orbit': '25deg 82deg 2.6m',
  'min-camera-orbit': 'auto auto 2.6m',
  'max-camera-orbit': 'auto auto 2.6m',
  'field-of-view': '32deg',
  'shadow-intensity': '0.75',
  exposure: '1.15',
  style: { width: '100%', height: '100%' },
}

type Objects3DData = {
  heading?: string
  subheading?: string
  items: Object3DItem[]
}

export function Objects3D({
  heading,
  subheading,
  items,
  edit,
  onChange,
}: Objects3DData & {
  edit?: boolean
  onChange?: (next: Objects3DData) => void
}) {
  useEffect(() => {
    if (document.querySelector('script[data-mv]')) return
    const s = document.createElement('script')
    s.type = 'module'
    s.src = SCRIPT_URL
    s.setAttribute('data-mv', '1')
    document.head.appendChild(s)
  }, [])

  const isMobile = useIsMobileView()

  function patch(next: Partial<Objects3DData>) {
    onChange?.({ heading, subheading, items, ...next })
  }

  return (
    <section className="objects3d" id="objetos3d">
      <div className="wrap">
        <div className="sec-head reveal">
          <h2 style={isMobile ? { fontSize: '26px' } : undefined}>
            <EditableText as="span" edit={edit} value={heading} onChange={(v) => patch({ heading: v })} />
          </h2>
          <div className="sub" style={isMobile ? { fontSize: '12px' } : undefined}>
            <EditableText as="span" edit={edit} value={subheading} onChange={(v) => patch({ subheading: v })} />
          </div>
          <div className="rule" />
        </div>
        <div className="obj3d-grid">
          {items.map((item, i) => (
            <div className="obj3d-item" key={item.id}>
              <div className="obj3d-viewer group relative">
                {React.createElement('model-viewer', {
                  ...MV_BASE,
                  src: item.modelUrl,
                  alt: item.name,
                })}
                {edit && (
                  <EditableModel
                    edit
                    onChange={(url) => {
                      const next = items.slice()
                      next[i] = { ...item, modelUrl: url }
                      patch({ items: next })
                    }}
                  />
                )}
              </div>
              <div className="obj3d-info">
                <span className="obj3d-tag">{item.label}</span>
                <h3 className="obj3d-name" style={isMobile ? { fontSize: '20px' } : undefined}>
                  <EditableText
                    as="span"
                    edit={edit}
                    value={item.name}
                    onChange={(v) => {
                      const next = items.slice()
                      next[i] = { ...item, name: v }
                      patch({ items: next })
                    }}
                  />
                </h3>
                <p className="obj3d-desc">
                  <EditableText
                    as="span"
                    edit={edit}
                    value={item.description}
                    onChange={(v) => {
                      const next = items.slice()
                      next[i] = { ...item, description: v }
                      patch({ items: next })
                    }}
                  />
                </p>
                {(item.price || edit) && (
                  <div className="obj3d-price">
                    <EditableText
                      as="span"
                      edit={edit}
                      value={item.price}
                      onChange={(v) => {
                        const next = items.slice()
                        next[i] = { ...item, price: v }
                        patch({ items: next })
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
