// Subida server-side a Cloudinary para /api/admin/upload-image, upload-video
// y upload-model. Credenciales solo se leen acá (servidor) — nunca en
// variables NEXT_PUBLIC_.

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 200 * 1024 * 1024
// Límite real de esta cuenta de Cloudinary para resource_type "raw" (donde
// viven los .glb) — ver error #7/#8 y el caso Nieve Artesanal en
// [[15 - Errores encontrados y como evitarlos]] / [[14 - Casos de referencia]].
const MAX_MODEL_BYTES = 10 * 1024 * 1024
const CLOUDINARY_FOLDER = 'la-gloria-familia-unida'

type ResourceKind = 'image' | 'video' | 'model'

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

function resourceTypeFor(kind: ResourceKind): 'image' | 'video' | 'raw' {
  if (kind === 'model') return 'raw'
  return kind
}

export async function uploadToCloudinary(file: File, kind: ResourceKind): Promise<{ url: string }> {
  if (kind === 'image' && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Tipo de imagen no soportado.')
  }
  if (kind === 'image' && file.size > MAX_IMAGE_BYTES) {
    throw new Error('La imagen es demasiado grande.')
  }
  if (kind === 'video' && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
    throw new Error('Tipo de video no soportado.')
  }
  if (kind === 'video' && file.size > MAX_VIDEO_BYTES) {
    throw new Error('El video es demasiado grande (máx. 200MB).')
  }
  if (kind === 'model') {
    if (!file.name.toLowerCase().endsWith('.glb')) {
      throw new Error('Solo se aceptan archivos .glb.')
    }
    if (file.size > MAX_MODEL_BYTES) {
      throw new Error('El modelo 3D es demasiado grande (máx. 10MB) — expórtalo optimizado (Draco + texturas comprimidas) antes de subirlo.')
    }
  }

  const { cloudName, apiKey, apiSecret } = getConfig()
  const resourceType = resourceTypeFor(kind)
  const timestamp = Math.floor(Date.now() / 1000)

  // Public_id plano y sin guion bajo para .glb — un nombre con "_" puede
  // colisionar con el parser de transformaciones de Cloudinary (ver
  // [[07 - Reglas de medios, qué va en el código y qué en Cloudinary]]).
  const publicId =
    kind === 'model' ? `model${timestamp}${Math.random().toString(36).slice(2, 8)}` : undefined

  const paramsToSign =
    kind === 'model'
      ? `folder=${CLOUDINARY_FOLDER}&public_id=${publicId}&timestamp=${timestamp}`
      : `folder=${CLOUDINARY_FOLDER}&timestamp=${timestamp}`
  const signature = await sha1Hex(paramsToSign + apiSecret)

  const uploadForm = new FormData()
  uploadForm.append('file', file)
  uploadForm.append('api_key', apiKey)
  uploadForm.append('timestamp', String(timestamp))
  uploadForm.append('folder', CLOUDINARY_FOLDER)
  if (publicId) uploadForm.append('public_id', publicId)
  uploadForm.append('signature', signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
    method: 'POST',
    body: uploadForm,
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json?.error?.message || 'Cloudinary rechazó la subida.')
  }

  // Para resource_type "raw", Cloudinary devuelve public_id CON la extensión
  // original ya incluida (aunque el public_id que enviamos no la tuviera) —
  // agregar ".glb" de nuevo acá produce una URL con doble extensión
  // (".glb.glb") que 404ea. json.public_id ya es la ruta completa correcta.
  const url =
    kind === 'model'
      ? `https://res.cloudinary.com/${cloudName}/raw/upload/v${json.version}/${json.public_id}`
      : `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/f_auto,q_auto/v${json.version}/${json.public_id}`
  return { url }
}
