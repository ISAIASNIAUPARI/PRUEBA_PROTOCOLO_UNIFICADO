import { NextResponse } from 'next/server'

import { signUpload } from '@/lib/cloudinary'
import type { ResourceKind } from '@/lib/cloudinary-shared'

/**
 * Firma de un solo uso para que el navegador suba video o modelos .glb DIRECTO
 * a Cloudinary, sin pasar por el body de la función (límite de ~4.5MB de
 * Vercel — ver error #7 del cerebro). Nunca devuelve el api_secret.
 *
 * La ruta vive bajo /api/admin/, así que el middleware ya exige sesión válida.
 */
export async function POST(req: Request) {
  try {
    const { kind } = (await req.json()) as { kind?: string }
    if (kind !== 'video' && kind !== 'model') {
      return NextResponse.json({ ok: false, error: 'Tipo de recurso no soportado.' }, { status: 400 })
    }
    const data = await signUpload(kind as ResourceKind)
    return NextResponse.json({ ok: true, ...data })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'No se pudo firmar la subida.' },
      { status: 500 }
    )
  }
}
