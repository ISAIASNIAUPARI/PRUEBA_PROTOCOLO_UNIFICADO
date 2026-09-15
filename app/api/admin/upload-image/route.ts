import { NextResponse } from 'next/server'

import { uploadToCloudinary } from '@/lib/cloudinary'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: 'Falta el archivo.' }, { status: 400 })
    }
    const { url } = await uploadToCloudinary(file, 'image')
    return NextResponse.json({ ok: true, url })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Error al subir la imagen.' }, { status: 500 })
  }
}
