from datetime import date, timedelta

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models import Turno, Turno_Detalle, Servicio, Cliente

turnos_bp = Blueprint('turnos', __name__)

ESTADOS_TECNICOS = ["En espera", "Reparando", "En espera de stock", "Reparado", "Sin solución"]
ESTADOS_COMERCIALES = ["Pagado", "No pagado"]


def mapear_turno(n):
    cliente = n.cliente
    servicios = [
        {
            'servicio_id': detalle.servicio_id,
            'nombre': detalle.servicio.nombre,
            'precio_historico': detalle.precio_historico
        }
        for detalle in n.detalles
    ]
    total = sum(detalle.precio_historico for detalle in n.detalles)
    return {
        'turno_id': n.turno_id,
        'cliente_id': n.cliente_id,
        'titulo': n.titulo,
        'descripcion': n.descripcion,
        'fecha_entrada': n.fecha_entrada,
        'fecha_salida': n.fecha_salida if n.fecha_salida else "Sin datos",
        'extras': n.extras if n.extras else "Sin datos",
        'estado_comercial': n.estado_comercial,
        'estado_tecnico': n.estado_tecnico,
        'cancelado': n.cancelado,
        'cliente_nombre': cliente.nombre,
        'cliente_apellido': cliente.apellido if cliente.apellido else "",
        'telefono': cliente.telefono,
        'servicios': servicios,
        'total': total
    }


@turnos_bp.route('/', methods=['GET'])
@jwt_required()
def obtenerTurnos():
    try:
        turnos = Turno.query.all()

        corte = date.today() - timedelta(days=7)
        estados_limitados = ["Reparando", "Sin solución"]

        agrupados = {estado: [] for estado in ESTADOS_TECNICOS}
        for turno in turnos:
            if turno.estado_tecnico in estados_limitados and turno.fecha_entrada < corte:
                continue
            agrupados[turno.estado_tecnico].append(mapear_turno(turno))

        return jsonify(agrupados), 200

    except Exception as e:
        return jsonify({'error': 'Error interno del servidor al consultar los turnos.', 'detalle': str(e)}), 500


@turnos_bp.route('/historial', methods=['GET'])
@jwt_required()
def obtenerHistorial():
    try:
        turnos = Turno.query.filter(db.or_(
            Turno.estado_tecnico.in_(["Reparado", "Sin solución"]),
            Turno.cancelado.is_(True)
        )).all()

        if not turnos:
            return jsonify({'message': 'No hay turnos en el historial'}), 404

        resultado = []
        for turno in turnos:
            resultado.append(mapear_turno(turno))

        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({'error': 'Error interno del servidor al consultar el historial de turnos.', 'detalle': str(e)}), 500


@turnos_bp.route('/', methods=['POST'])
@jwt_required()
def crearTurno():
    data = request.get_json()

    required_fields = ['cliente_id', 'titulo', 'descripcion', 'servicios']
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == '':
            return jsonify({'error': f"El campo '{field}' es requerido y no puede estar vacío."}), 400

    cliente = Cliente.query.get(data['cliente_id'])
    if not cliente:
        return jsonify({'error': 'Cliente no encontrado.'}), 404

    servicios_ids = data['servicios']
    if not isinstance(servicios_ids, list) or not servicios_ids:
        return jsonify({'error': 'La lista de servicios no puede estar vacía.'}), 400

    if len(servicios_ids) != len(set(servicios_ids)):
        return jsonify({'error': 'No se pueden asignar servicios duplicados.'}), 400

    servicios = []
    for servicio_id in servicios_ids:
        servicio = Servicio.query.filter_by(servicio_id=servicio_id, estado=True).first()
        if not servicio:
            return jsonify({'error': f"El servicio con id {servicio_id} no existe o está inactivo."}), 400
        servicios.append(servicio)

    estado_comercial = data.get('estado_comercial') or "No pagado"
    estado_tecnico = data.get('estado_tecnico') or "En espera"

    if estado_comercial not in ESTADOS_COMERCIALES:
        return jsonify({'error': f"El estado comercial '{estado_comercial}' no es válido."}), 400

    if estado_tecnico not in ESTADOS_TECNICOS:
        return jsonify({'error': f"El estado técnico '{estado_tecnico}' no es válido."}), 400

    if data.get('fecha_entrada'):
        try:
            fecha_entrada = date.fromisoformat(data['fecha_entrada'])
        except ValueError:
            return jsonify({'error': 'El formato de fecha_entrada es inválido. Debe ser YYYY-MM-DD.'}), 400
    else:
        fecha_entrada = date.today()

    extras = data.get('extras') or None

    try:
        turno = Turno(
            cliente_id=data['cliente_id'],
            titulo=data['titulo'],
            descripcion=data['descripcion'],
            fecha_entrada=fecha_entrada,
            fecha_salida=None,
            extras=extras,
            estado_comercial=estado_comercial,
            estado_tecnico=estado_tecnico,
            cancelado=False
        )
        db.session.add(turno)
        db.session.flush()

        for servicio in servicios:
            detalle = Turno_Detalle(
                turno_id=turno.turno_id,
                servicio_id=servicio.servicio_id,
                precio_historico=servicio.precio
            )
            db.session.add(detalle)

        db.session.commit()

        return jsonify({'message': 'El turno se registró correctamente'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor al registrar el turno.', 'detalle': str(e)}), 500


@turnos_bp.route('/<int:id_turno>', methods=['PUT'])
@jwt_required()
def editarTurno(id_turno):
    data = request.get_json()

    required_fields = ['cliente_id', 'titulo', 'descripcion', 'servicios', 'estado_comercial', 'estado_tecnico']
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == '':
            return jsonify({'error': f"El campo '{field}' es requerido y no puede estar vacío."}), 400

    cliente = Cliente.query.get(data['cliente_id'])
    if not cliente:
        return jsonify({'error': 'Cliente no encontrado.'}), 404

    turno = Turno.query.get(id_turno)
    if not turno:
        return jsonify({'error': 'Turno no encontrado.'}), 404

    if turno.cliente_id != data['cliente_id']:
        return jsonify({'error': 'El turno no pertenece al cliente indicado.'}), 404

    servicios_ids = data['servicios']
    if not isinstance(servicios_ids, list) or not servicios_ids:
        return jsonify({'error': 'La lista de servicios no puede estar vacía.'}), 400

    if len(servicios_ids) != len(set(servicios_ids)):
        return jsonify({'error': 'No se pueden asignar servicios duplicados.'}), 400

    servicios = []
    for servicio_id in servicios_ids:
        servicio = Servicio.query.filter_by(servicio_id=servicio_id, estado=True).first()
        if not servicio:
            return jsonify({'error': f"El servicio con id {servicio_id} no existe o está inactivo."}), 400
        servicios.append(servicio)

    if data['estado_comercial'] not in ESTADOS_COMERCIALES:
        return jsonify({'error': f"El estado comercial '{data['estado_comercial']}' no es válido."}), 400

    if data['estado_tecnico'] not in ESTADOS_TECNICOS:
        return jsonify({'error': f"El estado técnico '{data['estado_tecnico']}' no es válido."}), 400

    if data.get('fecha_entrada'):
        try:
            fecha_entrada = date.fromisoformat(data['fecha_entrada'])
        except ValueError:
            return jsonify({'error': 'El formato de fecha_entrada es inválido. Debe ser YYYY-MM-DD.'}), 400
    else:
        fecha_entrada = turno.fecha_entrada

    extras = data.get('extras') or None

    try:
        estado_anterior = turno.estado_tecnico

        turno.titulo = data['titulo']
        turno.descripcion = data['descripcion']
        turno.fecha_entrada = fecha_entrada
        turno.extras = extras
        turno.estado_comercial = data['estado_comercial']
        turno.estado_tecnico = data['estado_tecnico']

        if turno.estado_tecnico == "Reparado" and estado_anterior != "Reparado":
            turno.fecha_salida = date.today()

        Turno_Detalle.query.filter_by(turno_id=turno.turno_id).delete()

        for servicio in servicios:
            detalle = Turno_Detalle(
                turno_id=turno.turno_id,
                servicio_id=servicio.servicio_id,
                precio_historico=servicio.precio
            )
            db.session.add(detalle)

        db.session.commit()

        return jsonify({'message': 'El turno se editó correctamente'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor al editar el turno.', 'detalle': str(e)}), 500


@turnos_bp.route('/<int:id_turno>/estado-comercial', methods=['PATCH'])
@jwt_required()
def editarEstadoComercial(id_turno):
    turno = Turno.query.get(id_turno)
    if not turno:
        return jsonify({'error': 'Turno no encontrado.'}), 404

    data = request.get_json()
    estado_comercial = data.get('estado_comercial')

    if not estado_comercial:
        return jsonify({'error': 'El campo estado_comercial es requerido y no puede estar vacío.'}), 400

    if estado_comercial not in ESTADOS_COMERCIALES:
        return jsonify({'error': f"El estado comercial '{estado_comercial}' no es válido."}), 400

    try:
        turno.estado_comercial = estado_comercial
        db.session.commit()

        return jsonify({'message': 'El estado comercial se actualizó correctamente'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor al actualizar el estado comercial.', 'detalle': str(e)}), 500


@turnos_bp.route('/<int:id_turno>/estado-tecnico', methods=['PATCH'])
@jwt_required()
def editarEstadoTecnico(id_turno):
    turno = Turno.query.get(id_turno)
    if not turno:
        return jsonify({'error': 'Turno no encontrado.'}), 404

    data = request.get_json()
    estado_tecnico = data.get('estado_tecnico')

    if not estado_tecnico:
        return jsonify({'error': 'El campo estado_tecnico es requerido y no puede estar vacío.'}), 400

    if estado_tecnico not in ESTADOS_TECNICOS:
        return jsonify({'error': f"El estado técnico '{estado_tecnico}' no es válido."}), 400

    try:
        estado_anterior = turno.estado_tecnico

        if estado_tecnico == "Reparado" and estado_anterior != "Reparado":
            turno.fecha_salida = date.today()

        turno.estado_tecnico = estado_tecnico
        db.session.commit()

        return jsonify({'message': 'El estado técnico se actualizó correctamente'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor al actualizar el estado técnico.', 'detalle': str(e)}), 500


@turnos_bp.route('/<int:id_turno>/cancelar', methods=['PATCH'])
@jwt_required()
def editarCancelacion(id_turno):
    turno = Turno.query.get(id_turno)
    if not turno:
        return jsonify({'error': 'Turno no encontrado.'}), 404

    if turno.cancelado:
        return jsonify({'error': 'El turno ya está cancelado.'}), 400

    try:
        turno.cancelado = True
        db.session.commit()

        return jsonify({'message': 'El turno se canceló correctamente'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor al cancelar el turno.', 'detalle': str(e)}), 500
