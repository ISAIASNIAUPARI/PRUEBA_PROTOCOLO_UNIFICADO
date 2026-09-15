import { NextResponse } from 'next/server'

import { createSessionToken, SESSION_COOKIE } from '@/lib/auth'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({ password: '' }))
  const password = typeof body?.password === 'string' ? body.password : ''

  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    return NextResponse.json({ ok: false, error: 'ADMIN_PASSWORD no está configurada en el servidor.' }, { status: 500 })
  }
  if (password !== expected) {
    return NextResponse.json({ ok: false, error: 'Contraseña incorrecta.' }, { status: 401 })
  }

  const token = await createSessionToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return res
}
