import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { userService } from '../../../services/user'
import type { Service } from '../../../types'

interface Props { vcardId: number }

export default function VCardEditServicesTab({ vcardId }: Props) {
  const { t } = useTranslation()
  const [items, setItems] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Service | null>(null)
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({ name: '', description: '', price: 0 })

  const fetch = () => {
    setLoading(true)
    userService.getServices(vcardId).then(setItems).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [vcardId])

  const startEdit = (item?: Service) => {
    if (item) { setEditing(item); setForm({ name: item.name, description: item.description || '', price: item.price || 0 }) }
    else { setEditing({ id: 0, vcard_id: vcardId } as Service); setForm({ name: '', description: '', price: 0 }) }
  }

  const cancelEdit = () => { setEditing(null); setForm({ name: '', description: '', price: 0 }) }

  const handleSave = async () => {
    setMessage('')
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('description', form.description)
      fd.append('price', String(form.price))
      if (fileRef.current?.files?.[0]) fd.append('image', fileRef.current.files[0])
      if (editing?.id) await userService.updateService(vcardId, editing.id, fd)
      else await userService.createService(vcardId, fd)
      cancelEdit(); fetch(); setMessage(t('user.saved'))
    } catch {}
  }

  const handleDelete = async (id: number) => {
    if (!confirm(t('user.confirm_delete'))) return
    try { await userService.deleteService(vcardId, id); fetch() } catch {}
  }

  if (loading) return <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{t('user.tab_services')}</h2>
        {!editing && <button onClick={() => startEdit()} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">{t('user.add_service')}</button>}
      </div>
      {message && <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700">{message}</div>}

      {editing && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3 max-w-lg">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('user.service_name')} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t('user.description')} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
          <div className="flex gap-3 items-center">
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder={t('user.price')} className="w-32 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            <button type="button" onClick={() => fileRef.current?.click()} className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-white">{t('user.image')}</button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">{t('user.save')}</button>
            <button onClick={cancelEdit} className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-white">{t('user.cancel')}</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="border border-gray-100 rounded-lg p-4 flex gap-4">
            {item.image && <img src={item.image} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
              {item.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>}
              {item.price != null && item.price > 0 && <p className="text-sm font-medium text-blue-600 mt-1">£{item.price}</p>}
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => startEdit(item)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">{t('user.edit')}</button>
              <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">{t('user.delete')}</button>
            </div>
          </div>
        ))}
        {!editing && items.length === 0 && <p className="text-sm text-gray-500 col-span-2">{t('user.no_services')}</p>}
      </div>
    </div>
  )
}
