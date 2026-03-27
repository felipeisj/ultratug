'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Ship, Warehouse, Trash2, Loader2 } from 'lucide-react'

export default function AdminPage() {
  const [ships, setShips] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [newShipName, setNewShipName] = useState('')
  const [newShipImo, setNewShipImo] = useState('')
  
  const [newWarehouseName, setNewWarehouseName] = useState('')
  const [selectedShipId, setSelectedShipId] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: shipsData } = await supabase.from('ships').select('*').order('name')
    const { data: warehousesData } = await supabase.from('warehouses').select('*, ships(name)').order('name')
    
    if (shipsData) setShips(shipsData)
    if (warehousesData) setWarehouses(warehousesData)
    setLoading(false)
  }

  const handleAddShip = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newShipName) return

    const { error } = await supabase.from('ships').insert({
      name: newShipName,
      imo_number: newShipImo || null
    })

    if (!error) {
      setNewShipName('')
      setNewShipImo('')
      fetchData()
    }
  }

  const handleAddWarehouse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWarehouseName || !selectedShipId) return

    const { error } = await supabase.from('warehouses').insert({
      name: newWarehouseName,
      ship_id: selectedShipId
    })

    if (!error) {
      setNewWarehouseName('')
      fetchData()
    }
  }

  const handleDeleteShip = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este barco? Se eliminarán todos sus pañoles.')) return
    await supabase.from('ships').delete().eq('id', id)
    fetchData()
  }

  const handleDeleteWarehouse = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este pañol?')) return
    await supabase.from('warehouses').delete().eq('id', id)
    fetchData()
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Panel de Administración</h2>
        <p className="text-slate-500 mt-2">Gestionar barcos y pañoles de la flota.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Ships Section */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
              <Ship className="text-blue-600" size={24} />
              Barcos
            </h3>
          </div>

          <form onSubmit={handleAddShip} className="flex flex-col gap-3 mb-8 bg-slate-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nombre del barco (ej: Ultratug I)"
                value={newShipName}
                onChange={(e) => setNewShipName(e.target.value)}
                className="px-3 py-2 rounded border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-500"
                required
              />
              <input
                type="text"
                placeholder="IMO Number (opcional)"
                value={newShipImo}
                onChange={(e) => setNewShipImo(e.target.value)}
                className="px-3 py-2 rounded border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-500"
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded flex items-center justify-center gap-2 transition-colors">
              <Plus size={18} /> Agregar Barco
            </button>
          </form>

          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-300" /></div>
            ) : ships.length === 0 ? (
              <p className="text-slate-400 text-center italic py-4">No hay barcos registrados.</p>
            ) : (
              ships.map(ship => (
                <div key={ship.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-800">{ship.name}</p>
                    {ship.imo_number && <p className="text-xs text-slate-500">IMO: {ship.imo_number}</p>}
                  </div>
                  <button onClick={() => handleDeleteShip(ship.id)} className="text-slate-300 hover:text-red-500 p-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Warehouses Section */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
              <Warehouse className="text-blue-600" size={24} />
              Pañoles (Bodegas)
            </h3>
          </div>

          <form onSubmit={handleAddWarehouse} className="flex flex-col gap-3 mb-8 bg-slate-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-3">
              <select
                value={selectedShipId}
                onChange={(e) => setSelectedShipId(e.target.value)}
                className="px-3 py-2 rounded border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                required
              >
                <option value="">Seleccionar Barco...</option>
                {ships.map(ship => (
                  <option key={ship.id} value={ship.id}>{ship.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Nombre Pañol (ej: Máquinas)"
                value={newWarehouseName}
                onChange={(e) => setNewWarehouseName(e.target.value)}
                className="px-3 py-2 rounded border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-500"
                required
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded flex items-center justify-center gap-2 transition-colors">
              <Plus size={18} /> Agregar Pañol
            </button>
          </form>

          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-300" /></div>
            ) : warehouses.length === 0 ? (
              <p className="text-slate-400 text-center italic py-4">No hay pañoles registrados.</p>
            ) : (
              warehouses.map(wh => (
                <div key={wh.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-800">{wh.name}</p>
                    <p className="text-xs text-blue-500 font-medium">{wh.ships?.name}</p>
                  </div>
                  <button onClick={() => handleDeleteWarehouse(wh.id)} className="text-slate-300 hover:text-red-500 p-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
