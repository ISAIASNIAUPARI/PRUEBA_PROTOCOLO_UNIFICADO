/**
 * Los sellos decorativos que encabezan cada sección.
 * Son los mismos SVG del HTML original, agrupados aquí para no repetirlos.
 */

export function SealStar() {
  return (
    <svg
      className="seal"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
    >
      <path
        d="M50 4 58 12 69 9 73 20 84 22 83 33 92 41 86 50 92 59 83 67 84 78 73 80 69 91 58 88 50 96 42 88 31 91 27 80 16 78 17 67 8 59 14 50 8 41 17 33 16 22 27 20 31 9 42 12z"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SealChef() {
  return (
    <svg
      className="seal"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
    >
      <path
        d="M50 4 58 12 69 9 73 20 84 22 83 33 92 41 86 50 92 59 83 67 84 78 73 80 69 91 58 88 50 96 42 88 31 91 27 80 16 78 17 67 8 59 14 50 8 41 17 33 16 22 27 20 31 9 42 12z"
        strokeLinejoin="round"
      />
      <path d="M40 50v18h-6a3 3 0 0 1-3-3V53a3 3 0 0 1 3-3z" strokeLinejoin="round" />
      <path
        d="M40 51l9-15c3-5 9-3 8 2l-1 8h11a4 4 0 0 1 4 5l-4 14a5 5 0 0 1-5 4H40z"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SealCloche() {
  return (
    <svg
      className="seal"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
    >
      <path d="M14 70h72" strokeLinecap="round" />
      <path d="M22 70a28 28 0 0 1 56 0" strokeLinejoin="round" />
      <path d="M50 42v-8" strokeLinecap="round" />
      <circle cx="50" cy="30" r="4" />
      <path d="M30 78l40 0c8 0 12 -5 12 -8H18c0 3 4 8 12 8z" strokeLinejoin="round" />
    </svg>
  )
}
