'use client'

import { PreviewReadOnly, useSelection } from './Selection'
import { Sidebar } from './Sidebar'

/**
 * Cuerpo del editor (Fase E): sidebar del elemento seleccionado + preview en
 * solo lectura. Lo usan TODAS las rutas del admin — la principal y las que
 * editan una página suelta, como /admin/bebidas.
 *
 * Vive aparte justamente para eso: cuando se añadió el sidebar solo se cableó
 * la ruta principal, y /admin/bebidas se quedó sin <SelectionProvider>. Como
 * en Fase E el texto ya no es contentEditable, ahí dejó de poder editarse
 * NADA. Teniendo una sola pieza compartida, una ruta nueva no puede quedarse
 * a medias.
 */
export function EditorArea({ mobileFrame, children }: { mobileFrame?: boolean; children: React.ReactNode }) {
  const { selected, clear } = useSelection()

  return (
    <div className={`admin-shell-grid ${selected ? 'admin-shell-grid--with-sidebar' : ''}`}>
      <Sidebar />
      <div className="admin-preview" onClick={() => clear()}>
        <PreviewReadOnly>
          {mobileFrame ? (
            <div className="flex justify-center bg-admin-line py-6">
              <div className="w-[390px] max-w-full overflow-hidden rounded-[2rem] border-8 border-admin-ink bg-white shadow-xl">
                {children}
              </div>
            </div>
          ) : (
            children
          )}
        </PreviewReadOnly>
      </div>
    </div>
  )
}
