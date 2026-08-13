import { useState } from 'react'

interface Product {
  id: number; name: string; description: string; price: string; image: string | null
}

const initialProducts: Product[] = [
  { id: 1, name: 'Premium Package', description: 'Full access to all features including analytics, custom branding, and priority support.', price: '£49.99', image: null },
  { id: 2, name: 'Starter Kit', description: 'Basic vCard with standard templates and essential features.', price: '£19.99', image: null },
]

export default function VCardEditProductsTab() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', description: '', price: '' })

  const startAdd = () => { setEditingId(0); setForm({ name: '', description: '', price: '' }) }
  const startEdit = (p: Product) => { setEditingId(p.id); setForm({ name: p.name, description: p.description, price: p.price }) }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editingId === 0) {
      setProducts([...products, { id: Date.now(), ...form, image: null }])
    } else {
      setProducts(products.map((p) => p.id === editingId ? { ...p, ...form } : p))
    }
    setEditingId(null)
  }

  const handleDelete = (id: number) => { setProducts(products.filter((p) => p.id !== id)) }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Products</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add products you want to showcase on your vCard.</p>
        </div>
        <button onClick={startAdd} className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Product
        </button>
      </div>

      {/* Add/Edit Form */}
      {editingId !== null && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 mb-5 border border-gray-200 dark:border-gray-600">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{editingId === 0 ? 'Add New Product' : 'Edit Product'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
            <input type="text" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="£0.00" className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Product description..." className="w-full mt-3 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
          <div className="flex gap-2 mt-3">
            <button onClick={handleSave} className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">Save</button>
            <button onClick={() => setEditingId(null)} className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Products List */}
      {products.length ? (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                  <p className="text-xs text-gray-400 max-w-md truncate">{p.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-orange-600">{p.price}</span>
                <button onClick={() => startEdit(p)} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <svg className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">No products yet. Click "Add Product" to get started.</p>
        </div>
      )}
    </div>
  )
}
