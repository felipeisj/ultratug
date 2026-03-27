'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Ship, Package, History, AlertTriangle, Loader2, Plus, Search, Camera } from 'lucide-react'
import Link from 'next/link'
import ProductModal from '@/components/ProductModal'
import BarcodeScanner from '@/components/BarcodeScanner'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [stats, setStats] = useState({
    ships: 0,
    warehouses: 0,
    movementsToday: 0,
    lowStock: 0
  })
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleScan = (code: string) => {
    router.push(`/productos?search=${code}`)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // 1. Ships count
      const { count: shipsCount } = await supabase.from('ships').select('id', { count: 'exact', head: true })
      
      // 2. Warehouses count
      const { count: whCount } = await supabase.from('warehouses').select('id', { count: 'exact', head: true })
      
      // 3. Movements today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: movCount } = await supabase
        .from('movements')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())
      
      // 4. Low stock count
      const { count: lowCount } = await supabase
        .from('stock')
        .select('id', { count: 'exact', head: true })
        .lt('quantity', 5)

      setStats({
        ships: shipsCount || 0,
        warehouses: whCount || 0,
        movementsToday: movCount || 0,
        lowStock: lowCount || 0
      })
    } catch (err) {
      console.error("Error fetching stats:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    )
  }


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 leading-tight">Dashboard</h2>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Visión general del inventario en la flota Ultratug.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 md:flex gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="bg-slate-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <Camera size={20} /> <span className="sm:hidden lg:inline">Escanear</span>
            <span className="hidden sm:inline lg:hidden">Scan</span>
          </button>
          <Link
            href="/productos"
            className="bg-white border border-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50 transition-all text-center"
          >
            <Search size={20} /> <span className="sm:hidden lg:inline">Buscar Producto</span>
            <span className="hidden sm:inline lg:hidden">Buscar</span>
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <Plus size={20} /> <span className="sm:hidden lg:inline">Nuevo Producto</span>
            <span className="hidden sm:inline lg:hidden">Nuevo</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Barcos" 
          value={stats.ships.toString()} 
          icon={Ship} 
          description="Barcos activos en sistema"
        />
        <StatCard 
          title="Pañoles" 
          value={stats.warehouses.toString()} 
          icon={Package} 
          description="Bodegas registradas"
        />
        <StatCard 
          title="Movimientos Hoy" 
          value={stats.movementsToday.toString()} 
          icon={History} 
          description="Ingresos y retiros"
        />
        <StatCard 
          title="Stock Bajo" 
          value={stats.lowStock.toString()} 
          icon={AlertTriangle} 
          description="Productos con < 5 unidades"
          color={stats.lowStock > 0 ? "text-red-600" : "text-slate-400"}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 text-slate-900 border-b pb-2">Últimos Movimientos</h3>
          <p className="text-slate-500 text-sm italic font-medium">Dirígete a la sección de Ingresos o Retiros para ver el historial detallado.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 text-slate-900 border-b pb-2">Distribución de Stock</h3>
          <p className="text-slate-500 text-sm italic font-medium">Dirígete a la sección de Stock para ver el detalle por pañol.</p>
        </div>
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchStats} 
      />

      <BarcodeScanner 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScan}
      />
    </div>
  )
}

function StatCard({ title, value, icon: Icon, description, color = "text-blue-600" }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <Icon className={`${color} shrink-0`} size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
      </div>
    </div>
  )
}
