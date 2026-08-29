from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required
from app.extensions import db, limiter
from app.models import Turno, Consulta_Telegram
from sqlalchemy import extract

metricas_bp = Blueprint('metricas', __name__)

ESTADOS_TECNICOS = ["En espera", "Reparando", "En espera de stock", "Reparado", "Sin solución"]
MESES_VALIDOS = list(range(1, 13))


@metricas_bp.route('/mensual', methods=['POST'])
@jwt_required()
@limiter.limit("10 per minute")
def metricas_mensuales():
    data = request.get_json(silent=True) or {}
    mes = data.get('mes')
    anio = data.get('anio')

    if not mes or not anio:
        return jsonify({'error': 'Los campos "mes" y "anio" son requeridos.'}), 400
    if mes not in MESES_VALIDOS:
        return jsonify({'error': f'El mes "{mes}" no es válido. Debe ser entre 1 y 12.'}), 400

    turnos_mes = Turno.query.filter(
        extract('month', Turno.fecha_entrada) == mes,
        extract('year', Turno.fecha_entrada) == anio
    ).all()

    turnos_no_cancelados = [t for t in turnos_mes if not t.cancelado]

    turnos_reparados = [t for t in turnos_mes if t.estado_tecnico == "Reparado"]
    turnos_cancelados = [t for t in turnos_mes if t.cancelado]

    total = len(turnos_mes)
    reparados = len(turnos_reparados)
    cancelados = len(turnos_cancelados)

    dinero_ganado = sum(
        d.precio_historico
        for t in turnos_no_cancelados if t.estado_comercial == "Pagado"
        for d in t.detalles
    )

    monto_pendiente = sum(
        d.precio_historico
        for t in turnos_no_cancelados if t.estado_comercial == "No pagado"
        for d in t.detalles
    )

    ticket_promedio = dinero_ganado // reparados if reparados > 0 else 0

    tiempos = [
        (t.fecha_salida - t.fecha_entrada).days
        for t in turnos_reparados if t.fecha_salida
    ]
    tiempo_promedio = round(sum(tiempos) / len(tiempos), 1) if tiempos else 0

    servicios_frecuencia = {}
    for t in turnos_no_cancelados:
        for d in t.detalles:
            nombre = d.servicio.nombre
            servicios_frecuencia[nombre] = servicios_frecuencia.get(nombre, 0) + 1

    servicios_top = sorted(servicios_frecuencia.items(), key=lambda x: x[1], reverse=True)[:5]

    notificaciones_mes = [
        n for n in Consulta_Telegram.query.filter(
            extract('month', Consulta_Telegram.fecha_recepcion) == mes,
            extract('year', Consulta_Telegram.fecha_recepcion) == anio
        ).all()
    ]

    return jsonify({
        'periodo': {'mes': mes, 'anio': anio},
        'turnos_recibidos': total,
        'equipos_reparados': reparados,
        'turnos_cancelados': cancelados,
        'completados_vs_cancelados': {
            'completados_pct': round(reparados / total * 100, 1) if total > 0 else 0,
            'cancelados_pct': round(cancelados / total * 100, 1) if total > 0 else 0,
        },
        'dinero_ganado': dinero_ganado,
        'monto_pendiente': monto_pendiente,
        'ticket_promedio': ticket_promedio,
        'tiempo_promedio_reparacion': tiempo_promedio,
        'servicios_mas_usados': [{'nombre': n, 'cantidad': c} for n, c in servicios_top],
        'notificaciones_recibidas': len(notificaciones_mes),
    }), 200


@metricas_bp.route('/global', methods=['POST'])
@jwt_required()
@limiter.limit("5 per minute")
def metricas_globales():
    data = request.get_json(silent=True) or {}
    anio = data.get('anio')
    if not anio:
        from datetime import date
        anio = date.today().year

    turnos_anio = Turno.query.filter(
        extract('year', Turno.fecha_entrada) == anio
    ).all()

    turnos_no_cancelados = [t for t in turnos_anio if not t.cancelado]

    turnos_reparados = [t for t in turnos_anio if t.estado_tecnico == "Reparado"]
    turnos_cancelados = [t for t in turnos_anio if t.cancelado]

    total = len(turnos_anio)
    reparados = len(turnos_reparados)
    cancelados = len(turnos_cancelados)

    dinero_ganado = sum(
        d.precio_historico
        for t in turnos_no_cancelados if t.estado_comercial == "Pagado"
        for d in t.detalles
    )

    monto_pendiente = sum(
        d.precio_historico
        for t in turnos_no_cancelados if t.estado_comercial == "No pagado"
        for d in t.detalles
    )

    ticket_promedio = dinero_ganado // reparados if reparados > 0 else 0

    tiempos = [
        (t.fecha_salida - t.fecha_entrada).days
        for t in turnos_reparados if t.fecha_salida
    ]
    tiempo_promedio = round(sum(tiempos) / len(tiempos), 1) if tiempos else 0

    servicios_frecuencia = {}
    for t in turnos_no_cancelados:
        for d in t.detalles:
            nombre = d.servicio.nombre
            servicios_frecuencia[nombre] = servicios_frecuencia.get(nombre, 0) + 1

    servicios_top = sorted(servicios_frecuencia.items(), key=lambda x: x[1], reverse=True)[:5]

    notificaciones_anio = Consulta_Telegram.query.filter(
        extract('year', Consulta_Telegram.fecha_recepcion) == anio
    ).all()
    leidas = sum(1 for n in notificaciones_anio if n.leido)

    tendencia_reparados = []
    tendencia_ingresos = []
    for m in range(1, 13):
        turnos_mes = [t for t in turnos_anio if t.fecha_entrada.month == m]
        reparados_mes = len([t for t in turnos_mes if t.estado_tecnico == "Reparado"])
        ingresos_mes = sum(
            d.precio_historico
            for t in turnos_mes if not t.cancelado and t.estado_comercial == "Pagado"
            for d in t.detalles
        )
        tendencia_reparados.append({'mes': m, 'cantidad': reparados_mes})
        tendencia_ingresos.append({'mes': m, 'ingreso': ingresos_mes})

    dist_estado = {estado: 0 for estado in ESTADOS_TECNICOS}
    for t in turnos_anio:
        if t.estado_tecnico in dist_estado:
            dist_estado[t.estado_tecnico] += 1

    return jsonify({
        'periodo': {'anio': anio},
        'turnos_recibidos': total,
        'equipos_reparados': reparados,
        'turnos_cancelados': cancelados,
        'completados_vs_cancelados': {
            'completados_pct': round(reparados / total * 100, 1) if total > 0 else 0,
            'cancelados_pct': round(cancelados / total * 100, 1) if total > 0 else 0,
        },
        'dinero_ganado': dinero_ganado,
        'monto_pendiente': monto_pendiente,
        'ticket_promedio': ticket_promedio,
        'tiempo_promedio_reparacion': tiempo_promedio,
        'servicios_mas_usados': [{'nombre': n, 'cantidad': c} for n, c in servicios_top],
        'notificaciones': {
            'recibidas': len(notificaciones_anio),
            'leidas': leidas,
            'no_leidas': len(notificaciones_anio) - leidas,
        },
        'tendencia_reparados': tendencia_reparados,
        'tendencia_ingresos': tendencia_ingresos,
        'distribucion_estado_tecnico': [{'estado': e, 'cantidad': c} for e, c in dist_estado.items()],
    }), 200
