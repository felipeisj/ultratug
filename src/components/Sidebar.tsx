'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  PlusCircle, 
  MinusCircle, 
  Package, 
  Warehouse, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Ingresos', href: '/ingresos', icon: PlusCircle },
  { name: 'Retiros', href: '/retiros', icon: MinusCircle },
  { name: 'Stock', href: '/stock', icon: Warehouse },
  { name: 'Productos', href: '/productos', icon: Package },
  { name: 'Admin', href: '/admin', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-[50] md:hidden">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-blue-400">ULTRATUG</h1>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-5 -mr-5 text-slate-300 hover:text-white transition-all active:scale-95 z-[110] cursor-pointer"
          aria-label="Menu"
        >
          {isOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </header>

      {/* Overlay - Mobile Only */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-screen bg-slate-900 text-white flex flex-col z-[70] transition-transform duration-300 ease-in-out
        w-64 md:translate-x-0
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-blue-400">ULTRATUG</h1>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Inventario</p>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-2 text-slate-400 hover:text-white md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
