'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { X, Save, Loader2, Barcode as BarcodeIcon } from 'lucide-react'
import { generateShortBarcode } from '@/utils/barcode'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  product?: any // If provided, we are editing
}

export default function ProductModal({ isOpen, onClose, onSuccess, product }: ProductModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    barcode: product?.barcode || generateShortBarcode(),
    unit: product?.unit || 'unidad'
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (product) {
        // Update
        const { error: err } = await supabase
          .from('products')
          .update(formData)
          .eq('id', product.id)
        if (err) throw err
      } else {
        // Create
        const { error: err } = await supabase
          .from('products')
          .insert(formData)
        if (err) throw err
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <h3 className="text-xl font-bold">{product ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Nombre del Producto</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400"
                placeholder="Pistón Hidráulico..."
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Código de Barra (6 caracteres)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value.toUpperCase() })}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, barcode: generateShortBarcode() })}
                  className="bg-slate-100 p-3 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"
                  title="Regenerar código"
                >
                  <BarcodeIcon size={20} />
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Unidad de Medida</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
              >
                <option value="unidad">Unidad</option>
                <option value="litro">Litro</option>
                <option value="kg">Kilogramo</option>
                <option value="set">Set / Kit</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Descripción (Opcional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none h-24 text-slate-900 placeholder:text-slate-400"
                placeholder="Uso en motor auxiliar babor..."
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {product ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
