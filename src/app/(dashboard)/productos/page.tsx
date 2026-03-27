'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Search, Package, Printer, Barcode as BarcodeIcon, Loader2, Download } from 'lucide-react'
import Barcode from 'react-barcode'
import { jsPDF } from 'jspdf'

export default function ProductosPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('name')
    if (data) setProducts(data)
    setLoading(false)
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.barcode.toLowerCase().includes(search.toLowerCase())
  )

  const printLabel = (product: any) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [50, 25] // Standard small sticker size
    })

    doc.setFontSize(8)
    doc.text('ULTRATUG', 2, 5)
    doc.setFontSize(6)
    doc.text(product.name.substring(0, 30), 2, 8)
    
    // We would need to convert the barcode SVG to image for jspdf
    // For now, let's just open the print dialog or similar
    // Simplified version: Just a notification or a new window
    window.print()
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Catálogo de Productos</h2>
          <p className="text-slate-500 mt-2">Maestro de repuestos y materiales registrados.</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full bg-white p-10 rounded-xl border border-dashed border-slate-300 text-center text-slate-400 italic">
            No hay productos registrados.
          </div>
        ) : (
          filteredProducts.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-100 p-2 rounded-lg text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Package size={24} />
                </div>
                <button 
                  onClick={() => printLabel(p)}
                  className="text-slate-300 hover:text-blue-600 transition-colors"
                  title="Imprimir Etiqueta"
                >
                  <Printer size={20} />
                </button>
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-1 leading-tight">{p.name}</h4>
              <p className="text-xs text-slate-500 mb-4 h-8 line-clamp-2">{p.description || 'Sin descripción'}</p>
              
              <div className="bg-slate-50 p-3 rounded-lg flex flex-col items-center border border-slate-100">
                <Barcode 
                  value={p.barcode} 
                  width={1} 
                  height={30} 
                  fontSize={10}
                  background="transparent"
                />
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{p.barcode}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
