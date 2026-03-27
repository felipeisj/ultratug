'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { generateShortBarcode } from '@/utils/barcode'
import BarcodeScanner from '@/components/BarcodeScanner'
import { 
  ArrowLeft, 
  Search, 
  Package, 
  Warehouse, 
  Barcode as BarcodeIcon,
  CheckCircle2,
  AlertCircle,
  Printer,
  Loader2,
  Plus,
  Camera
} from 'lucide-react'
import Link from 'next/link'
import Barcode from 'react-barcode'

export default function NuevoIngresoPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  
  const handleScan = (code: string) => {
    handleProductSearch(code)
  }
  
  // Options
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  
  // Form State
  const [productSearch, setProductSearch] = useState('')
  const [foundProducts, setFoundProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    barcode: generateShortBarcode(),
    warehouse_id: '',
    quantity: 1,
    received_by: '',
    unit: 'unidad'
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    const { data: whData } = await supabase.from('warehouses').select('*, ships(name)').order('name')
    const { data: profData } = await supabase.from('profiles').select('*').order('full_name')
    if (whData) setWarehouses(whData)
    if (profData) setProfiles(profData)
  }

  const handleProductSearch = async (val: string) => {
    setProductSearch(val)
    if (val.length < 3) {
      setFoundProducts([])
      return
    }

    const { data } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${val}%,barcode.eq.${val}`)
      .limit(5)
    
    if (data) setFoundProducts(data)
  }

  const selectProduct = (p: any) => {
    setSelectedProduct(p)
    setFormData({
      ...formData,
      name: p.name,
      description: p.description || '',
      barcode: p.barcode,
      unit: p.unit
    })
    setFoundProducts([])
    setProductSearch('')
  }

  const generateBarcode = () => {
    const code = generateShortBarcode()
    setFormData({ ...formData, barcode: code })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      let productId = selectedProduct?.id

      // 1. If new product, create it
      if (!productId) {
        const { data: newProd, error: prodErr } = await supabase
          .from('products')
          .insert({
            name: formData.name,
            description: formData.description,
            barcode: formData.barcode,
            unit: formData.unit
          })
          .select()
          .single()
        
        if (prodErr) throw prodErr
        productId = newProd.id
      }

      // 2. Create Movement
      const { error: movErr } = await supabase.from('movements').insert({
        type: 'INGRESO',
        product_id: productId,
        to_warehouse_id: formData.warehouse_id,
        quantity: formData.quantity,
        received_by: formData.received_by || null,
        notes: 'Ingreso manual'
      })
      if (movErr) throw movErr

      router.push('/ingresos')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <Link 
        href="/ingresos" 
        className="inline-flex items-center text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={18} className="mr-2" /> Volver a lista
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Nuevo Ingreso</h2>
            <p className="text-slate-400 text-sm">Registrar entrada de material a bodega</p>
          </div>
          <Package size={32} className="text-blue-400 opacity-50" />
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Product Search / New */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 border-b pb-2">1. Identificación del Producto</h3>
                        {!selectedProduct ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar producto existente por nombre o código..."
                      value={productSearch}
                      onChange={(e) => handleProductSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="bg-slate-900 text-white p-4 rounded-xl hover:bg-black transition-all shadow-lg active:scale-95"
                    title="Escanear con cámara"
                  >
                    <Camera size={20} />
                  </button>
                </div>
                
                {foundProducts.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
                    {foundProducts.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectProduct(p)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between transition-colors border-b last:border-0"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.barcode}</p>
                        </div>
                        <Plus size={16} className="text-blue-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg text-white">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-blue-900">{selectedProduct.name}</p>
                    <p className="text-xs text-blue-700">Producto seleccionado (ID: {selectedProduct.barcode})</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedProduct(null)}
                  className="text-xs font-bold text-blue-600 uppercase hover:underline"
                >
                  Cambiar
                </button>
              </div>
            )}

            {!selectedProduct && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 mt-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Pistón Motor Auxiliar..."
                  />
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Código de Barra / Sticker</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={formData.barcode}
                      onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                      className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-slate-900 placeholder:text-slate-400"
                      placeholder="UT-XXXXXX"
                    />
                    <button 
                      type="button"
                      onClick={generateBarcode}
                      className="bg-slate-100 p-2 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
                      title="Generar código"
                    >
                      <BarcodeIcon size={20} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Unidad</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="unidad">Unidad</option>
                    <option value="litro">Litro</option>
                    <option value="kg">Kilogramo</option>
                    <option value="set">Set / Kit</option>
                  </select>
                </div>
              </div>
            )}
          </section>

          {/* Barcode Preview */}
          {formData.barcode && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 text-center">
              <p className="text-xs font-bold uppercase text-slate-400 mb-4">Vista Previa Etiqueta</p>
              <div className="bg-white p-4 inline-block rounded shadow-sm border border-slate-200">
                <p className="text-[10px] font-bold text-slate-800 uppercase mb-1">{formData.name || 'Producto'}</p>
                <Barcode 
                  value={formData.barcode} 
                  width={1.5} 
                  height={50} 
                  fontSize={14}
                  background="transparent"
                />
              </div>
              <div className="mt-4">
                <button type="button" className="text-blue-600 text-xs font-bold flex items-center justify-center gap-2 mx-auto hover:underline">
                  <Printer size={14} /> Imprimir Sticker (vía jspdf próximamente)
                </button>
              </div>
            </div>
          )}

          {/* Destination & Quantity */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 border-b pb-2">2. Destino y Cantidad</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Pañol de Destino</label>
                <select
                  required
                  value={formData.warehouse_id}
                  onChange={(e) => setFormData({...formData, warehouse_id: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                >
                  <option value="">Seleccionar pañol...</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.ships?.name} - {w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Cantidad Ingresada</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 block mb-1">Recibido por (Firma)</label>
                <select
                  required
                  value={formData.received_by}
                  onChange={(e) => setFormData({...formData, received_by: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">Quién recibe?</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
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
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Registrando ingreso...
                </>
              ) : (
                'Finalizar y Registrar Ingreso'
              )}
            </button>
          </div>
        </form>
      </div>
      <BarcodeScanner 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScan}
      />
    </div>
  )
}
