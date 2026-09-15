// Cloudinary del lado SERVIDOR: las credenciales se leen solo acá, nunca en
// variables NEXT_PUBLIC_.
//
// Hay dos caminos de subida, y la diferencia importa:
//
//  · Imágenes → pasan por /api/admin/upload-image. Se pueden porque
//    EditableImage las comprime a WebP en el navegador ANTES de subir, así que
//    el archivo que viaja pesa poco.
//  · Video y modelos .glb → NO pueden pasar por el servidor. Las funciones de
//    Vercel cortan el cuerpo de la petición en ~4.5MB (límite de la
//    plataforma, ver error #7 del cerebro), y un video real lo supera casi
//    siempre: por eso "Cambiar video" fallaba con "No se pudo subir el video".
//    Para esos dos el servidor solo FIRMA la subida (`signUpload`) y el
//    navegador sube el archivo directo a Cloudinary, sin pasar por Vercel.

import {
  ALLOWED_IMAGE_TYPES,
  CLOUDINARY_FOLDER,
  deliveryUrl,
  maxBytesFor,
  resourceTypeFor,
  type ResourceKind,
} from './cloudinary-shared'

function getConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Faltan variables de entorno de Cloudinary (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET).')
  }
  return { cloudName, apiKey, apiSecret }
}

// Cloudinary firma con SHA-1 plano sobre "params_ordenados_alfabéticamente" + api_secret
// (no es HMAC). Ver https://cloudinary.com/documentation/authentication_signatures.
async function sha1Hex(message: string) {
  const enc = new TextEncoder()
  const digest = await crypto.subtle.digest('SHA-1', enc.encode(message))
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Public_id plano y sin guion bajo para .glb — un nombre con "_" puede
 *  colisionar con el parser de transformaciones de Cloudinary (error #9). */
function modelPublicId(timestamp: number) {
  return `model${timestamp}${Math.random().toString(36).slice(2, 8)}`
}

async function signedParams(kind: ResourceKind) {
  const { cloudName, apiKey, apiSecret } = getConfig()
  const timestamp = Math.floor(Date.now() / 1000)
  const publicId = kind === 'model' ? modelPublicId(timestamp) : undefined

  const paramsToSign = publicId
    ? `folder=${CLOUDINARY_FOLDER}&public_id=${publicId}&timestamp=${timestamp}`
    : `folder=${CLOUDINARY_FOLDER}&timestamp=${timestamp}`
  const signature = await sha1Hex(paramsToSign + apiSecret)

  return { cloudName, apiKey, timestamp, publicId, signature }
}

/**
 * Datos para que el NAVEGADOR suba directo a Cloudinary. Devuelve una firma de
 * un solo uso — nunca el api_secret.
 */
export async function signUpload(kind: ResourceKind) {
  const { cloudName, apiKey, timestamp, publicId, signature } = await signedParams(kind)
  return {
    cloudName,
    apiKey,
    timestamp,
    publicId,
    signature,
    folder: CLOUDINARY_FOLDER,
    resourceType: resourceTypeFor(kind),
    maxBytes: maxBytesFor(kind),
  }
}

/** Subida server-side. Solo para imágenes (ya comprimidas en el navegador). */
export async function uploadToCloudinary(file: File, kind: ResourceKind): Promise<{ url: string }> {
  if (kind === 'image') {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) throw new Error('Tipo de imagen no soportado.')
    if (file.size > maxBytesFor('image')) throw new Error('La imagen es demasiado grande.')
  }

  const { cloudName, apiKey, timestamp, publicId, signature } = await signedParams(kind)

  const uploadForm = new FormData()
  uploadForm.append('file', file)
  uploadForm.append('api_key', apiKey)
  uploadForm.append('timestamp', String(timestamp))
  uploadForm.append('folder', CLOUDINARY_FOLDER)
  if (publicId) uploadForm.append('public_id', publicId)
  uploadForm.append('signature', signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceTypeFor(kind)}/upload`, {
    method: 'POST',
    body: uploadForm,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error?.message || 'Cloudinary rechazó la subida.')

  return { url: deliveryUrl(kind, cloudName, json) }
}
