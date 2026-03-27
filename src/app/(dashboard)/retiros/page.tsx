'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, MinusCircle, ArrowRightLeft, Calendar, User, Package, Warehouse, Barcode } from 'lucide-react'
import Link from 'next/link'

export default function RetirosPage() {
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchRetiros()
  }, [])

  const fetchRetiros = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('movements')
      .select('*, products(name, barcode), from:warehouses!movements_from_warehouse_id_fkey(name, ships(name)), to:warehouses!movements_to_warehouse_id_fkey(name, ships(name)), sent_by_profile:profiles!movements_sent_by_fkey(full_name)')
      .in('type', ['RETIRO', 'TRASLADO'])
      .order('created_at', { ascending: false })
    
    if (data) setMovements(data)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 leading-tight">Retiros y Traslados</h2>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Seguimiento de salida y movimiento interno de productos.</p>
        </div>
        <Link 
          href="/retiros/nuevo"
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 w-full md:w-auto"
        >
          <Plus size={20} /> Nuevo Retiro / Traslado
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-1 md:mx-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Fecha</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Tipo</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Producto</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Origen → Destino</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">Cant.</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Autorizado por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500 italic font-medium">Cargando movimientos...</td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500 italic font-medium">No hay retiros registrados aún.</td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors text-sm">
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {new Date(m.created_at).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        m.type === 'RETIRO' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{m.products?.name}</span>
                        <span className="text-[10px] text-slate-400">#{m.products?.barcode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="text-slate-700 font-medium">{m.from?.name}</span>
                          <span className="text-[10px] text-slate-400">{m.from?.ships?.name}</span>
                        </div>
                        <ArrowRightLeft size={14} className="text-slate-300" />
                        <div className="flex flex-col">
                          <span className="text-slate-700 font-medium">{m.to?.name || 'CONSUMO'}</span>
                          <span className="text-[10px] text-slate-400">{m.to?.ships?.name || 'Baja / Uso'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900">
                      -{m.quantity}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {m.sent_by_profile?.full_name || 'Desconocido'}
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
