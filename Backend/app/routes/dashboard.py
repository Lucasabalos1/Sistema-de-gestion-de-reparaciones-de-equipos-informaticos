from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db, limiter
from app.models import Turno, Consulta_Telegram
from sqlalchemy import extract
from datetime import date

dashboard_bp = Blueprint('dashboard', __name__)

ESTADOS_ACTIVOS = ["En espera", "Reparando", "En espera de stock"]


@dashboard_bp.route('/resumen', methods=['GET'])
@jwt_required()
@limiter.limit("30 per minute")
def resumen():
    today = date.today()
    mes_actual = today.month
    anio_actual = today.year

    turnos_activos = Turno.query.filter(
        Turno.cancelado == False,
        Turno.estado_tecnico.in_(ESTADOS_ACTIVOS)
    ).count()

    turnos_mes = Turno.query.filter(
        extract('month', Turno.fecha_entrada) == mes_actual,
        extract('year', Turno.fecha_entrada) == anio_actual
    ).all()

    turnos_mes_no_cancelados = [t for t in turnos_mes if not t.cancelado]

    dinero_ganado_mes = sum(
        d.precio_historico
        for t in turnos_mes_no_cancelados if t.estado_comercial == "Pagado"
        for d in t.detalles
    )

    turnos_todos = Turno.query.filter(
        Turno.cancelado == False,
        Turno.estado_tecnico == "Reparado"
    ).all()

    dinero_ganado_total = sum(
        d.precio_historico
        for t in turnos_todos
        for d in t.detalles
        if t.estado_comercial == "Pagado"
    )

    reparados_total = len(turnos_todos)
    ticket_promedio = dinero_ganado_total // reparados_total if reparados_total > 0 else 0

    notificaciones_sin_leer = Consulta_Telegram.query.filter(
        Consulta_Telegram.leido == False
    ).count()

    return jsonify({
        'turnos_activos': turnos_activos,
        'dinero_ganado_mes': dinero_ganado_mes,
        'ticket_promedio': ticket_promedio,
        'notificaciones_sin_leer': notificaciones_sin_leer,
    }), 200
