'use client'

import { EditableImage } from '@/components/editable/EditableImage'
import { EditableText } from '@/components/editable/EditableText'
import { newButtonId } from '@/lib/buttons'
import type { PhotoGalleryData, PhotoGalleryItem } from '@/lib/types'

import { SectionShell } from './SectionShell'

export function PhotoGallery({
  id,
  data,
  edit,
  onChange,
}: {
  id: string
  data: PhotoGalleryData
  edit?: boolean
  onChange?: (next: PhotoGalleryData) => void
}) {
  function patch(next: Partial<PhotoGalleryData>) {
    onChange?.({ ...data, ...next })
  }

  function updatePhoto(photoId: string, next: Partial<PhotoGalleryItem>) {
    patch({ photos: data.photos.map((p) => (p.id === photoId ? { ...p, ...next } : p)) })
  }

  return (
    <SectionShell
      id={id}
      subtitle={data.subtitle}
      heading={data.heading}
      backgroundColor={data.backgroundColor}
      edit={edit}
      onSubtitleChange={(v) => patch({ subtitle: v })}
      onHeadingChange={(v) => patch({ heading: v })}
      onBackgroundColorChange={(v) => patch({ backgroundColor: v })}
    >
      <div className="grid grid-cols-2 gap-5 text-left sm:grid-cols-3">
        {data.photos.map((photo) => (
          <div key={photo.id} className="relative">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg">
              <EditableImage
                edit={!!edit}
                fill
                src={photo.image.url}
                alt={photo.image.alt}
                aspectRatio={1}
                imgClassName="h-full w-full object-cover"
                focalX={photo.image.focalX}
                focalY={photo.image.focalY}
                onChange={(url) => updatePhoto(photo.id, { image: { ...photo.image, url } })}
                onFocalChange={(x, y) => updatePhoto(photo.id, { image: { ...photo.image, focalX: x, focalY: y } })}
              />
            </div>
            <p className="mt-1.5 text-xs opacity-70" style={{ color: 'var(--color-accent)' }}>
              <EditableText as="span" edit={edit} value={photo.caption} onChange={(v) => updatePhoto(photo.id, { caption: v })} />
            </p>
            {edit && (
              <button
                type="button"
                onClick={() => patch({ photos: data.photos.filter((p) => p.id !== photo.id) })}
                className="text-xs text-red-600 hover:underline"
              >
                Eliminar foto
              </button>
            )}
          </div>
        ))}
      </div>

      {edit && (
        <button
          type="button"
          onClick={() =>
            patch({ photos: [...data.photos, { id: newButtonId(), image: { url: '' }, caption: '' }] })
          }
          className="mt-6 rounded-md border border-dashed px-4 py-2 text-sm"
          style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
        >
          + Añadir foto
        </button>
      )}
    </SectionShell>
  )
}
