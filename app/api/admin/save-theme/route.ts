import { NextResponse } from 'next/server'

import { commitFiles } from '@/lib/github'
import type { Theme } from '@/lib/types'

const HEX_RE = /^#[0-9a-fA-F]{6}$/

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Theme>
    const { colorPrimary, colorSecondary, colorAccent } = body

    for (const [key, value] of Object.entries({ colorPrimary, colorSecondary, colorAccent })) {
      if (typeof value !== 'string' || !HEX_RE.test(value)) {
        return NextResponse.json({ ok: false, error: `Color inválido en "${key}" — usa formato hex de 6 dígitos (#rrggbb).` }, { status: 400 })
      }
    }

    const theme: Theme = { colorPrimary: colorPrimary!, colorSecondary: colorSecondary!, colorAccent: colorAccent! }
    const result = await commitFiles(
      [{ path: 'content/theme.json', content: `${JSON.stringify(theme, null, 2)}\n`, encoding: 'utf-8' }],
      'admin: actualizar tema de colores'
    )

    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Error al guardar el tema.' }, { status: 500 })
  }
}
