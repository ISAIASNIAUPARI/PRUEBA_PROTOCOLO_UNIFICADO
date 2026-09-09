'use client'

import { useEffect } from 'react'

/**
 * Dos comportamientos globales del HTML original:
 *  · las secciones con clase .reveal aparecen al entrar en pantalla
 *  · los enlaces internos (#reservas, #menu…) hacen scroll suave
 */
export function ScrollEffects() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 }
    )

    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    }, 50)

    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement)?.closest?.('a')
      if (!a) return
      const href = a.getAttribute('href') || ''
      // Sólo anclas de esta misma página: "#algo" o "/#algo".
      const hash = href.startsWith('#')
        ? href.slice(1)
        : href.startsWith('/#')
          ? href.slice(2)
          : null
      if (!hash) return
      const target = document.getElementById(hash)
      if (!target) return
      e.preventDefault()
      const y =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        (hash === 'inicio' ? 0 : 8)
      window.scrollTo({ top: y, behavior: 'smooth' })
      history.replaceState(null, '', `#${hash}`)
    }

    document.addEventListener('click', onClick)
    return () => {
      clearTimeout(timer)
      io.disconnect()
      document.removeEventListener('click', onClick)
    }
  }, [])

  return null
}
