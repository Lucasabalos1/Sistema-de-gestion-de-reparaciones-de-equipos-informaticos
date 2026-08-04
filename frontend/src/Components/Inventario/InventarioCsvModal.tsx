import { useState, useEffect, useRef } from "react"
import { X, UploadCloud } from "lucide-react"

interface InventarioCsvModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (archivo: File) => Promise<{ message: string } | null>
  error: string | null
}

export const InventarioCsvModal = ({ isOpen, onClose, onImport, error }: InventarioCsvModalProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isClosing, setIsClosing] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [errorLocal, setErrorLocal] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsClosing(false)
      setArchivo(null)
      setErrorLocal(null)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      setIsClosing(false)
      onClose()
    }, 200)
  }

  const validarYSeleccionar = (file: File | undefined) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrorLocal("El archivo debe ser un CSV.")
      setArchivo(null)
      return
    }
    setErrorLocal(null)
    setArchivo(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    validarYSeleccionar(e.dataTransfer.files[0])
  }

  const handleImportar = async () => {
    if (!archivo) return
    setIsSubmitting(true)
    const result = await onImport(archivo)
    setIsSubmitting(false)
    if (result) {
      handleClose()
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${isClosing ? "modal-hide" : "modal-show"}`}
      onClick={handleClose}
    >
      <div
        className={`bg-surface border border-muted rounded-2xl w-[90%] max-w-md p-6 shadow-2xl relative ${isClosing ? "modal-content-hide" : "modal-content-show"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-text-muted hover:text-danger transition-colors duration-200 cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-primary text-xl font-bold mb-4 pr-6">
          Importar CSV
        </h2>

        <div className="border-b border-muted mb-6" />

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => validarYSeleccionar(e.target.files?.[0])}
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed text-center cursor-pointer transition-colors duration-200 ${isDragging ? "border-accent bg-accent/10" : "border-muted hover:border-accent hover:bg-accent/5"}`}
        >
          <UploadCloud size={40} className={isDragging ? "text-accent" : "text-text-muted"} />
          {archivo ? (
            <p className="text-text text-sm font-medium break-all">
              {archivo.name}
            </p>
          ) : (
            <p className="text-text-muted text-sm max-w-[280px]">
              Haz click para seleccionar un archivo CSV O arrastra y suelte el archivo aqui
            </p>
          )}
        </div>

        {errorLocal && (
          <p className="text-danger text-xs mt-3">{errorLocal}</p>
        )}

        <div className="mt-4 p-4 rounded-lg bg-background border-2 border-muted">
          <p className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-2">
            Formato esperado
          </p>
          <pre className="text-text text-xs font-mono leading-relaxed whitespace-pre-wrap">
{`nombre,stock,precio_unidad
pasta termica,2,15000
aire comprimido,5,12000`}
          </pre>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-danger/10 border border-danger/30">
            <p className="text-danger text-xs font-medium">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg bg-background border-2 border-muted text-text-muted text-sm font-medium hover:text-text hover:border-text-muted transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleImportar}
            disabled={!archivo || isSubmitting}
            className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Importando..." : "Importar"}
          </button>
        </div>
      </div>
    </div>
  )
}
