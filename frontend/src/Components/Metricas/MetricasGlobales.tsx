import type { MetricasGlobal } from "../../Types/Metricas"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts"

interface MetricasGlobalesProps {
  metricas: MetricasGlobal | null
}

const COLORS = ["#9faadb", "#2749dd", "#34d399", "#fbbf24", "#f87171", "#60a5fa"]

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

const tooltipStyle = {
  backgroundColor: "#0c0e16",
  border: "1px solid #1e2030",
  borderRadius: "8px",
  color: "#e3e5ec",
}

const tickStyle = { fill: "#6b7280", fontSize: 13 }

const axisProps = { axisLine: false, tickLine: false }

const TICK_STYLE_MONTHS = { fill: "#6b7280", fontSize: 11 }

export const MetricasGlobales = ({ metricas }: MetricasGlobalesProps) => {
  if (!metricas) return null

  const { periodo, completados_vs_cancelados } = metricas

  const serviciosData = metricas.servicios_mas_usados.map((s) => ({
    ...s,
    nombre: s.nombre.length > 18 ? s.nombre.substring(0, 18) + "..." : s.nombre,
  }))

  const reparadosData = metricas.tendencia_reparados.map((r) => ({
    name: MESES[r.mes - 1],
    cantidad: r.cantidad,
  }))

  const ingresosData = metricas.tendencia_ingresos.map((r) => ({
    name: MESES[r.mes - 1],
    ingreso: r.ingreso,
  }))

  const estadoTecnicoData = metricas.distribucion_estado_tecnico.map((d) => ({
    name: d.estado,
    value: d.cantidad,
  }))

  const notificacionesData = [
    { name: "Leídas", value: metricas.notificaciones.leidas },
    { name: "No leídas", value: metricas.notificaciones.no_leidas },
  ]

  return (
    <>
      <p className="text-text-muted text-lg text-start mb-8">
        Métricas correspondientes al año {periodo.anio}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        <div className="bg-surface border border-muted rounded-xl p-4 lg:p-5 card-glow animate-fade-in-up delay-75">
          <p className="text-text-muted text-base mb-2 text-center">Turnos recibidos</p>
          <p className="text-3xl lg:text-4xl font-bold text-primary text-center">{metricas.turnos_recibidos}</p>
        </div>
        <div className="bg-surface border border-muted rounded-xl p-4 lg:p-5 card-glow animate-fade-in-up delay-150">
          <p className="text-text-muted text-base mb-2 text-center">Turnos reparados</p>
          <p className="text-3xl lg:text-4xl font-bold text-primary text-center">{metricas.equipos_reparados}</p>
        </div>
        <div className="bg-surface border border-muted rounded-xl p-4 lg:p-5 card-glow animate-fade-in-up delay-225">
          <p className="text-text-muted text-base mb-2 text-center">Turnos cancelados</p>
          <p className="text-3xl lg:text-4xl font-bold text-primary text-center">{metricas.turnos_cancelados}</p>
        </div>

        <div className="bg-surface border border-muted rounded-xl p-4 lg:p-5 card-glow animate-fade-in-up delay-300">
          <p className="text-text-muted text-sm text-center mb-3">Completados vs cancelados</p>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden flex">
            <div className="h-full bg-success" style={{ width: `${completados_vs_cancelados.completados_pct}%` }} />
            <div className="h-full bg-danger" style={{ width: `${completados_vs_cancelados.cancelados_pct}%` }} />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-success text-xs">{completados_vs_cancelados.completados_pct}%</span>
            <span className="text-danger text-xs">{completados_vs_cancelados.cancelados_pct}%</span>
          </div>
        </div>
        <div className="bg-surface border border-muted rounded-xl p-4 lg:p-5 card-glow animate-fade-in-up delay-375">
          <p className="text-text-muted text-base mb-2 text-center">Dinero cobrado</p>
          <p className="text-3xl lg:text-4xl font-bold text-success text-center">${metricas.dinero_ganado.toLocaleString("es-AR")}</p>
        </div>
        <div className="bg-surface border border-muted rounded-xl p-4 lg:p-5 card-glow animate-fade-in-up delay-450">
          <p className="text-text-muted text-base mb-2 text-center">Dinero pendiente a cobrar</p>
          <p className="text-3xl lg:text-4xl font-bold text-warning text-center">${metricas.monto_pendiente.toLocaleString("es-AR")}</p>
        </div>

        <div className="bg-surface border border-muted rounded-xl p-4 lg:p-5 card-glow animate-fade-in-up delay-525">
          <p className="text-text-muted text-base mb-2 text-center">Ticket promedio</p>
          <p className="text-3xl lg:text-4xl font-bold text-primary text-center">${metricas.ticket_promedio.toLocaleString("es-AR")}</p>
        </div>
        <div className="bg-surface border border-muted rounded-xl p-4 lg:p-5 card-glow animate-fade-in-up delay-600">
          <p className="text-text-muted text-base mb-2 text-center">Tiempo promedio reparación</p>
          <p className="text-3xl lg:text-4xl font-bold text-primary text-center">{metricas.tiempo_promedio_reparacion} <span className="text-sm font-normal text-text-muted">días</span></p>
        </div>
        <div className="bg-surface border border-muted rounded-xl p-4 lg:p-5 card-glow animate-fade-in-up">
          <p className="text-text-muted text-base mb-2 text-center">Cantidad de notificaciones</p>
          <p className="text-3xl lg:text-4xl font-bold text-info text-center">{metricas.notificaciones.recibidas}</p>
        </div>
      </div>

      {/* 1. Servicios más usados — barra horizontal */}
      {serviciosData.length > 0 && (
        <div className="bg-surface border border-muted rounded-xl p-6 mt-8 card-glow animate-fade-in-scale">
          <h3 className="text-text-muted text-sm mb-4">Servicios más usados</h3>
          <ResponsiveContainer width="100%" height={serviciosData.length * 50 + 20}>
            <BarChart data={serviciosData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="nombre" width={150} tick={tickStyle} {...axisProps} />
              <Tooltip cursor={false} contentStyle={tooltipStyle} formatter={(value) => [`${String(value)} veces`, "Cantidad"]} />
              <Bar dataKey="cantidad" radius={[0, 6, 6, 0]} barSize={28}>
                {serviciosData.map((_, index) => (
                  <Cell key={index} fill={COLORS[0]} fillOpacity={1 - index * 0.15} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 2. Reparados por mes — barra vertical */}
      {reparadosData.length > 0 && (
        <div className="bg-surface border border-muted rounded-xl p-6 mt-6 card-glow animate-fade-in-scale">
          <h3 className="text-text-muted text-sm mb-4">Reparados por mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reparadosData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" tick={TICK_STYLE_MONTHS} {...axisProps} />
              <YAxis tick={tickStyle} {...axisProps} />
              <Tooltip cursor={false} contentStyle={tooltipStyle} formatter={(value) => [`${String(value)} turnos`, "Reparados"]} />
              <Bar dataKey="cantidad" fill={COLORS[0]} radius={[6, 6, 0, 0]} barSize={36}>
                {reparadosData.map((_, index) => (
                  <Cell key={index} fill={COLORS[0]} fillOpacity={1 - index * 0.06} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 3. Ingresos por mes — barra vertical */}
      {ingresosData.length > 0 && (
        <div className="bg-surface border border-muted rounded-xl p-6 mt-6 card-glow animate-fade-in-scale">
          <h3 className="text-text-muted text-sm mb-4">Ingresos por mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ingresosData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" tick={TICK_STYLE_MONTHS} {...axisProps} />
              <YAxis tick={tickStyle} {...axisProps} />
              <Tooltip cursor={false} contentStyle={tooltipStyle} formatter={(value) => [`$${Number(value).toLocaleString("es-AR")}`, "Ingresos"]} />
              <Bar dataKey="ingreso" fill={COLORS[1]} radius={[6, 6, 0, 0]} barSize={36}>
                {ingresosData.map((_, index) => (
                  <Cell key={index} fill={COLORS[1]} fillOpacity={1 - index * 0.06} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 4+5. Donas: Estado técnico | Leídas vs no leídas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {estadoTecnicoData.length > 0 && (
          <div className="bg-surface border border-muted rounded-xl p-6 card-glow animate-fade-in-scale">
            <h3 className="text-text-muted text-sm mb-4">Distribución estado técnico</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={estadoTecnicoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {estadoTecnicoData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${String(value)} turnos`, "Cantidad"]} />
                <Legend iconType="circle" wrapperStyle={{ color: "#6b7280", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-surface border border-muted rounded-xl p-6 card-glow animate-fade-in-scale">
          <h3 className="text-text-muted text-sm mb-4">Notificaciones leídas vs no leídas</h3>
          {notificacionesData[0].value + notificacionesData[1].value > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={notificacionesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  paddingAngle={3}
                >
                  <Cell fill={COLORS[2]} />
                  <Cell fill={COLORS[4]} />
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${String(value)} notificaciones`, "Cantidad"]} />
                <Legend iconType="circle" wrapperStyle={{ color: "#6b7280", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-text-muted text-sm">
              No hay datos
            </div>
          )}
        </div>
      </div>
    </>
  )
}
