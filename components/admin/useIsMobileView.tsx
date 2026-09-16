'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import { useEditOptional } from './EditProvider'

/**
 * Vista que está mostrando el preview del editor. La publica <EditorArea>,
 * que es la única pieza que conoce el marco 🖥️/📱 en TODAS las rutas del
 * admin.
 *
 * Antes esto se leía de EditProvider.viewMode, y por eso /admin/bebidas
 * quedaba roto: ese panel lleva su propio estado de vista y NO monta un
 * EditProvider, así que useIsMobileView() se iba por el matchMedia de la
 * ventana real —siempre escritorio— mientras el sidebar escribía el tamaño
 * en la clave `m`. El texto guardaba el valor pero leía el de escritorio, y
 * en móvil no pasaba nada. El grosor y el color no dependen de la vista, así
 * que ahí sí funcionaban: por eso el fallo parecía exclusivo del tamaño.
 */
const PreviewViewModeContext = createContext<boolean | null>(null)

export function PreviewViewMode({ mobile, children }: { mobile?: boolean; children: React.ReactNode }) {
  return <PreviewViewModeContext.Provider value={!!mobile}>{children}</PreviewViewModeContext.Provider>
}

/**
 * Dentro del admin: manda el toggle 🖥️/📱 del preview, sin importar el ancho
 * real de la ventana — así se puede previsualizar sin encoger el navegador.
 * Fuera del admin (sitio público): usa matchMedia contra el viewport real.
 */
export function useIsMobileView(): boolean {
  const previewMobile = useContext(PreviewViewModeContext)
  const editCtx = useEditOptional()
  const [autoMobile, setAutoMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setAutoMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  if (previewMobile !== null) return previewMobile
  return editCtx ? editCtx.viewMode === 'mobile' : autoMobile
}
