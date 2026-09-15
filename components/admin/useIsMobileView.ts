'use client'

import { useEffect, useState } from 'react'

import { useEditOptional } from './EditProvider'

/**
 * Dentro del admin: manda el toggle 🖥️/📱 (viewMode), sin importar el ancho
 * real de la ventana — así se puede previsualizar sin encoger el navegador.
 * Fuera del admin (sitio público, sin EditProvider): usa matchMedia contra
 * el viewport real.
 */
export function useIsMobileView(): boolean {
  const editCtx = useEditOptional()
  const [autoMobile, setAutoMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setAutoMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return editCtx ? editCtx.viewMode === 'mobile' : autoMobile
}
