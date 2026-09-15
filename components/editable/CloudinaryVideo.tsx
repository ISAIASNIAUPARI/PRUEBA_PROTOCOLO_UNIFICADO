'use client'

import { useRef, useState } from 'react'

type Props = {
  src: string
  edit?: boolean
  onChange?: (url: string) => void
  className?: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  playsInline?: boolean
}

/**
 * Video editable (mismo patrón que EditableImage). En edit=false es un
 * <video> normal. En edit=true muestra "Cambiar video", sube el archivo tal
 * cual (sin comprimir en cliente) a /api/admin/upload-video y entrega la URL
 * de Cloudinary resultante.
 */
export function CloudinaryVideo({ src, edit, onChange, className, autoPlay, loop = true, muted = true, playsInline = true }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  function upload(file: File) {
    setError(null)
    setUploading(true)
    setProgress(0)
    const form = new FormData()
    form.append('file', file)
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/admin/upload-video')
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
        setError('No se pudo subir el video.')
      }
    }
    xhr.onerror = () => {
      setUploading(false)
      setError('No se pudo subir el video.')
    }
    xhr.send(form)
  }

  if (!edit) {
    return <video src={src} className={className} autoPlay={autoPlay} loop={loop} muted={muted} playsInline={playsInline} />
  }

  return (
    <div className="group relative">
      <video src={src} className={className} autoPlay={autoPlay} loop={loop} muted={muted} playsInline={playsInline} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded bg-white px-3 py-1.5 text-sm font-medium text-admin-ink shadow hover:bg-admin-bg"
        >
          {uploading ? `Subiendo… ${progress}%` : 'Cambiar video'}
        </button>
        {error && <span className="rounded bg-admin-danger px-2 py-1 text-xs text-white">{error}</span>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
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
