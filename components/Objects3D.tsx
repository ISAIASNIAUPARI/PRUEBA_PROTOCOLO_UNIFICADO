'use client'

import React, { useEffect } from 'react'

const SCRIPT_URL =
  'https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js'

const KOMI_URL =
  'https://res.cloudinary.com/foewxv45/raw/upload/v1788973141/web_con_animacion/komi_web.glb'
const CAMISETA_URL =
  'https://res.cloudinary.com/foewxv45/raw/upload/v1788974257/web_con_animacion/camiseta_web.glb'

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

export function Objects3D() {
  useEffect(() => {
    if (document.querySelector('script[data-mv]')) return
    const s = document.createElement('script')
    s.type = 'module'
    s.src = SCRIPT_URL
    s.setAttribute('data-mv', '1')
    document.head.appendChild(s)
  }, [])

  return (
    <section className="objects3d" id="objetos3d">
      <div className="wrap">
        <div className="sec-head reveal">
          <h2>Explora en 3D</h2>
          <div className="sub">Arrastra · Gira · Descubre</div>
          <div className="rule" />
        </div>
        <div className="obj3d-grid">
          <div className="obj3d-item">
            <div className="obj3d-viewer">
              {React.createElement('model-viewer', {
                ...MV_BASE,
                src: KOMI_URL,
                alt: 'Personaje Komi en 3D',
              })}
            </div>
            <div className="obj3d-info">
              <span className="obj3d-tag">Personaje</span>
              <h3 className="obj3d-name">Komi</h3>
              <p className="obj3d-desc">
                Personaje anime de alta fidelidad generado con tecnología Multiview — cada detalle,
                cada textura, navegable en tiempo real desde cualquier dispositivo.
              </p>
            </div>
          </div>

          <div className="obj3d-item">
            <div className="obj3d-viewer">
              {React.createElement('model-viewer', {
                ...MV_BASE,
                src: CAMISETA_URL,
                alt: 'Camiseta técnica en 3D',
              })}
            </div>
            <div className="obj3d-info">
              <span className="obj3d-tag">Producto</span>
              <h3 className="obj3d-name">Camiseta Técnica</h3>
              <p className="obj3d-desc">
                Camiseta de alto rendimiento con tejido respirable y diseño minimalista — optimizada
                con Draco + WebP para exploración 3D fluida en cualquier pantalla.
              </p>
              <div className="obj3d-price">desde $35</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
