# La Gloria Restaurante — Web

Web del restaurante hecha con **Next.js**. Es **solo la web pública**: se ha
quitado el panel de administración (Sanity Studio) del proyecto original.

El contenido —textos, platos, precios, fotos— vive en un único archivo:
[`content/site.ts`](content/site.ts). Para cambiar algo, edítalo y vuelve a
desplegar.

## Puesta en marcha

```bash
npm install
npm run dev
```

- Web: <http://localhost:3000>
- Página de bebidas: <http://localhost:3000/bebidas>

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Sirve el build |

## Estructura

```
app/
  layout.tsx              Raíz: fuentes (next/font) y <html>
  (site)/
    layout.tsx            Carga globals.css y los metadatos
    page.tsx              Portada: compone todas las secciones
    bebidas/page.tsx      Página de bebidas
  globals.css             CSS del diseño original, portado tal cual
components/               Un componente por sección
content/site.ts           Todo el contenido editable de la web
public/
  frames/                 126 fotogramas de la animación de scroll
  videos/                 Vídeos de fondo
  images/  dishes/         Fotos
```

## Notas

- **Animación por scroll**: 126 fotogramas dibujados en `<canvas>`
  (`components/FrameScroll.tsx`), nunca *scrubbing* de `<video>`.
- **Asistente de chat**: el botón dorado abajo a la izquierda habla con un
  agente externo (n8n). El endpoint está en `content/site.ts`
  (`siteSettings.chatWebhookUrl`); vacíalo para ocultar el chat.
- **Reservas**: el formulario sigue funcionando por `mailto:` como en la web
  original — abre el gestor de correo del visitante con el mensaje escrito.
- Todas las imágenes y vídeos son archivos locales; no hay CDN externo.

## Despliegue

Cualquier plataforma que soporte Next.js. En Vercel: importar el repo, sin
variables de entorno. Cada push a `main` despliega solo.
