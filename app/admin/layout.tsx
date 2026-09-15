import type { Metadata } from 'next'

// El admin reutiliza los componentes reales del sitio (Hero, Nav, Footer...),
// así que necesita el CSS del sitio público además del propio de Tailwind —
// si no, esos componentes se ven sin estilo (ver bug #2 del cerebro).
import '../globals.css'
import '../admin.css'

export const metadata: Metadata = {
  title: 'Admin — La Gloria Familia Unida',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Las variables de fuente (--font-poppins, etc.) ya están en <html> desde
  // el layout raíz — solo hace falta aplicarlas acá para que /admin use la
  // misma tipografía que el sitio público (ver bug #2 del cerebro).
  return (
    <div className="admin-shell min-h-screen bg-admin-bg text-admin-ink" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
      {children}
    </div>
  )
}
