import type { CtaBannerData, DynamicSectionType, FaqData, MenuGridData, PhotoGalleryData, TextBlockData } from '@/lib/types'

import { CtaBanner } from './CtaBanner'
import { Faq } from './Faq'
import { MenuGrid } from './MenuGrid'
import { PhotoGallery } from './PhotoGallery'
import { TextBlock } from './TextBlock'

export function DynamicSection({
  id,
  type,
  data,
  edit,
  onChange,
}: {
  id: string
  type: DynamicSectionType
  data: unknown
  edit?: boolean
  onChange?: (next: unknown) => void
}) {
  switch (type) {
    case 'cta-banner':
      return <CtaBanner id={id} data={data as CtaBannerData} edit={edit} onChange={onChange as (n: CtaBannerData) => void} />
    case 'menu-grid':
      return <MenuGrid id={id} data={data as MenuGridData} edit={edit} onChange={onChange as (n: MenuGridData) => void} />
    case 'text-block':
      return <TextBlock id={id} data={data as TextBlockData} edit={edit} onChange={onChange as (n: TextBlockData) => void} />
    case 'photo-gallery':
      return <PhotoGallery id={id} data={data as PhotoGalleryData} edit={edit} onChange={onChange as (n: PhotoGalleryData) => void} />
    case 'faq':
      return <Faq id={id} data={data as FaqData} edit={edit} onChange={onChange as (n: FaqData) => void} />
    default:
      return null
  }
}
