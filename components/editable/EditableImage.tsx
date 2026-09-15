'use client'

import { useRef, useState } from 'react'

type Props = {
  src?: string | null
  alt?: string
  edit?: boolean
  onChange?: (url: string) => void
  className?: string
  imgClassName?: string
  maxWidth?: number
  /**
   * true cuando el <img> original se posiciona vía CSS del sitio (ej.
   * `.hero-slides img{position:absolute;inset:0}`) y por lo tanto el propio
   * contenedor de este componente también debe llenar a su padre absoluto,
   * en vez del tamaño-por-contenido normal.
   */
  fill?: boolean
}

/**
 * Imagen editable. En edit=false es un <img> normal, idéntico al que había
 * antes de agregar este componente. En edit=true muestra un overlay con
 * "Cambiar imagen": comprime/redimensiona en el navegador con <canvas>
 * (evita tocar el límite de ~4.5MB de las funciones de Vercel), sube a
 * /api/admin/upload-image (Cloudinary), y entrega la URL resultante por
 * onChange — el binario nunca pasa por el commit de GitHub.
 */
export function EditableImage({ src, alt, edit, onChange, className, imgClassName, maxWidth = 1800, fill }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  async function compress(file: File): Promise<Blob> {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxWidth / bitmap.width)
    const w = Math.max(1, Math.round(bitmap.width * scale))
    const h = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas no disponible.')
    ctx.drawImage(bitmap, 0, 0, w, h)
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo comprimir la imagen.'))), 'image/webp', 0.8)
    })
  }

  function upload(file: File) {
    setError(null)
    setUploading(true)
    setProgress(0)
    compress(file)
      .then((blob) => {
        const form = new FormData()
        form.append('file', blob, 'imagen.webp')
        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/admin/upload-image')
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
            setError('No se pudo subir la imagen.')
          }
        }
        xhr.onerror = () => {
          setUploading(false)
          setError('No se pudo subir la imagen.')
        }
        xhr.send(form)
      })
      .catch(() => {
        setUploading(false)
        setError('No se pudo procesar la imagen.')
      })
  }

  if (!edit) {
    if (!src) return null
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt || ''} className={imgClassName} loading="lazy" decoding="async" />
  }

  return (
    <div className={`group ${fill ? 'absolute inset-0' : 'relative'} ${className ?? ''}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt || ''} className={imgClassName} />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-admin-line text-sm text-admin-ink/60">
          Sin imagen
        </div>
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded bg-white px-3 py-1.5 text-sm font-medium text-admin-ink shadow hover:bg-admin-bg"
        >
          {uploading ? `Subiendo… ${progress}%` : 'Cambiar imagen'}
        </button>
        {error && <span className="rounded bg-admin-danger px-2 py-1 text-xs text-white">{error}</span>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
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
