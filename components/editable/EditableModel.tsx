'use client'

import { useRef, useState } from 'react'

type Props = {
  edit?: boolean
  onChange?: (url: string) => void
}

/**
 * Overlay para reemplazar un objeto 3D (.glb) desde /admin. Se monta ENCIMA
 * del <model-viewer> real (que sigue mostrando el modelo actual mientras se
 * sube uno nuevo) — mismo patrón hover que EditableImage/CloudinaryVideo.
 * Sube a Cloudinary como resource_type "raw" vía /api/admin/upload-model.
 */
export function EditableModel({ edit, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  if (!edit) return null

  function upload(file: File) {
    setError(null)
    setUploading(true)
    setProgress(0)
    const form = new FormData()
    form.append('file', file)
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/admin/upload-model')
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      setUploading(false)
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText)
          if (data.url) onChange?.(data.url)
          else setError('La subida no devolvió una URL.')
        } catch {
          setError('Respuesta inválida del servidor.')
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText)
          setError(data.error || 'No se pudo subir el modelo.')
        } catch {
          setError('No se pudo subir el modelo.')
        }
      }
    }
    xhr.onerror = () => {
      setUploading(false)
      setError('No se pudo subir el modelo.')
    }
    xhr.send(form)
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
