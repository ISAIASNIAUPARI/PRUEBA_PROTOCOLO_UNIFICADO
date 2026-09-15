'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'

type SectionsState = Record<string, unknown>

type EditContextValue = {
  data: SectionsState
  update: (sectionId: string, next: unknown) => void
  save: () => Promise<void>
  saving: boolean
  saved: boolean
  error: string | null
  dirty: boolean
}

const EditContext = createContext<EditContextValue | null>(null)

/**
 * Estado central del admin: qué secciones cambiaron, guardar, errores.
 * "Guardar" manda solo las secciones marcadas como sucias a /api/admin/save,
 * que las comitea a GitHub como JSON — nunca binarios.
 */
export function EditProvider({
  initialData,
  children,
}: {
  initialData: SectionsState
  children: React.ReactNode
}) {
  const [data, setData] = useState<SectionsState>(initialData)
  const dataRef = useRef<SectionsState>(initialData)
  const dirtyIds = useRef<Set<string>>(new Set())
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <EditContext.Provider value={{ data, update, save, saving, saved, error, dirty }}>
      {children}
    </EditContext.Provider>
  )
}

export function useEdit() {
  const ctx = useContext(EditContext)
  if (!ctx) throw new Error('useEdit debe usarse dentro de <EditProvider>.')
  return ctx
}
