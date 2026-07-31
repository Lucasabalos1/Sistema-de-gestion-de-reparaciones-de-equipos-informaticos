from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models import Cliente

clientes_bp = Blueprint('clientes', __name__)


@clientes_bp.route('/', methods=['GET'])
@jwt_required()
def obtenerClientes():
    try:
        clientes = Cliente.query.all()

        if not clientes:
            return jsonify({'message': 'No hay clientes registrados'}), 404

        resultado = []
        for c in clientes:
            resultado.append({
                'cliente_id': c.cliente_id,
                'admin_id': c.admin_id,
                'nombre': c.nombre,
                'apellido': c.apellido if c.apellido else "",
                'telefono': c.telefono,
                'correo': c.correo if c.correo else "No hay datos por el momento",
                'genero': c.genero if c.genero else "No hay datos por el momento"
            })

        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({'error': 'Error interno del servidor al consultar clientes.', 'detalle': str(e)}), 500


@clientes_bp.route('/', methods=['POST'])
@jwt_required()
def crearCliente():
    data = request.get_json()

    required_fields = ['admin_id', 'nombre', 'telefono']
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == '':
            return jsonify({'error': f"El campo '{field}' es requerido y no puede estar vacío."}), 400

    existe = Cliente.query.filter_by(telefono=data['telefono']).first()
    if existe:
        return jsonify({'error': f"El cliente con el teléfono {data['telefono']} ya existe."}), 409

    apellido = data.get('apellido') or ''
    correo = data.get('correo') or "No hay datos por el momento"
    genero = data.get('genero') or "No hay datos por el momento"

    try:
        cliente = Cliente(
            admin_id=data['admin_id'],
            nombre=data['nombre'],
            apellido=apellido,
            telefono=data['telefono'],
            correo=correo,
            genero=genero
        )
        db.session.add(cliente)
        db.session.commit()

        return jsonify({'message': 'El cliente se registró correctamente'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor al registrar el cliente.', 'detalle': str(e)}), 500


@clientes_bp.route('/<int:id_cliente>', methods=['PUT'])
@jwt_required()
def editarCliente(id_cliente):
    data = request.get_json()

    required_fields = ['admin_id', 'nombre', 'telefono']
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == '':
            return jsonify({'error': f"El campo '{field}' es requerido y no puede estar vacío."}), 400

    existe = Cliente.query.filter_by(telefono=data['telefono']).first()
    if existe and existe.cliente_id != id_cliente:
        return jsonify({'error': f"El teléfono {data['telefono']} ya está registrado por otro cliente."}), 409

    cliente = Cliente.query.get(id_cliente)
    if not cliente:
        return jsonify({'error': 'Cliente no encontrado.'}), 404

    apellido = data.get('apellido') or ''
    correo = data.get('correo') or "No hay datos por el momento"
    genero = data.get('genero') or "No hay datos por el momento"

    try:
        cliente.admin_id = data['admin_id']
        cliente.nombre = data['nombre']
        cliente.apellido = apellido
        cliente.telefono = data['telefono']
        cliente.correo = correo
        cliente.genero = genero

        db.session.commit()

        return jsonify({'message': 'El cliente se editó correctamente'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor al editar el cliente.', 'detalle': str(e)}), 500


@clientes_bp.route('/<int:id_cliente>', methods=['DELETE'])
@jwt_required()
def eliminarCliente(id_cliente):
    cliente = Cliente.query.get(id_cliente)
    if not cliente:
        return jsonify({'error': 'Cliente no encontrado.'}), 404

    try:
        db.session.delete(cliente)
        db.session.commit()

        return jsonify({'message': 'El cliente se eliminó correctamente'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor al eliminar el cliente.', 'detalle': str(e)}), 500


@clientes_bp.route('/<string:telefono_cliente>', methods=['GET'])
@jwt_required()
def obtenerCliente(telefono_cliente):
    try:
        if not telefono_cliente or telefono_cliente.strip() == '':
            return jsonify({'error': 'El teléfono del cliente no puede estar vacío.'}), 400

        cliente = Cliente.query.filter_by(telefono=telefono_cliente).first()

        if not cliente:
            return jsonify({'message': 'No se encontró un cliente con ese teléfono.'}), 404

        return jsonify({
            'cliente_id': cliente.cliente_id,
            'admin_id': cliente.admin_id,
            'nombre': cliente.nombre,
            'apellido': cliente.apellido if cliente.apellido else "",
            'telefono': cliente.telefono,
            'correo': cliente.correo if cliente.correo else "No hay datos por el momento",
            'genero': cliente.genero if cliente.genero else "No hay datos por el momento"
        }), 200

    except Exception as e:
        return jsonify({'error': 'Error interno del servidor al buscar el cliente.', 'detalle': str(e)}), 500

