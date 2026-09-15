'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { useIsMobileView } from '@/components/admin/useIsMobileView'
import type { ButtonRef } from '@/lib/types'

const FreeButtonsCanvas = dynamic(() => import('@/components/admin/FreeButtonsCanvas'), { ssr: false })
const ButtonsEditor = dynamic(() => import('@/components/admin/ButtonsEditor'), { ssr: false })

/**
 * Zona de botones de una sección con posición libre estilo Wix.
 *
 * El canvas se porta (React portal) directo dentro de `sectionRef` — la
 * SECCIÓN completa (no el div interno donde se llama a este componente).
 * Así el canvas cubre el área completa real de la sección, no una caja
 * chica del tamaño del texto — `sectionRef` debe apuntar a un elemento con
 * `position: relative` (la propia <section>).
 *
 * canvasActive (edit, o ya hay coordenadas guardadas para la vista actual)
 * → FreeButtonsCanvas (arrastre libre). Si no, se usa `staticRender` — el
 * layout de siempre (fila con flexbox), sin canvas de por medio.
 */
export function ButtonsArea({
  sectionLabel,
  sectionRef,
  buttons,
  edit,
  onChange,
  buttonClassName,
  staticRender,
}: {
  sectionLabel: string
  sectionRef: React.RefObject<HTMLElement | null>
  buttons: ButtonRef[]
  edit?: boolean
  onChange?: (next: ButtonRef[]) => void
  buttonClassName: (index: number) => string
  staticRender: () => React.ReactNode
}) {
  const [editorOpen, setEditorOpen] = useState(false)
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null)
  const isMobile = useIsMobileView()
  const xKey = isMobile ? 'mobileX' : 'desktopX'
  const yKey = isMobile ? 'mobileY' : 'desktopY'
  const canvasActive = !!edit || buttons.some((b) => b[xKey] != null && b[yKey] != null)

  useEffect(() => {
    setMountNode(sectionRef.current)
  }, [sectionRef])

  if (!buttons.length && !edit) return null

  return (
    <>
      {canvasActive && mountNode
        ? createPortal(
            <FreeButtonsCanvas
              buttons={buttons}
              edit={!!edit}
              xKey={xKey}
              yKey={yKey}
              onChange={(next) => onChange?.(next)}
              buttonClassName={buttonClassName}
            />,
            mountNode
          )
        : !canvasActive && staticRender()}

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
