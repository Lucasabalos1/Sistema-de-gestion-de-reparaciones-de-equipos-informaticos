from datetime import date, timedelta
from functools import wraps

from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models import Consulta_Telegram

notificaciones_bp = Blueprint('notificaciones', __name__)


def require_api_key(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key or api_key != current_app.config['NOTIFICATION_API_KEY']:
            return jsonify({'error': 'API key inválida o no proporcionada.'}), 401
        return f(*args, **kwargs)
    return decorated


def mapear_notificacion(n):
    default_ia = "este mensaje no paso por el agente de IA"
    return {
        'consulta_id': n.consulta_id,
        'chat_id_telegram': n.chat_id_telegram,
        'nombre_telegram': n.nombre_telegram,
        'telefono': n.telefono,
        'fecha_recepcion': str(n.fecha_recepcion),
        'resumen_ia': n.resumen_ia if n.resumen_ia else default_ia,
        'mensaje_original': n.mensaje_original,
        'leido': n.leido
    }

@notificaciones_bp.route('/', methods=['POST'])
@require_api_key
def cargar_notificacion():
    data = request.get_json()

    if not data or 'card_backend' not in data:
        return jsonify({'error': 'El payload debe contener la clave "card_backend".'}), 400

    card = data['card_backend']

    required_fields = ['chat_id_telegram', 'nombre_telegram', 'telefono', 'fecha_recepcion', 'mensaje_original', 'leido']
    for field in required_fields:
        if field not in card or card[field] is None or card[field] == '':
            return jsonify({'error': f'El campo "{field}" es requerido y no puede estar vacío.'}), 400

    try:
        notificacion = Consulta_Telegram(
            chat_id_telegram=card['chat_id_telegram'],
            nombre_telegram=card['nombre_telegram'],
            telefono=card['telefono'],
            fecha_recepcion=date.fromisoformat(card['fecha_recepcion']),
            resumen_ia=card.get('resumen_ia'),
            mensaje_original=card['mensaje_original'],
            leido=card['leido']
        )
        db.session.add(notificacion)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor al guardar la notificación.', 'detalle': str(e)}), 500

    return jsonify({'mensaje': 'Notificación cargada exitosamente.'}), 201


@notificaciones_bp.route('/', methods=['GET'])
@jwt_required()
def mostrar_notificaciones():
    try:
        no_leidas = Consulta_Telegram.query.filter_by(leido=False).all()
        cutoff = date.today() - timedelta(days=14)
        leidas = Consulta_Telegram.query.filter(
            Consulta_Telegram.leido == True,
            Consulta_Telegram.fecha_recepcion >= cutoff
        ).all()

        return jsonify({
            'leidas': [mapear_notificacion(n) for n in leidas],
            'no_leidas': [mapear_notificacion(n) for n in no_leidas]
        }), 200
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor al consultar notificaciones.', 'detalle': str(e)}), 500


@notificaciones_bp.route('/<int:consulta_id>', methods=['PATCH'])
@jwt_required()
def marcar_como_leida(consulta_id):
    notificacion = Consulta_Telegram.query.get(consulta_id)

    if not notificacion:
        return jsonify({'error': 'Notificación no encontrada.'}), 404

    try:
        notificacion.leido = True
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor al marcar la notificación.', 'detalle': str(e)}), 500

    return jsonify({'mensaje': 'Notificación marcada como leída.'}), 200
