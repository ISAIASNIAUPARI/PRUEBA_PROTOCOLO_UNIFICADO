import { NextResponse } from 'next/server'

import pageLayoutJson from '@/content/pageLayout.json'
import { commitFiles } from '@/lib/github'
import type { PageLayout } from '@/lib/types'

const BASE_SECTION_IDS = new Set(['hero', 'about', 'experience', 'objects3d', 'specials', 'menu', 'reservations'])

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const id = typeof body?.id === 'string' ? body.id : ''

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Falta el id de la sección.' }, { status: 400 })
    }
    if (BASE_SECTION_IDS.has(id)) {
      return NextResponse.json({ ok: false, error: 'Las secciones base del sitio no se pueden eliminar.' }, { status: 400 })
    }

    const layout = pageLayoutJson as PageLayout
    const entry = layout.sections.find((s) => s.id === id)
    if (!entry) {
      return NextResponse.json({ ok: false, error: 'Esa sección no existe.' }, { status: 404 })
    }

    const nextLayout: PageLayout = { sections: layout.sections.filter((s) => s.id !== id) }

    const result = await commitFiles(
      [
        { path: `content/sections/${id}.json`, deleted: true },
        { path: 'content/pageLayout.json', content: `${JSON.stringify(nextLayout, null, 2)}\n`, encoding: 'utf-8' },
      ],
      `admin: eliminar sección "${entry.label}"`
    )

    return NextResponse.json({ ok: true, layout: nextLayout, ...result })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Error al eliminar la sección.' }, { status: 500 })
  }
}
