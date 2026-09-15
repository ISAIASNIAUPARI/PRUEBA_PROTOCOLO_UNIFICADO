import { NextResponse } from 'next/server'

import pageLayoutJson from '@/content/pageLayout.json'
import { DYNAMIC_SECTION_LABELS, emptySectionData, type DynamicSectionType, type PageLayout } from '@/lib/types'
import { commitFiles } from '@/lib/github'

function slugify(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const type = body?.type as DynamicSectionType
    const label = typeof body?.label === 'string' ? body.label.trim() : ''

    if (!type || !DYNAMIC_SECTION_LABELS[type]) {
      return NextResponse.json({ ok: false, error: 'Tipo de plantilla inválido.' }, { status: 400 })
    }
    if (!label) {
      return NextResponse.json({ ok: false, error: 'El nombre no puede estar vacío.' }, { status: 400 })
    }

    const layout = pageLayoutJson as PageLayout
    const baseSlug = slugify(label) || 'seccion'
    let id = `${type}-${baseSlug}`
    let n = 2
    while (layout.sections.some((s) => s.id === id)) {
      id = `${type}-${baseSlug}-${n}`
      n += 1
    }

    const data = emptySectionData(type)
    const nextLayout: PageLayout = {
      sections: [...layout.sections, { id, label, visible: true, type }],
    }

    const result = await commitFiles(
      [
        { path: `content/sections/${id}.json`, content: `${JSON.stringify(data, null, 2)}\n`, encoding: 'utf-8' },
        { path: 'content/pageLayout.json', content: `${JSON.stringify(nextLayout, null, 2)}\n`, encoding: 'utf-8' },
      ],
      `admin: crear sección "${label}" (${type})`
    )

    return NextResponse.json({ ok: true, id, data, layout: nextLayout, ...result })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Error al crear la sección.' }, { status: 500 })
  }
}
