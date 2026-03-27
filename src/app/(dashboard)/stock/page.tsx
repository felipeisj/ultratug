'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  Search, 
  Warehouse, 
  Ship, 
  AlertTriangle,
  ArrowRightLeft,
  History,
  LayoutGrid,
  Loader2
} from 'lucide-react'

export default function StockPage() {
  const [stock, setStock] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterShip, setFilterShip] = useState('')
  const [search, setSearch] = useState('')
  
  const supabase = createClient()

  useEffect(() => {
    fetchStock()
  }, [])

  const fetchStock = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('stock')
      .select('*, products(*), warehouses(*, ships(*))')
      .order('quantity', { ascending: false })
    
    if (data) setStock(data)
    setLoading(false)
  }

  const filteredStock = stock.filter(item => {
    const matchesShip = !filterShip || item.warehouses?.ships?.id === filterShip
    const matchesSearch = !search || 
      item.products?.name.toLowerCase().includes(search.toLowerCase()) ||
      item.products?.barcode.toLowerCase().includes(search.toLowerCase())
    return matchesShip && matchesSearch
  })

  // Get unique ships for filter
  const ships = Array.from(new Set(stock.map(s => s.warehouses?.ships).filter(Boolean).map(ship => JSON.stringify(ship)))).map(s => JSON.parse(s))

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 leading-tight">Stock / Bodega</h2>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Consulta de inventario disponible en tiempo real.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all focus-within:shadow-md">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o código de barra..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Ship size={18} className="text-slate-400" />
          <select
            value={filterShip}
            onChange={(e) => setFilterShip(e.target.value)}
            className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900"
          >
            <option value="">Todos los Barcos</option>
            {ships.map((ship: any) => (
              <option key={ship.id} value={ship.id}>{ship.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-slate-500">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="italic font-medium">Cargando inventario...</p>
          </div>
        ) : filteredStock.length === 0 ? (
          <div className="bg-white p-20 rounded-xl border border-dashed border-slate-300 text-center text-slate-600">
            <LayoutGrid size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-bold">No se encontraron productos en stock.</p>
            <p className="text-sm font-medium">Intenta ajustar los filtros o registra un nuevo ingreso.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto -mx-1 md:mx-0">
              <table className="w-full text-left border-collapse min-w-[600px] md:min-w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Barco / Pañol</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Producto</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">Stock Actual</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStock.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-blue-600">{item.warehouses?.ships?.name}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Warehouse size={12} /> {item.warehouses?.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{item.products?.name}</span>
                          <span className="text-xs text-slate-400 font-mono">#{item.products?.barcode}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`text-lg font-bold ${item.quantity < 5 ? 'text-red-600' : 'text-slate-900'}`}>
                            {item.quantity}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{item.products?.unit}s</span>
                        </div>
                        {item.quantity < 5 && (
                          <div className="flex items-center justify-center gap-1 mt-1 text-[10px] font-bold text-red-500 uppercase">
                            <AlertTriangle size={10} /> Stock Bajo
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Ver Historial">
                            <History size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Mover / Retirar">
                            <ArrowRightLeft size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
