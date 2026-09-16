import type { ThemeColorChoice } from './types'

/**
 * Overrides de color de texto de una sección, guardados como ALIAS del slot
 * del tema ("primary"/"secondary"/"accent") y nunca como hex: si el cliente
 * cambia el tema global, el texto sigue el slot y no queda pegado a un color
 * viejo.
 *
 * Se guarda un solo mapa por sección (`textColors: { heading: "primary" }`)
 * en vez de un campo de color por cada texto — así agregar la función a una
 * sección es una propiedad nueva en su tipo, no una por cada `EditableText`.
 */
export type TextColors = Record<string, ThemeColorChoice>

type Patch = (next: TextColors) => void

/**
 * Nombre legible por clave, para que el sidebar diga "Título principal" en
 * vez de "heading". Una clave sin entrada cae en un nombre genérico — es
 * cosmético, nunca rompe nada.
 */
const LABELS: Record<string, string> = {
  title: 'Título principal',
  heading: 'Título',
  subheading: 'Subtítulo',
  subtitle: 'Antetítulo',
  body: 'Texto',
  lead: 'Texto de entrada',
  watermark: 'Marca de agua',
  copyright: 'Aviso de copyright',
  address: 'Dirección',
  email: 'Correo',
  contactEmail: 'Correo de contacto',
  contactName: 'Nombre de contacto',
  hoursText: 'Horario',
  whatsappNumber: 'Número de WhatsApp',
  phoneDisplay: 'Teléfono visible',
  formTitle: 'Título del formulario',
  formSubmitLabel: 'Botón del formulario',
  orText: 'Texto separador',
  people: 'Etiqueta de personas',
  // Campos de elementos de array: la clave es "items.<id>.name", así que se
  // resuelve por el ÚLTIMO segmento.
  name: 'Nombre',
  price: 'Precio',
  description: 'Descripción',
  question: 'Pregunta',
  answer: 'Respuesta',
  caption: 'Pie de foto',
  paragraph: 'Párrafo',
  days: 'Días',
  hours: 'Horas',
  tag: 'Etiqueta',
}

export function textColorLabel(key: string): string {
  // Las claves de elementos de array vienen como "items.<id>.name": lo que
  // nombra el campo es el último segmento.
  const leaf = key.split('.').pop() ?? key
  return LABELS[key] ?? LABELS[leaf] ?? 'Texto'
}

/**
 * Devuelve un helper para cablear `EditableText` en una sección:
 *
 *   const color = textColorProps(data.textColors, (tc) => patch({ textColors: tc }))
 *   <EditableText {...color('heading')} … />
 *
 * La clave es libre pero tiene que ser estable: es lo que queda guardado.
 */
export function textColorProps(textColors: TextColors | undefined, patch: Patch) {
  return (key: string) => ({
    label: textColorLabel(key),
    textColor: textColors?.[key],
    onTextColorChange: (next: ThemeColorChoice | undefined) => {
      const current = textColors ?? {}
      if (next) {
        patch({ ...current, [key]: next })
        return
      }
      // Quitar el override borra la clave en vez de dejarla en undefined:
      // así el JSON guardado no acumula basura.
      const { [key]: _removed, ...rest } = current
      void _removed
      patch(rest)
    },
  })
}

// ---------------------------------------------------------------------------
// Tamaño de letra y grosor por texto (Fase E). Mismo criterio que los colores:
// un solo mapa por sección, clave estable por texto.
// ---------------------------------------------------------------------------

/** Tamaño en px por vista: `d` escritorio, `m` móvil. */
export type TextSize = { d?: number; m?: number }
export type TextSizes = Record<string, TextSize>
export type TextWeights = Record<string, number>

/** Escalas ofrecidas en el sidebar. El móvil usa valores más chicos: el mismo
 *  px se ve mucho más grande en una pantalla de 390px. */
export const SIZE_STEPS = ['XS', 'S', 'M', 'L', 'XL'] as const
export type SizeStep = (typeof SIZE_STEPS)[number]

export const SIZE_PX: Record<'d' | 'm', Record<SizeStep, number>> = {
  d: { XS: 14, S: 18, M: 22, L: 28, XL: 40 },
  m: { XS: 12, S: 14, M: 16, L: 20, XL: 28 },
}

export const WEIGHT_STEPS: { label: string; value: number }[] = [
  { label: 'Ligero', value: 300 },
  { label: 'Normal', value: 400 },
  { label: 'Semibold', value: 600 },
  { label: 'Negrita', value: 700 },
]

type SizePatch = (next: { textSizes?: TextSizes; textWeights?: TextWeights }) => void

/**
 * Helper gemelo de `textColorProps` para tamaño y grosor:
 *
 *   const sizeWeight = textSizeProps(data.textSizes, data.textWeights, patch)
 *   <EditableText … {...color('heading')} {...sizeWeight('heading')} />
 */
export function textSizeProps(
  textSizes: TextSizes | undefined,
  textWeights: TextWeights | undefined,
  patch: SizePatch
) {
  return (key: string) => ({
    fontSize: textSizes?.[key],
    fontWeight: textWeights?.[key],

    onFontSizeChange: (next: TextSize | undefined) => {
      const current = textSizes ?? {}
      // Sin tamaño para ninguna vista se borra la clave entera, en vez de
      // dejar `{}` acumulando basura en el JSON.
      if (!next || (next.d == null && next.m == null)) {
        const { [key]: _drop, ...rest } = current
        void _drop
        patch({ textSizes: rest })
        return
      }
      patch({ textSizes: { ...current, [key]: next } })
    },

    onFontWeightChange: (next: number | undefined) => {
      const current = textWeights ?? {}
      if (next == null) {
        const { [key]: _drop, ...rest } = current
        void _drop
        patch({ textWeights: rest })
        return
      }
      patch({ textWeights: { ...current, [key]: next } })
    },
  })
}
