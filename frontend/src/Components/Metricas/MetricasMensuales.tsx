import type { MetricasMensual } from "../../Types/Metricas"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface MetricasMensualesProps {
  metricas: MetricasMensual | null
}

const COLOR = "#9faadb"

export const MetricasMensuales = ({ metricas }: MetricasMensualesProps) => {
  if (!metricas) return null

  const { periodo, completados_vs_cancelados } = metricas

  return (
    <>
      <p className="text-text-muted text-lg text-start mb-8">
        Métricas correspondientes al periodo {String(periodo.mes).padStart(2, "0")}/{periodo.anio}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {/* Fila 1 */}
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

        {/* Fila 2 */}
        <div className="bg-surface border border-muted rounded-xl p-4 lg:p-5 card-glow animate-fade-in-up delay-300">
          <p className="text-text-muted text-sm text-center mb-3">Completados vs cancelados</p>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden flex">
            <div
              className="h-full bg-success"
              style={{ width: `${completados_vs_cancelados.completados_pct}%` }}
            />
            <div
              className="h-full bg-danger"
              style={{ width: `${completados_vs_cancelados.cancelados_pct}%` }}
            />
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

        {/* Fila 3 */}
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
          <p className="text-3xl lg:text-4xl font-bold text-info text-center">{metricas.notificaciones_recibidas}</p>
        </div>
      </div>

      {/* Gráfico de servicios más usados */}
      {metricas.servicios_mas_usados.length > 0 && (
        <div className="bg-surface border border-muted rounded-xl p-6 mt-8 card-glow animate-fade-in-scale">
          <h3 className="text-text-muted text-sm mb-4">Servicios más usados</h3>
          <ResponsiveContainer width="100%" height={metricas.servicios_mas_usados.length * 50 + 20}>
            <BarChart
              data={metricas.servicios_mas_usados}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="nombre"
                width={150}
                tick={{ fill: "#6b7280", fontSize: 13 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={false}
                contentStyle={{ backgroundColor: "#0c0e16", border: "1px solid #1e2030", borderRadius: "8px", color: "#e3e5ec" }}
                formatter={(value) => [`${String(value)} veces`, "Cantidad"]}
              />
              <Bar dataKey="cantidad" radius={[0, 6, 6, 0]} barSize={28}>
                {metricas.servicios_mas_usados.map((_, index) => (
                  <Cell key={index} fill={COLOR} fillOpacity={1 - index * 0.15} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  )
}
