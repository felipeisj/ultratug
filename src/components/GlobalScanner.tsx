'use client'

import { useState } from 'react'
import { Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'
import BarcodeScanner from './BarcodeScanner'

export default function GlobalScanner() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleScan = (code: string) => {
    router.push(`/productos?search=${code}`)
    setIsOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[45] bg-slate-900 hover:bg-black text-white p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-2xl transition-all active:scale-90 flex items-center gap-3 border-4 border-white/10 group"
        title="Escaneo Global con Cámara"
      >
        <Camera size={24} className="md:w-[28px] md:h-[28px] group-hover:scale-110 transition-transform" />
        <span className="hidden md:block font-bold">Escanear</span>
      </button>

      <BarcodeScanner 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onScan={handleScan}
      />
    </>
  )
}
