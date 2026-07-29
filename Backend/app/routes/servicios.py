from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models import Servicio

servicios_bp = Blueprint('servicios', __name__)


@servicios_bp.route('/', methods=['GET'])
@jwt_required()
def obtenerServicios():
    try:
        servicios = Servicio.query.filter_by(estado=True).all()

        if not servicios:
            return jsonify({'message': 'No hay servicios registrados'}), 404

        resultado = []
        for s in servicios:
            resultado.append({
                'servicio_id': s.servicio_id,
                'nombre': s.nombre,
                'precio': s.precio,
                'estado': s.estado
            })

        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({'error': 'Error interno del servidor al consultar servicios.', 'detalle': str(e)}), 500


@servicios_bp.route('/', methods=['POST'])
@jwt_required()
def crearServicio():
    data = request.get_json()

    required_fields = ['nombre', 'precio']
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == '':
            return jsonify({'error': f"El campo '{field}' es requerido y no puede estar vacío."}), 400

    existe = Servicio.query.filter_by(nombre=data['nombre']).first()
    if existe:
        return jsonify({'error': f"El servicio '{data['nombre']}' ya existe."}), 409

    try:
        servicio = Servicio(
            nombre=data['nombre'],
            precio=data['precio']
        )
        db.session.add(servicio)
        db.session.commit()

        return jsonify({'message': 'El servicio se registró correctamente'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor al registrar el servicio.', 'detalle': str(e)}), 500


@servicios_bp.route('/<int:id_servicio>', methods=['PUT'])
@jwt_required()
def editarServicio(id_servicio):
    data = request.get_json()

    required_fields = ['nombre', 'precio', 'estado']
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == '':
            return jsonify({'error': f"El campo '{field}' es requerido y no puede estar vacío."}), 400

    servicio = Servicio.query.get(id_servicio)
    if not servicio:
        return jsonify({'error': 'Servicio no encontrado.'}), 404

    try:
        servicio.nombre = data['nombre']
        servicio.precio = data['precio']
        servicio.estado = data['estado']

        db.session.commit()

        return jsonify({'message': 'El servicio se editó correctamente'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor al editar el servicio.', 'detalle': str(e)}), 500

