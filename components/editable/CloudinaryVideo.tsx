'use client'

import { useRef, useState } from 'react'

import { uploadDirectToCloudinary } from '@/lib/upload-direct'

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
 * <video> normal. En edit=true muestra "Cambiar video" y sube el archivo tal
 * cual (sin comprimir en cliente) DIRECTO a Cloudinary con una firma de un
 * solo uso, entregando la URL resultante por onChange.
 */
export function CloudinaryVideo({ src, edit, onChange, className, autoPlay, loop = true, muted = true, playsInline = true }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Sube DIRECTO a Cloudinary (no por /api): un video real supera casi siempre
  // el límite de ~4.5MB que Vercel impone al cuerpo de una petición, y ese era
  // el motivo del "No se pudo subir el video". Ver error #7 del cerebro.
  async function upload(file: File) {
    setError(null)
    setUploading(true)
    setProgress(0)
    try {
      const url = await uploadDirectToCloudinary(file, 'video', setProgress)
      onChange?.(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir el video.')
    } finally {
      setUploading(false)
    }
  }

  if (!edit) {
    return <video src={src} className={className} autoPlay={autoPlay} loop={loop} muted={muted} playsInline={playsInline} />
  }

  return (
    <div className="group relative h-full w-full">
      <video src={src} className={className} autoPlay={autoPlay} loop={loop} muted={muted} playsInline={playsInline} />
      {/*
        El fondo de video de una sección puede ser mucho más alto que la
        pantalla (ej. Menú: el mismo <div class="vid-bg"> cubre TODO el
        listado del menú, no solo un header acotado) y, en headers cortos
        (ej. Especiales), un overlay centrado coincide con el título, que
        queda pintado ENCIMA (mayor z-index) y tapa/bloquea el botón ahí
        mismo. `position:sticky` no sirve para seguir el scroll dentro de
        esa sección: tanto `.esp-header` como `.menu` traen `overflow:hidden`
        propio del sitio, y eso convierte a esa sección en el "contenedor de
        scroll" de referencia para el sticky (según el spec, cualquier
        ancestro con overflow distinto de visible cuenta como tal, aunque
        nunca haga scroll él mismo) — el hijo sticky nunca se despega de su
        posición de flujo normal ahí dentro. Se ancla simple, sin sticky, a
        la esquina superior derecha del área de video: en headers cortos cae
        lejos del título centrado, y en secciones largas queda cerca de
        donde el video es realmente visible (antes de que empiece el
        contenido opaco que lo tapa) en vez de enterrado a media altura.
        Offset en `style` inline, no con `mr-4 mt-4`: `globals.css` trae un
        reset universal sin capa (`*{margin:0}`, línea ~39) que por las
        reglas de cascade layers de CSS le gana a CUALQUIER utilidad de
        Tailwind con la misma propiedad (Tailwind vive en `@layer utilities`
        acá, y una regla sin layer siempre gana sobre una con layer, sin
        importar especificidad) — las clases de margen quedaban en 0px.
      */}
      <div className="pointer-events-none absolute inset-0 flex items-start justify-end bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="pointer-events-auto flex flex-col items-end gap-2" style={{ marginTop: 16, marginRight: 16 }}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded bg-white px-3 py-1.5 text-sm font-medium text-admin-ink shadow hover:bg-admin-bg"
          >
            {uploading ? `Subiendo… ${progress}%` : 'Cambiar video'}
          </button>
          {error && <span className="rounded bg-admin-danger px-2 py-1 text-xs text-white">{error}</span>}
        </div>
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
