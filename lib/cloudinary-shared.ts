// Parte de Cloudinary que NO toca credenciales ni variables de entorno, para
// poder importarse tanto desde el servidor como desde el navegador.
// El secreto y la firma viven solo en lib/cloudinary.ts (servidor).

export type ResourceKind = 'image' | 'video' | 'model'

export const CLOUDINARY_FOLDER = 'la-gloria-familia-unida'

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024
// Límite real de esta cuenta de Cloudinary para resource_type "raw" (donde
// viven los .glb) — ver error #7/#8 del cerebro.
export const MAX_MODEL_BYTES = 10 * 1024 * 1024

export function resourceTypeFor(kind: ResourceKind): 'image' | 'video' | 'raw' {
  if (kind === 'model') return 'raw'
  return kind
}

export function maxBytesFor(kind: ResourceKind): number {
  if (kind === 'video') return MAX_VIDEO_BYTES
  if (kind === 'model') return MAX_MODEL_BYTES
  return MAX_IMAGE_BYTES
}

/**
 * URL de entrega a partir de la respuesta del upload.
 *
 * OJO con "raw" (.glb): Cloudinary devuelve el `public_id` CON la extensión ya
 * incluida, aunque el public_id que se envió no la tuviera. Agregar ".glb" acá
 * otra vez genera una ruta con doble extensión (".glb.glb") que 404ea — ver
 * error #26 del cerebro. Para imagen/video, en cambio, el public_id viene sin
 * extensión y el formato lo resuelve `f_auto`.
 */
export function deliveryUrl(kind: ResourceKind, cloudName: string, json: { version: number | string; public_id: string }): string {
  const base = `https://res.cloudinary.com/${cloudName}`
  if (kind === 'model') return `${base}/raw/upload/v${json.version}/${json.public_id}`
  return `${base}/${resourceTypeFor(kind)}/upload/f_auto,q_auto/v${json.version}/${json.public_id}`
}
