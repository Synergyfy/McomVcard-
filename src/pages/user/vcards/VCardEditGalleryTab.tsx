import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { userService } from '../../../services/user'
import type { Gallery } from '../../../types'

interface Props { vcardId: number }

export default function VCardEditGalleryTab({ vcardId }: Props) {
  const { t } = useTranslation()
  const [items, setItems] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)

  const fetch = () => {
    setLoading(true)
    userService.getGallery(vcardId).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [vcardId])

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('image', file)
    try { await userService.createGalleryImage(vcardId, fd); fetch() } catch {}
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDelete = async (id: number) => {
    if (!confirm(t('user.confirm_delete'))) return
    try { await userService.deleteGalleryImage(vcardId, id); fetch() } catch {}
  }

  if (loading) return <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{t('user.tab_gallery')}</h2>
        <label className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 cursor-pointer">
          {t('user.upload_image')}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="relative group rounded-lg overflow-hidden border border-gray-100">
            <img src={item.image} alt={item.title || ''} className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-500 col-span-full">{t('user.no_gallery')}</p>}
      </div>
    </div>
  )
}
