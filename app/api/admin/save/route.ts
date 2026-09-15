import { NextResponse } from 'next/server'

import { sectionFilePath } from '@/lib/content'
import { commitFiles } from '@/lib/github'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const sections: { sectionId: string; data: unknown }[] = Array.isArray(body?.sections) ? body.sections : []

    if (sections.length === 0) {
      return NextResponse.json({ ok: false, error: 'No hay cambios que guardar.' }, { status: 400 })
    }

    const files = sections
      .filter((s) => typeof s.sectionId === 'string')
      .map((s) => ({
        path: sectionFilePath(s.sectionId),
        content: `${JSON.stringify(s.data, null, 2)}\n`,
        encoding: 'utf-8' as const,
      }))

    if (files.length === 0) {
      return NextResponse.json({ ok: false, error: 'Ninguna de las secciones enviadas es válida.' }, { status: 400 })
    }

    const result = await commitFiles(files, `admin: actualizar ${files.map((f) => f.path).join(', ')}`)
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Error al guardar.' }, { status: 500 })
  }
}
