'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, Barcode, Calendar, User, Package } from 'lucide-react'
import Link from 'next/link'

export default function IngresosPage() {
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchIngresos()
  }, [])

  const fetchIngresos = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('movements')
      .select('*, products(name, barcode), warehouses(name, ships(name)), received_by_profile:profiles!movements_received_by_fkey(full_name)')
      .eq('type', 'INGRESO')
      .order('created_at', { ascending: false })
    
    if (data) setMovements(data)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Ingresos de Productos</h2>
          <p className="text-slate-500 mt-2">Registro de entrada de repuestos y materiales a bodega.</p>
        </div>
        <Link 
          href="/ingresos/nuevo"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95"
        >
          <Plus size={20} /> Nuevo Ingreso
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Fecha</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Producto</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Pañol Destino</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">Cant.</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Recibido por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">Cargando ingresos...</td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">No hay ingresos registrados aún.</td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {new Date(m.created_at).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{m.products?.name}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Barcode size={12} /> {m.products?.barcode}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">{m.warehouses?.name}</span>
                        <span className="text-xs text-blue-500">{m.warehouses?.ships?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        +{m.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {m.received_by_profile?.full_name || 'Desconocido'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
