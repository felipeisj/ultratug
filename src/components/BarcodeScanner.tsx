'use client'

import { useEffect, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X, Camera, RefreshCw, Loader2 } from 'lucide-react'

interface BarcodeScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (decodedText: string) => void
}

export default function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null)
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'starting' | 'running' | 'error'>('idle')

  useEffect(() => {
    if (isOpen && !html5QrCode) {
      const instance = new Html5Qrcode("reader")
      setHtml5QrCode(instance)
      startCamera(instance)
    }

    return () => {
      if (html5QrCode) {
        stopCamera()
      }
    }
  }, [isOpen])

  const startCamera = async (instance: Html5Qrcode) => {
    setCameraStatus('starting')
    try {
      await instance.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText)
          stopCamera()
          onClose()
        },
        () => { } // Silently ignore frame scan failures
      )
      setCameraStatus('running')
    } catch (err) {
      console.error("Error starting camera:", err)
      setCameraStatus('error')
    }
  }

  const stopCamera = async () => {
    if (html5QrCode && html5QrCode.isScanning) {
      try {
        await html5QrCode.stop()
      } catch (err) {
        console.error("Error stopping camera:", err)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden relative shadow-2xl">
        <div className="p-6 flex justify-between items-center border-b border-slate-100">
          <div className="flex items-center gap-3 text-slate-900">
            <Camera className="text-blue-600" size={24} />
            <h3 className="text-xl font-bold">Escanear Código</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 bg-slate-50 relative min-h-[350px] flex flex-col items-center justify-center">
          <div id="reader" className="w-full h-full overflow-hidden rounded-2xl border-4 border-white shadow-inner bg-black aspect-square max-w-[300px]">
            {/* Camera feed will be injected here */}
          </div>

          {cameraStatus === 'starting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
              <p className="text-sm font-bold text-slate-600">Encendiendo Cámara...</p>
            </div>
          )}

          {cameraStatus === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50/90 backdrop-blur-sm z-10 p-6 text-center">
              <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4">
                <Camera size={40} />
              </div>
              <p className="text-sm font-bold text-red-900 mb-2">Error de Acceso</p>
              <p className="text-xs text-red-700 mb-6">
                No se pudo acceder a la cámara. Asegúrate de dar permisos en tu navegador (Safari &gt; Ajustes &gt; Cámara).
              </p>
              <button
                onClick={() => html5QrCode && startCamera(html5QrCode)}
                className="bg-red-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-lg"
              >
                Reintentar Acceso
              </button>
            </div>
          )}

          <div className="mt-6 flex flex-col items-center text-center space-y-2">
            <div className="animate-pulse bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {cameraStatus === 'running' ? 'Escaneando...' : 'Preparando...'}
            </div>
            <p className="text-xs text-slate-500 font-medium px-8">
              Centra el código de barra en el recuadro para identificar el producto automáticamente.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-center">
          <button
            onClick={() => window.location.reload()}
            className="text-slate-400 hover:text-blue-600 flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} /> Reiniciar Aplicación
          </button>
        </div>
      </div>

      <style jsx global>{`
        #reader video {
          border-radius: 12px;
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
    </div>
  )
}
