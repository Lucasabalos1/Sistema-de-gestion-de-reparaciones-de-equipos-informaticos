import { useState, useEffect } from "react"
import { X, Search } from "lucide-react"
import { ClienteSelectModal } from "./ClienteSelectModal"
import { ServiciosSelectModal } from "./ServiciosSelectModal"
import { useClientes } from "../../Hooks/useClientes"
import { useServicios } from "../../Hooks/useServicios"
import { ESTADOS_COMERCIALES, ESTADOS_TECNICOS } from "../../Types/Turno"
import type { Turno, TurnoFormData } from "../../Types/Turno"
import type { Cliente } from "../../Types/Cliente"
import type { Servicio } from "../../Types/Servicio"

interface TurnoFormModalProps {
  isOpen: boolean
  onClose: () => void
  turno?: Turno | null
  onSubmit: (data: TurnoFormData) => Promise<{ message: string } | null>
}

export const TurnoFormModal = ({ isOpen, onClose, turno, onSubmit }: TurnoFormModalProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isClosing, setIsClosing] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [titulo, setTitulo] = useState<string>("")
  const [descripcion, setDescripcion] = useState<string>("")
  const [estadoComercial, setEstadoComercial] = useState<string>(ESTADOS_COMERCIALES[1])
  const [estadoTecnico, setEstadoTecnico] = useState<string>(ESTADOS_TECNICOS[0])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [extras, setExtras] = useState<string>("")
  const [errores, setErrores] = useState<Record<string, string>>({})

  const [showClienteModal, setShowClienteModal] = useState<boolean>(false)
  const [showServiciosModal, setShowServiciosModal] = useState<boolean>(false)

  const { clientes, isLoading: isLoadingClientes, fetchClientes, searchCliente } = useClientes()
  const { servicios: catalogoServicios, isLoading: isLoadingServicios, fetchServicios, searchServicio } = useServicios()

  const isEditing = !!turno
  const total = servicios.reduce((acc, s) => acc + s.precio, 0)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsClosing(false)
      if (turno) {
        setCliente({
          cliente_id: turno.cliente_id,
          admin_id: 1,
          nombre: turno.cliente_nombre,
          apellido: turno.cliente_apellido,
          telefono: turno.telefono,
          correo: "",
          genero: "",
        })
        setTitulo(turno.titulo)
        setDescripcion(turno.descripcion)
        setEstadoComercial(turno.estado_comercial)
        setEstadoTecnico(turno.estado_tecnico)
        setServicios(
          turno.servicios.map((s) => ({
            servicio_id: s.servicio_id,
            nombre: s.nombre,
            precio: s.precio_historico,
            estado: true,
          }))
        )
        setExtras(turno.extras === "Sin datos" ? "" : turno.extras)
      } else {
        setCliente(null)
        setTitulo("")
        setDescripcion("")
        setEstadoComercial(ESTADOS_COMERCIALES[1])
        setEstadoTecnico(ESTADOS_TECNICOS[0])
        setServicios([])
        setExtras("")
      }
      setErrores({})
    }
  }, [isOpen, turno])

  useEffect(() => {
    if (isOpen) {
      fetchClientes()
      fetchServicios()
    }
  }, [isOpen, fetchClientes, fetchServicios])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      setIsClosing(false)
      onClose()
    }, 200)
  }

  const handleSelectCliente = (c: Cliente) => {
    setCliente(c)
  }

  const handleBuscarCliente = async (termino: string) => {
    if (termino.trim()) {
      await searchCliente(termino)
    } else {
      await fetchClientes()
    }
  }

  const handleBuscarServicio = async (nombre: string) => {
    if (nombre.trim()) {
      await searchServicio(nombre)
    } else {
      await fetchServicios()
    }
  }

  const handleConfirmServicios = (ids: number[]) => {
    setServicios(catalogoServicios.filter((s) => ids.includes(s.servicio_id)))
  }

  const validar = (): boolean => {
    const nuevos: Record<string, string> = {}

    if (!cliente) nuevos.cliente = "Debes seleccionar un cliente"
    if (!titulo.trim()) nuevos.titulo = "El título es obligatorio"
    if (!descripcion.trim()) nuevos.descripcion = "La descripción es obligatoria"
    if (servicios.length === 0) nuevos.servicios = "Debes seleccionar al menos un servicio"

    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  const handleSubmit = async () => {
    if (!validar()) return
    if (!cliente) return

    setIsSubmitting(true)
    const result = await onSubmit({
      cliente_id: cliente.cliente_id,
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      estado_comercial: estadoComercial as TurnoFormData["estado_comercial"],
      estado_tecnico: estadoTecnico as TurnoFormData["estado_tecnico"],
      servicios: servicios.map((s) => s.servicio_id),
      extras: extras.trim(),
    })
    setIsSubmitting(false)
    if (result) {
      handleClose()
    }
  }

  if (!isVisible) return null

  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${isClosing ? "modal-hide" : "modal-show"}`}
        onClick={handleClose}
      >
        <div
          className={`bg-surface border border-muted rounded-2xl w-[90%] max-w-lg p-6 shadow-2xl relative ${isClosing ? "modal-content-hide" : "modal-content-show"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 text-text-muted hover:text-danger transition-colors duration-200 cursor-pointer"
          >
            <X size={20} />
          </button>

          <h2 className="text-primary text-xl font-bold mb-6 pr-6">
            {isEditing ? "Editar turno" : "Crear turno"}
          </h2>

          <form
            onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
            className="space-y-4"
          >
            <div>
              <label className="block text-text text-sm font-medium mb-1">
                Cliente
              </label>
              <div className="flex items-center gap-2">
                <div className={`flex-1 rounded-lg px-3 py-2 bg-background border-2 ${errores.cliente ? "border-danger" : "border-muted"}`}>
                  {cliente ? (
                    <p className="text-text text-sm truncate">
                      {cliente.nombre} {cliente.apellido}
                    </p>
                  ) : (
                    <p className="text-text-muted text-sm">Sin cliente seleccionado</p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={isEditing}
                  onClick={() => setShowClienteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <Search size={14} />
                  Buscar
                </button>
              </div>
              {errores.cliente && <p className="text-danger text-xs mt-1">{errores.cliente}</p>}
            </div>

            <div>
              <label className="block text-text text-sm font-medium mb-1">
                Título <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => { setTitulo(e.target.value); setErrores((prev) => ({ ...prev, titulo: "" })) }}
                placeholder="Ingresa el título del turno"
                className={`w-full px-3 py-2 rounded-lg bg-background border-2 text-text text-sm placeholder-text-muted/60 outline-none transition-colors duration-200 ${errores.titulo ? "border-danger" : "border-muted focus:border-accent"}`}
              />
              {errores.titulo && <p className="text-danger text-xs mt-1">{errores.titulo}</p>}
            </div>

            <div>
              <label className="block text-text text-sm font-medium mb-1">
                Descripción <span className="text-danger">*</span>
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => { setDescripcion(e.target.value); setErrores((prev) => ({ ...prev, descripcion: "" })) }}
                placeholder="Detalla el trabajo a realizar"
                rows={3}
                className={`w-full px-3 py-2 rounded-lg bg-background border-2 text-text text-sm placeholder-text-muted/60 outline-none transition-colors duration-200 resize-none ${errores.descripcion ? "border-danger" : "border-muted focus:border-accent"}`}
              />
              {errores.descripcion && <p className="text-danger text-xs mt-1">{errores.descripcion}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-text text-sm font-medium mb-1">
                  Comercial
                </label>
                <select
                  value={estadoComercial}
                  onChange={(e) => setEstadoComercial(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border-2 border-muted text-text text-sm outline-none focus:border-accent transition-colors duration-200 appearance-none cursor-pointer"
                >
                  {ESTADOS_COMERCIALES.map((estado) => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-text text-sm font-medium mb-1">
                  Técnico
                </label>
                <select
                  value={estadoTecnico}
                  onChange={(e) => setEstadoTecnico(e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 rounded-lg bg-background border-2 border-muted text-text text-sm outline-none focus:border-accent transition-colors duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {ESTADOS_TECNICOS.map((estado) => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-text text-sm font-medium mb-1">
                Servicios <span className="text-danger">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div className={`flex-1 rounded-lg px-3 py-2 bg-background border-2 ${errores.servicios ? "border-danger" : "border-muted"}`}>
                  {servicios.length === 0 ? (
                    <p className="text-text-muted text-sm">Sin servicios seleccionados</p>
                  ) : (
                    <p className="text-text text-sm">
                      {servicios.length === 1 ? "1 servicio" : `${servicios.length} servicios`}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowServiciosModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors duration-200 cursor-pointer shrink-0"
                >
                  <Search size={14} />
                  Buscar
                </button>
              </div>
              {errores.servicios && <p className="text-danger text-xs mt-1">{errores.servicios}</p>}
            </div>

            <div>
              <label className="block text-text text-sm font-medium mb-1">
                Extras
              </label>
              <textarea
                value={extras}
                onChange={(e) => setExtras(e.target.value)}
                placeholder="Información adicional (opcional)"
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-background border-2 border-muted text-text text-sm placeholder-text-muted/60 outline-none focus:border-accent transition-colors duration-200 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-muted">
              <p className="text-text font-bold text-sm">
                TOTAL: ${total.toLocaleString()}
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? (isEditing ? "Guardando..." : "Creando...")
                  : (isEditing ? "Guardar cambios" : "Crear turno")}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ClienteSelectModal
        isOpen={showClienteModal}
        onClose={() => setShowClienteModal(false)}
        onSelect={handleSelectCliente}
        clientes={clientes}
        isLoading={isLoadingClientes}
        onBuscar={handleBuscarCliente}
      />

      <ServiciosSelectModal
        isOpen={showServiciosModal}
        onClose={() => setShowServiciosModal(false)}
        selectedIds={servicios.map((s) => s.servicio_id)}
        onConfirm={handleConfirmServicios}
        servicios={catalogoServicios}
        isLoading={isLoadingServicios}
        onBuscar={handleBuscarServicio}
      />
    </>
  )
}
