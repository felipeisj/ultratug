'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Search, 
  MinusCircle, 
  Warehouse, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRightLeft
} from 'lucide-react'
import Link from 'next/link'

export default function NuevoRetiroPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Options
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [stockItems, setStockItems] = useState<any[]>([])
  
  // Form State
  const [formData, setFormData] = useState({
    type: 'RETIRO' as 'RETIRO' | 'TRASLADO',
    stock_id: '',
    to_warehouse_id: '',
    quantity: 1,
    sent_by: '',
    notes: ''
  })

  const [selectedStock, setSelectedStock] = useState<any>(null)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    const { data: whData } = await supabase.from('warehouses').select('*, ships(name)').order('name')
    const { data: profData } = await supabase.from('profiles').select('*').order('full_name')
    const { data: stockData } = await supabase
      .from('stock')
      .select('*, products(*), warehouses(*, ships(*))')
      .gt('quantity', 0)
    
    if (whData) setWarehouses(whData)
    if (profData) setProfiles(profData)
    if (stockData) setStockItems(stockData)
  }

  const handleStockSelect = (id: string) => {
    const stock = stockItems.find(s => s.id === id)
    setSelectedStock(stock)
    setFormData({ ...formData, stock_id: id, quantity: 1 })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStock) return
    if (formData.quantity > selectedStock.quantity) {
      setError(`No hay suficiente stock. Disponible: ${selectedStock.quantity}`)
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // 1. Create Movement
      const { error: movErr } = await supabase.from('movements').insert({
        type: formData.type,
        product_id: selectedStock.product_id,
        from_warehouse_id: selectedStock.warehouse_id,
        to_warehouse_id: formData.type === 'TRASLADO' ? formData.to_warehouse_id : null,
        quantity: formData.quantity,
        sent_by: formData.sent_by || null,
        notes: formData.notes
      })
      if (movErr) throw movErr

      // 2. Update Source Stock
      const { error: srcErr } = await supabase
        .from('stock')
        .update({ 
          quantity: selectedStock.quantity - formData.quantity, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', selectedStock.id)
      if (srcErr) throw srcErr

      // 3. Update Destination Stock (if Traslado)
      if (formData.type === 'TRASLADO') {
        const { data: destStock } = await supabase
          .from('stock')
          .select('*')
          .eq('product_id', selectedStock.product_id)
          .eq('warehouse_id', formData.to_warehouse_id)
          .single()

        if (destStock) {
          await supabase
            .from('stock')
            .update({ quantity: destStock.quantity + formData.quantity, updated_at: new Date().toISOString() })
            .eq('id', destStock.id)
        } else {
          await supabase
            .from('stock')
            .insert({
              product_id: selectedStock.product_id,
              warehouse_id: formData.to_warehouse_id,
              quantity: formData.quantity
            })
        }
      }

      router.push('/retiros')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <Link 
        href="/retiros" 
        className="inline-flex items-center text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={18} className="mr-2" /> Volver a lista
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className={`p-6 text-white flex justify-between items-center ${formData.type === 'TRASLADO' ? 'bg-blue-900' : 'bg-orange-800'}`}>
          <div>
            <h2 className="text-2xl font-bold">{formData.type === 'TRASLADO' ? 'Nuevo Traslado' : 'Nuevo Retiro'}</h2>
            <p className="text-slate-300 text-sm">Gestionar salida o movimiento de material</p>
          </div>
          {formData.type === 'TRASLADO' ? <ArrowRightLeft size={32} className="opacity-40" /> : <MinusCircle size={32} className="opacity-40" />}
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Movement Type */}
          <div className="flex gap-4 p-1 bg-slate-100 rounded-xl max-w-sm">
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'RETIRO'})}
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${formData.type === 'RETIRO' ? 'bg-white shadow text-orange-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              RETIRO (Baja)
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'TRASLADO'})}
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${formData.type === 'TRASLADO' ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              TRASLADO
            </button>
          </div>

          {/* Product Selection from Stock */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b pb-2">1. Seleccionar Producto y Origen</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">Producto en Stock</label>
              <select
                required
                value={formData.stock_id}
                onChange={(e) => handleStockSelect(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all shadow-sm"
              >
                <option value="">Buscar en el inventario...</option>
                {stockItems.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.products?.name} (Stock: {s.quantity} {s.products?.unit}s) — {s.warehouses?.ships?.name} / {s.warehouses?.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedStock && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Barcode</p>
                  <p className="text-sm font-mono text-slate-700">{selectedStock.products?.barcode}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Barco</p>
                  <p className="text-sm font-medium text-slate-700">{selectedStock.warehouses?.ships?.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Pañol</p>
                  <p className="text-sm font-medium text-slate-700">{selectedStock.warehouses?.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-orange-600">Stock Actual</p>
                  <p className="text-sm font-bold text-orange-700">{selectedStock.quantity} {selectedStock.products?.unit}s</p>
                </div>
              </div>
            )}
          </section>

          {/* Quantity and Destination */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b pb-2">2. Cantidad y Destino</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Cantidad a {formData.type === 'TRASLADO' ? 'mover' : 'retirar'}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    max={selectedStock?.quantity}
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value)})}
                    className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold"
                  />
                  <span className="text-slate-400 font-medium">{selectedStock?.products?.unit}s</span>
                </div>
              </div>

              {formData.type === 'TRASLADO' && (
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Pañol de Destino</label>
                  <select
                    required
                    value={formData.to_warehouse_id}
                    onChange={(e) => setFormData({...formData, to_warehouse_id: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
                  >
                    <option value="">Seleccionar pañol destino...</option>
                    {warehouses.filter(w => w.id !== selectedStock?.warehouse_id).map(w => (
                      <option key={w.id} value={w.id}>{w.ships?.name} - {w.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 block mb-1">Autorizado por</label>
                <select
                  required
                  value={formData.sent_by}
                  onChange={(e) => setFormData({...formData, sent_by: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
                >
                  <option value="">Quién autoriza el movimiento?</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 block mb-1">Notas / Justificación (Opcional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none h-24"
                  placeholder="Repuesto para motor principal babor..."
                />
              </div>
            </div>
          </section>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="pt-6">
            <button
              type="submit"
              disabled={submitting || !selectedStock}
              className={`w-full text-white font-bold py-4 px-6 rounded-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 ${
                formData.type === 'TRASLADO' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Procesando...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} /> Finalizar {formData.type === 'TRASLADO' ? 'Traslado' : 'Retiro'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
