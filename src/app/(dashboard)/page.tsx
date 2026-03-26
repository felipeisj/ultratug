import { Ship, Package, History, AlertTriangle } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
        <p className="text-slate-500 mt-2">Visión general del inventario en la flota Ultratug.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Barcos" 
          value="2" 
          icon={Ship} 
          description="Barcos activos en sistema"
        />
        <StatCard 
          title="Pañoles" 
          value="5" 
          icon={Package} 
          description="Bodegas registradas"
        />
        <StatCard 
          title="Movimientos Hoy" 
          value="12" 
          icon={History} 
          description="Ingresos y retiros"
        />
        <StatCard 
          title="Stock Bajo" 
          value="3" 
          icon={AlertTriangle} 
          description="Productos por reponer"
          color="text-red-600"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 text-slate-900 border-b pb-2">Últimos Movimientos</h3>
          <p className="text-slate-400 text-sm italic">Cargando movimientos recientes...</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 text-slate-900 border-b pb-2">Distribución de Stock</h3>
          <p className="text-slate-400 text-sm italic">Cargando datos por barco...</p>
        </div>
      </div>
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
