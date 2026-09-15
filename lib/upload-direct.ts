'use client'

// Subida NAVEGADOR → CLOUDINARY directa, con firma pedida al servidor.
//
// Por qué no pasa por nuestra API: las funciones de Vercel cortan el cuerpo de
// la petición en ~4.5MB (límite de la plataforma, no de Next ni de la app), así
// que cualquier video real fallaba con un error genérico. Ver error #7 del
// cerebro. Un fetch SALIENTE del navegador a Cloudinary no tiene ese techo.

import { deliveryUrl, maxBytesFor, type ResourceKind } from './cloudinary-shared'

type SignResponse = {
  ok: boolean
  error?: string
  cloudName: string
  apiKey: string
  timestamp: number
  publicId?: string
  signature: string
  folder: string
  resourceType: string
}

function humanMB(bytes: number) {
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10}MB`
}

export async function uploadDirectToCloudinary(
  file: File,
  kind: Exclude<ResourceKind, 'image'>,
  onProgress?: (percent: number) => void
): Promise<string> {
  const max = maxBytesFor(kind)
  if (file.size > max) {
    throw new Error(
      kind === 'model'
        ? `El modelo pesa ${humanMB(file.size)} y el máximo es ${humanMB(max)} — expórtalo optimizado (face_limit 40000, Draco + texturas comprimidas).`
        : `El video pesa ${humanMB(file.size)} y el máximo es ${humanMB(max)}.`
    )
  }
  if (kind === 'model' && !file.name.toLowerCase().endsWith('.glb')) {
    throw new Error('Solo se aceptan archivos .glb.')
  }

  const signRes = await fetch('/api/admin/upload-signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind }),
  })
  const sign = (await signRes.json().catch(() => ({}))) as SignResponse
  if (!signRes.ok || !sign.ok) throw new Error(sign.error || 'No se pudo preparar la subida.')

  const form = new FormData()
  form.append('file', file)
  form.append('api_key', sign.apiKey)
  form.append('timestamp', String(sign.timestamp))
  form.append('folder', sign.folder)
  if (sign.publicId) form.append('public_id', sign.publicId)
  form.append('signature', sign.signature)

  const json = await new Promise<{ version: number | string; public_id: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${sign.cloudName}/${sign.resourceType}/upload`)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      let parsed: { error?: { message?: string }; version?: number | string; public_id?: string } = {}
      try {
        parsed = JSON.parse(xhr.responseText)
      } catch {
        reject(new Error('Respuesta inválida de Cloudinary.'))
        return
      }
      if (xhr.status >= 200 && xhr.status < 300 && parsed.public_id && parsed.version != null) {
        resolve({ version: parsed.version, public_id: parsed.public_id })
      } else {
        // El mensaje real de Cloudinary es mucho más útil que un genérico
        // ("File size too large. Got X. Maximum is Y", formato no permitido…).
        reject(new Error(parsed.error?.message || `Cloudinary rechazó la subida (${xhr.status}).`))
      }
    }
    xhr.onerror = () => reject(new Error('Se cortó la conexión con Cloudinary.'))
    xhr.send(form)
  })

  return deliveryUrl(kind, sign.cloudName, json)
}
