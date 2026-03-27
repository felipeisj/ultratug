'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Search, Package, Printer, Barcode as BarcodeIcon, Loader2, Plus, Edit3, Camera } from 'lucide-react'
import Barcode from 'react-barcode'
import { jsPDF } from 'jspdf'
import ProductModal from '@/components/ProductModal'
import { useSearchParams } from 'next/navigation'
import JsBarcode from 'jsbarcode'

import { Suspense } from 'react'

export default function ProductosPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-slate-300" size={32} />
      </div>
    }>
      <ProductosContent />
    </Suspense>
  )
}

function ProductosContent() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchProducts()
    const querySearch = searchParams.get('search')
    if (querySearch) {
      setSearch(querySearch)
    }
  }, [searchParams])

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
      format: [50, 25]
    })

    // 1. Branding
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text('ULTRATUG INVENTARIO', 25, 5, { align: 'center' })
    
    // 2. Product Name
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    const splitName = doc.splitTextToSize(product.name.toUpperCase(), 45)
    doc.text(splitName, 25, 9, { align: 'center' })

    // 3. Barcode Image
    const canvas = document.createElement('canvas')
    JsBarcode(canvas, product.barcode, {
      format: "CODE128",
      width: 2,
      height: 40,
      displayValue: true,
      fontSize: 20
    })
    
    const imgData = canvas.toDataURL('image/png')
    doc.addImage(imgData, 'PNG', 5, 12, 40, 10)
    
    doc.setFontSize(5)
    doc.text(`ID: ${product.barcode}`, 25, 23, { align: 'center' })
    
    // Open print dialog
    const pdfUrl = doc.output('bloburl')
    window.open(pdfUrl, '_blank')
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 leading-tight">Catálogo de Productos</h2>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Maestro de repuestos y materiales registrados.</p>
        </div>
        <button
          onClick={() => {
            setSelectedProduct(null)
            setIsModalOpen(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 w-full md:w-auto"
        >
          <Plus size={20} /> Nuevo Producto
        </button>
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
          className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm text-slate-900 placeholder:text-slate-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full bg-white p-10 rounded-xl border border-dashed border-slate-300 text-center text-slate-600 italic font-medium">
            No hay productos registrados.
          </div>
        ) : (
          filteredProducts.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-100 p-2 rounded-lg text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Package size={24} />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedProduct(p)
                      setIsModalOpen(true)
                    }}
                    className="text-slate-300 hover:text-blue-600 transition-colors"
                    title="Editar"
                  >
                    <Edit3 size={20} />
                  </button>
                  <button 
                    onClick={() => printLabel(p)}
                    className="text-slate-300 hover:text-blue-600 transition-colors"
                    title="Imprimir Etiqueta"
                  >
                    <Printer size={20} />
                  </button>
                </div>
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

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchProducts} 
        product={selectedProduct}
      />
    </div>
  )
}
