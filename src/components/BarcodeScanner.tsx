'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode'
import { X, Camera, RefreshCw } from 'lucide-react'

interface BarcodeScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (decodedText: string) => void
}

export default function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null)
  const scannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && !scanner) {
      // Small delay to ensure the div is in the DOM
      const timer = setTimeout(() => {
        const newScanner = new Html5QrcodeScanner(
          "reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 150 },
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
            aspectRatio: 1.0
          },
          /* verbose= */ false
        )
        
        newScanner.render(
          (decodedText) => {
            onScan(decodedText)
            newScanner.clear().then(() => {
              onClose()
            }).catch(error => {
              console.error("Failed to clear scanner", error)
              onClose()
            })
          },
          (errorMessage) => {
            // Silently ignore errors (failing to scan in each frame is normal)
          }
        )
        setScanner(newScanner)
      }, 100)
      return () => clearTimeout(timer)
    }

    if (!isOpen && scanner) {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error))
      setScanner(null)
    }
  }, [isOpen])

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

        <div className="p-6 bg-slate-50">
          <div id="reader" className="overflow-hidden rounded-2xl border-4 border-white shadow-inner bg-black min-h-[300px]" ref={scannerRef}>
            {/* html5-qrcode-scanner will inject the video here */}
          </div>
          
          <div className="mt-6 flex flex-col items-center text-center space-y-2">
            <div className="animate-pulse bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              Buscando Código...
            </div>
            <p className="text-sm text-slate-500 font-medium px-8">
              Centra el código de barra impreso en el recuadro para identificar el producto automáticamente.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-center">
          <button 
            onClick={() => window.location.reload()}
            className="text-slate-400 hover:text-blue-600 flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} /> Reiniciar Cámara
          </button>
        </div>
      </div>

      {/* Styles to clean up the default html5-qrcode UI */}
      <style jsx global>{`
        #reader__dashboard {
          display: none !important;
        }
        #reader__status_span {
          display: none !important;
        }
        #reader video {
          border-radius: 12px;
          object-fit: cover !important;
        }
        #reader img {
            display: none;
        }
        #reader button {
            background-color: #2563eb;
            color: white;
            font-weight: bold;
            padding: 8px 16px;
            border-radius: 8px;
            margin-top: 10px;
        }
      `}</style>
    </div>
  )
}
