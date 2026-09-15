'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

import { useIsMobileView } from '@/components/admin/useIsMobileView'
import type { ButtonRef } from '@/lib/types'

const FreeButtonsCanvas = dynamic(() => import('@/components/admin/FreeButtonsCanvas'), { ssr: false })
const ButtonsEditor = dynamic(() => import('@/components/admin/ButtonsEditor'), { ssr: false })

/**
 * Zona de botones de una sección con posición libre estilo Wix. La sección
 * que la usa DEBE tener `position: relative` en su elemento raíz — el canvas
 * cubre esa área completa (position:absolute;inset:0).
 *
 * canvasActive (edit, o ya hay coordenadas guardadas para la vista actual)
 * → FreeButtonsCanvas (arrastre libre). Si no, se usa `staticRender` — el
 * layout de siempre (fila con flexbox), sin canvas de por medio.
 */
export function ButtonsArea({
  sectionLabel,
  buttons,
  edit,
  onChange,
  buttonClassName,
  staticRender,
}: {
  sectionLabel: string
  buttons: ButtonRef[]
  edit?: boolean
  onChange?: (next: ButtonRef[]) => void
  buttonClassName: (index: number) => string
  staticRender: () => React.ReactNode
}) {
  const [editorOpen, setEditorOpen] = useState(false)
  const isMobile = useIsMobileView()
  const xKey = isMobile ? 'mobileX' : 'desktopX'
  const yKey = isMobile ? 'mobileY' : 'desktopY'
  const canvasActive = !!edit || buttons.some((b) => b[xKey] != null && b[yKey] != null)

  if (!buttons.length && !edit) return null

  return (
    <>
      {canvasActive ? (
        <FreeButtonsCanvas
          buttons={buttons}
          edit={!!edit}
          xKey={xKey}
          yKey={yKey}
          onChange={(next) => onChange?.(next)}
          buttonClassName={buttonClassName}
        />
      ) : (
        staticRender()
      )}

      {edit && (
        <button
          type="button"
          onClick={() => setEditorOpen(true)}
          className="relative z-10 mt-2 block rounded bg-black/60 px-2 py-1 text-[11px] text-white hover:bg-black/75"
        >
          ✏️ Editar botones
        </button>
      )}

      {editorOpen && (
        <ButtonsEditor
          sectionLabel={sectionLabel}
          buttons={buttons}
          onChange={(next) => onChange?.(next)}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </>
  )
}
