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
 * Devuelve un helper para cablear `EditableText` en una sección:
 *
 *   const color = textColorProps(data.textColors, (tc) => patch({ textColors: tc }))
 *   <EditableText {...color('heading')} … />
 *
 * La clave es libre pero tiene que ser estable: es lo que queda guardado.
 */
export function textColorProps(textColors: TextColors | undefined, patch: Patch) {
  return (key: string) => ({
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
