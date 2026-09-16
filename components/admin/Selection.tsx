'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

import type { TextSize, ThemeColorChoice } from '@/lib/types'

/** Qué tipo de elemento está seleccionado: decide qué controles pinta el sidebar. */
export type SelectionKind = 'text' | 'media' | 'buttons'

export type SelectionData = {
  id: string
  kind: SelectionKind
  /** Nombre legible del campo, ej. "Título principal". */
  label: string
  /** Solo para kind='text'. */
  value?: string
  textColor?: ThemeColorChoice
  fontSize?: TextSize
  fontWeight?: number
}

/**
 * Los callbacks viven en un ref y NO en el estado: se recrean en cada render
 * del elemento seleccionado (son flechas en línea), así que meterlos en el
 * estado dispararía un re-render por render. El sidebar los lee al vuelo
 * cuando el usuario escribe.
 */
type Handlers = {
  onChange?: (value: string) => void
  onTextColorChange?: (next: ThemeColorChoice | undefined) => void
  onFontSizeChange?: (next: TextSize | undefined) => void
  onFontWeightChange?: (next: number | undefined) => void
  /** Controles propios del elemento (imagen/video/modelo) pintados en el sidebar. */
  renderControls?: () => React.ReactNode
}

type SelectionContextValue = {
  selected: SelectionData | null
  isSelected: (id: string) => boolean
  /** Selecciona un elemento (click en el preview). */
  select: (data: SelectionData, handlers: Handlers) => void
  /** El elemento ya seleccionado refresca sus datos/callbacks al re-renderizar. */
  refresh: (data: SelectionData, handlers: Handlers) => void
  clear: () => void
  handlers: React.MutableRefObject<Handlers>
}

const SelectionContext = createContext<SelectionContextValue | null>(null)

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<SelectionData | null>(null)
  const handlers = useRef<Handlers>({})

  const select = useCallback((data: SelectionData, h: Handlers) => {
    handlers.current = h
    setSelected(data)
  }, [])

  // Mantiene el sidebar al día mientras el elemento sigue seleccionado, sin
  // provocar un bucle: solo toca el estado si algo visible cambió de verdad.
  const refresh = useCallback((data: SelectionData, h: Handlers) => {
    handlers.current = h
    setSelected((prev) => {
      if (!prev || prev.id !== data.id) return prev
      if (
        prev.value === data.value &&
        prev.textColor === data.textColor &&
        prev.label === data.label &&
        prev.fontWeight === data.fontWeight &&
        prev.fontSize?.d === data.fontSize?.d &&
        prev.fontSize?.m === data.fontSize?.m
      ) {
        return prev
      }
      return data
    })
  }, [])

  const clear = useCallback(() => {
    handlers.current = {}
    setSelected(null)
  }, [])

  const isSelected = useCallback((id: string) => selected?.id === id, [selected])

  const value = useMemo(
    () => ({ selected, isSelected, select, refresh, clear, handlers }),
    [selected, isSelected, select, refresh, clear]
  )

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>
}

/** Devuelve null fuera del admin: los componentes compartidos con el sitio
 *  público tienen que poder renderizarse sin ningún proveedor. */
export function useSelectionOptional() {
  return useContext(SelectionContext)
}

export function useSelection() {
  const ctx = useContext(SelectionContext)
  if (!ctx) throw new Error('useSelection fuera de <SelectionProvider>')
  return ctx
}

/**
 * Marca el árbol del PREVIEW como solo lectura.
 *
 * En el preview el cliente solo puede hacer scroll y seleccionar texto; toda
 * acción que modifique algo (subir imagen o video, arrastrar botones, cambiar
 * el punto focal) vive en el sidebar. Así no hay forma de disparar una acción
 * por accidente mientras se recorre la web.
 */
const PreviewReadOnlyContext = createContext(false)

export function PreviewReadOnly({ children }: { children: React.ReactNode }) {
  return <PreviewReadOnlyContext.Provider value={true}>{children}</PreviewReadOnlyContext.Provider>
}

export function usePreviewReadOnly() {
  return useContext(PreviewReadOnlyContext)
}
