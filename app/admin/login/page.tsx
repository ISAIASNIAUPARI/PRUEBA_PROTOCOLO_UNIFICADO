'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.ok) throw new Error(json.error || 'Contraseña incorrecta.')
      router.push('/admin')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-admin-bg px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg border border-admin-line bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-lg font-semibold text-admin-ink">La Gloria Familia Unida</h1>
        <p className="mb-4 text-sm text-admin-ink/60">Panel de administración</p>
        <label className="mb-1 block text-sm font-medium text-admin-ink" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3 w-full rounded-md border border-admin-line px-3 py-2 text-sm outline-none focus:border-admin-primary"
          autoFocus
        />
        {error && <p className="mb-3 text-sm text-admin-danger">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-md bg-admin-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-admin-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
