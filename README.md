# La Gloria Familia Unida — Web + Panel Admin

Sitio del restaurante hecho con **Next.js + TypeScript + Tailwind**, construido
según el protocolo web unificado: **el Sitio** (web pública) y **el Panel
Admin** (`/admin`, edición en línea, guardado = commit a GitHub) sobre el
mismo repositorio.

## Contenido

Todo el texto de la web vive en `/content/*.json` — un archivo por sección.
El admin edita estos mismos archivos y los comitea directo a GitHub; Vercel
redespliega solo en cada push a `main`.

```
content/
  siteSettings.json   Marca, navegación, chat
  hero.json            Portada
  about.json           Sección "Sobre nosotros"
  experience.json       Animación por scroll (frames)
  objects3d.json        Objetos 3D navegables
  specials.json         Especiales de la carta
  menu.json             Menú completo
  reservations.json     Sección de reservas
  footer.json            Pie de página
  drinksPage.json        Página /bebidas
```

## Medios

- **Imágenes del armado inicial** (`public/images/`, `public/dishes/`): viven
  en el repo, sirven desde el propio dominio.
- **Video, frames de scroll y objetos 3D (`.glb`)**: en Cloudinary, siempre.
- **Imágenes que se cambien desde `/admin`**: suben a Cloudinary al vuelo
  (comprimidas en el navegador antes de subir) — el binario nunca pasa por
  git.

## Puesta en marcha

```bash
npm install
npm run dev
```

- Web: <http://localhost:3000>
- Bebidas: <http://localhost:3000/bebidas>
- Admin: <http://localhost:3000/admin>

### Variables de entorno (`.env.local` en local, Vercel en producción)

| Variable | Para qué |
|---|---|
| `ADMIN_PASSWORD` | Contraseña de `/admin` |
| `GITHUB_TOKEN` | Token con permiso *Contents: Read and write* sobre este repo |
| `GITHUB_OWNER` | `ISAIASNIAUPARI` |
| `GITHUB_REPO` | `PRUEBA_PROTOCOLO_UNIFICADO` |
| `GITHUB_BRANCH` | `main` |
| `CLOUDINARY_CLOUD_NAME` | Cloud de Cloudinary |
| `CLOUDINARY_API_KEY` | Cloudinary |
| `CLOUDINARY_API_SECRET` | Cloudinary (secreto) |

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Sirve el build |

## Notas

- **Animación por scroll**: frames en `<canvas>` (`components/FrameScroll.tsx`),
  servidos desde Cloudinary — nunca *scrubbing* de `<video>`.
- **Objetos 3D**: `<model-viewer>`, marco fijo, giro lento automático, sin
  zoom/pan — modelos `.glb` en Cloudinary.
- **Asistente de chat**: el botón dorado abajo a la izquierda habla con un
  agente externo (n8n). El endpoint está en `content/siteSettings.json`
  (`chatWebhookUrl`); vacíalo para ocultar el chat.
- **Reservas**: el formulario sigue funcionando por `mailto:` — abre el
  gestor de correo del visitante con el mensaje escrito.

## Despliegue

Proyecto de Vercel enlazado a este repo (`create_git_project`). Cada push a
`main` (manual o desde `/admin`) despliega solo.
