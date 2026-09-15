'use client'

import { useId, useRef, useState } from 'react'

import { usePreviewReadOnly, useSelectionOptional } from '@/components/admin/Selection'

import { uploadDirectToCloudinary } from '@/lib/upload-direct'

type Props = {
  edit?: boolean
  onChange?: (url: string) => void
}

/**
 * Overlay para reemplazar un objeto 3D (.glb) desde /admin. Se monta ENCIMA
 * del <model-viewer> real (que sigue mostrando el modelo actual mientras se
 * sube uno nuevo) — mismo patrón hover que EditableImage/CloudinaryVideo.
 * Sube DIRECTO a Cloudinary como resource_type "raw", con una firma de un
 * solo uso pedida a /api/admin/upload-signature.
 */
export function EditableModel({ edit, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const readOnly = usePreviewReadOnly()
  const selection = useSelectionOptional()
  const id = useId()
  const selected = selection?.selected?.id === id

  if (!edit) return null

  // En el preview no hay botón de subida: un clic selecciona el objeto y el
  // control de subir .glb aparece en el sidebar.
  if (readOnly) {
    return (
      <div
        className={`admin-selectable absolute inset-0 ${selected ? 'admin-selected' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          selection?.select(
            { id, kind: 'media', label: 'Objeto 3D' },
            { renderControls: () => <EditableModel edit onChange={onChange} /> }
          )
        }}
      />
    )
  }

  // Mismo camino directo que el video: un .glb puede superar el límite de
  // ~4.5MB del cuerpo de una función de Vercel (el tope propio de Cloudinary
  // para "raw" es 10MB). Ver error #7 del cerebro.
  async function upload(file: File) {
    setError(null)
    setUploading(true)
    setProgress(0)
    try {
      const url = await uploadDirectToCloudinary(file, 'model', setProgress)
      onChange?.(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir el modelo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-3">
      <div className="pointer-events-auto flex flex-col items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded bg-black/65 px-3 py-1.5 text-xs font-medium text-white shadow hover:bg-black/80"
        >
          {uploading ? `Subiendo… ${progress}%` : '🧊 Cambiar modelo 3D (.glb)'}
        </button>
        {error && <span className="max-w-[220px] rounded bg-admin-danger px-2 py-1 text-center text-[11px] text-white">{error}</span>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".glb,model/gltf-binary"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) upload(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
