'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'

import type { PageLayout, Theme } from '@/lib/types'

type SectionsState = Record<string, unknown>
export type ViewMode = 'desktop' | 'mobile'

type EditContextValue = {
  data: SectionsState
  update: (sectionId: string, next: unknown) => void
  save: () => Promise<void>
  saving: boolean
  saved: boolean
  error: string | null
  dirty: boolean

  layout: PageLayout
  updateLayout: (next: PageLayout) => void
  movedId: string | null
  flash: (id: string) => void

  theme: Theme
  setThemePreview: (next: Theme) => void
  saveTheme: (next: Theme) => Promise<void>
  themeSaving: boolean
  themeError: string | null

  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void

  createSection: (type: string, label: string) => Promise<void>
  deleteSection: (id: string) => Promise<void>
  sectionsBusy: boolean
  sectionsError: string | null
}

const EditContext = createContext<EditContextValue | null>(null)

/**
 * Estado central del admin: contenido de cada sección, orden/visibilidad de
 * página, tema de 3 colores, vista desktop/móvil. "Guardar" manda solo las
 * secciones marcadas como sucias a /api/admin/save (comitea JSON a GitHub,
 * nunca binarios).
 */
export function EditProvider({
  initialData,
  initialLayout,
  initialTheme,
  children,
}: {
  initialData: SectionsState
  initialLayout: PageLayout
  initialTheme: Theme
  children: React.ReactNode
}) {
  const [data, setData] = useState<SectionsState>(initialData)
  const dataRef = useRef<SectionsState>(initialData)
  const dirtyIds = useRef<Set<string>>(new Set())
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [layout, setLayout] = useState<PageLayout>(initialLayout)
  const layoutRef = useRef<PageLayout>(initialLayout)
  const [movedId, setMovedId] = useState<string | null>(null)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [themeSaving, setThemeSaving] = useState(false)
  const [themeError, setThemeError] = useState<string | null>(null)

  const [viewMode, setViewMode] = useState<ViewMode>('desktop')

  const [sectionsBusy, setSectionsBusy] = useState(false)
  const [sectionsError, setSectionsError] = useState<string | null>(null)

  const update = useCallback((sectionId: string, next: unknown) => {
    dirtyIds.current.add(sectionId)
    setDirty(true)
    setSaved(false)
    setData((prev) => {
      const merged = { ...prev, [sectionId]: next }
      dataRef.current = merged
      return merged
    })
  }, [])

  const save = useCallback(async () => {
    if (dirtyIds.current.size === 0) return
    setSaving(true)
    setError(null)
    try {
      const changedIds = Array.from(dirtyIds.current)
      const sections = changedIds.map((id) => ({ sectionId: id, data: dataRef.current[id] }))
      const res = await fetch('/api/admin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'No se pudo guardar.')
      }
      changedIds.forEach((id) => dirtyIds.current.delete(id))
      setDirty(dirtyIds.current.size > 0)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }, [])

  const flash = useCallback((id: string) => {
    setMovedId(id)
    if (flashTimer.current) clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setMovedId(null), 2000)
  }, [])

  const updateLayout = useCallback((next: PageLayout) => {
    layoutRef.current = next
    setLayout(next)
    dirtyIds.current.add('pageLayout')
    setDirty(true)
    setSaved(false)
    setData((prev) => {
      const merged = { ...prev, pageLayout: next }
      dataRef.current = merged
      return merged
    })
  }, [])

  const setThemePreview = useCallback((next: Theme) => {
    setTheme(next)
    document.documentElement.style.setProperty('--color-primary', next.colorPrimary)
    document.documentElement.style.setProperty('--color-secondary', next.colorSecondary)
    document.documentElement.style.setProperty('--color-accent', next.colorAccent)
  }, [])

  const saveTheme = useCallback(async (next: Theme) => {
    setThemeSaving(true)
    setThemeError(null)
    try {
      const res = await fetch('/api/admin/save-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudo guardar el tema.')
      setTheme(next)
    } catch (e) {
      setThemeError(e instanceof Error ? e.message : 'Error al guardar el tema.')
      throw e
    } finally {
      setThemeSaving(false)
    }
  }, [])

  const createSection = useCallback(async (type: string, label: string) => {
    if (dirtyIds.current.size > 0) {
      setSectionsError('Guarda o descarta los cambios pendientes antes de crear una sección.')
      throw new Error('Hay cambios sin guardar.')
    }
    setSectionsBusy(true)
    setSectionsError(null)
    try {
      const res = await fetch('/api/admin/create-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, label }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudo crear la sección.')
      const nextLayout: PageLayout = json.layout
      layoutRef.current = nextLayout
      setLayout(nextLayout)
      setData((prev) => {
        const merged = { ...prev, pageLayout: nextLayout, [json.id]: json.data }
        dataRef.current = merged
        return merged
      })
    } catch (e) {
      setSectionsError(e instanceof Error ? e.message : 'Error al crear la sección.')
      throw e
    } finally {
      setSectionsBusy(false)
    }
  }, [])

  const deleteSection = useCallback(async (id: string) => {
    if (dirtyIds.current.size > 0) {
      setSectionsError('Guarda o descarta los cambios pendientes antes de eliminar una sección.')
      throw new Error('Hay cambios sin guardar.')
    }
    setSectionsBusy(true)
    setSectionsError(null)
    try {
      const res = await fetch('/api/admin/delete-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudo eliminar la sección.')
      const nextLayout: PageLayout = json.layout
      layoutRef.current = nextLayout
      setLayout(nextLayout)
      setData((prev) => {
        const merged = { ...prev }
        delete merged[id]
        merged.pageLayout = nextLayout
        dataRef.current = merged
        return merged
      })
    } catch (e) {
      setSectionsError(e instanceof Error ? e.message : 'Error al eliminar la sección.')
      throw e
    } finally {
      setSectionsBusy(false)
    }
  }, [])

  return (
    <EditContext.Provider
      value={{
        data,
        update,
        save,
        saving,
        saved,
        error,
        dirty,
        layout,
        updateLayout,
        movedId,
        flash,
        theme,
        setThemePreview,
        saveTheme,
        themeSaving,
        themeError,
        viewMode,
        setViewMode,
        createSection,
        deleteSection,
        sectionsBusy,
        sectionsError,
      }}
    >
      {children}
    </EditContext.Provider>
  )
}

export function useEdit() {
  const ctx = useContext(EditContext)
  if (!ctx) throw new Error('useEdit debe usarse dentro de <EditProvider>.')
  return ctx
}

/** Como useEdit(), pero devuelve null fuera del admin en vez de lanzar — para
 * componentes compartidos (sitio público + admin) que solo necesitan saber
 * si hay edición activa, sin forzar que exista un <EditProvider>. */
export function useEditOptional() {
  return useContext(EditContext)
}
