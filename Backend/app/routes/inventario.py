from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Inventario
from app.utils.csv_utils import procesar_csv_inventario

inventario_bp = Blueprint('inventario', __name__)


@inventario_bp.route('/', methods=['GET'])
@jwt_required()
def obtenerInventario():
    try:
        inventario = Inventario.query.all()

        if not inventario:
            return jsonify({'message': 'No hay repuestos en el inventario'}), 404

        resultado = []
        for item in inventario:
            resultado.append({
                'repuesto_id': item.repuesto_id,
                'admin_id': item.admin_id,
                'nombre': item.nombre,
                'stock': item.stock,
                'precio_unidad': item.precio_unidad
            })

        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({'error': 'Error interno del servidor al consultar el inventario.', 'detalle': str(e)}), 500


@inventario_bp.route('/', methods=['POST'])
@jwt_required()
def cargarInventario():
    data = request.get_json()

    required_fields = ['admin_id', 'nombre', 'stock', 'precio_unidad']
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == '':
            return jsonify({'error': f"El campo '{field}' es requerido y no puede estar vacío."}), 400

    if data['precio_unidad'] <= 0:
        return jsonify({'error': "El campo 'precio_unidad' debe ser mayor a 0."}), 400

    if data['stock'] < 0:
        return jsonify({'error': "El campo 'stock' debe ser mayor o igual a 0."}), 400

    existe = Inventario.query.filter_by(nombre=data['nombre']).first()
    if existe:
        return jsonify({'error': f"El repuesto '{data['nombre']}' ya existe en el inventario."}), 409

    try:
        inventario = Inventario(
            admin_id=data['admin_id'],
            nombre=data['nombre'],
            stock=data['stock'],
            precio_unidad=data['precio_unidad']
        )
        db.session.add(inventario)
        db.session.commit()

        return jsonify({'message': 'El repuesto se registró correctamente'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor al registrar el repuesto.', 'detalle': str(e)}), 500


@inventario_bp.route('/<string:nombre_inventario>', methods=['GET'])
@jwt_required()
def obtenerInventarioPorNombre(nombre_inventario):
    try:
        if not nombre_inventario or nombre_inventario.strip() == '':
            return jsonify({'error': 'El nombre del repuesto no puede estar vacío.'}), 400

        inventario = Inventario.query.filter(
            Inventario.nombre.like(f'%{nombre_inventario}%')
        ).all()

        if not inventario:
            return jsonify({'message': 'No se encontraron repuestos con ese nombre.'}), 404

        resultado = []
        for item in inventario:
            resultado.append({
                'repuesto_id': item.repuesto_id,
                'admin_id': item.admin_id,
                'nombre': item.nombre,
                'stock': item.stock,
                'precio_unidad': item.precio_unidad
            })

        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({'error': 'Error interno del servidor al buscar el repuesto.', 'detalle': str(e)}), 500


@inventario_bp.route('/<int:id_inventario>', methods=['PUT'])
@jwt_required()
def editarInventario(id_inventario):
    data = request.get_json()

    required_fields = ['admin_id', 'nombre', 'stock', 'precio_unidad']
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == '':
            return jsonify({'error': f"El campo '{field}' es requerido y no puede estar vacío."}), 400

    if data['stock'] < 0:
        return jsonify({'error': "El campo 'stock' debe ser mayor o igual a 0."}), 400

    if data['precio_unidad'] <= 0:
        return jsonify({'error': "El campo 'precio_unidad' debe ser mayor a 0."}), 400

    existe = Inventario.query.filter_by(nombre=data['nombre']).first()
    if existe and existe.repuesto_id != id_inventario:
        return jsonify({'error': f"El repuesto '{data['nombre']}' ya existe en el inventario."}), 409

    inventario = Inventario.query.get(id_inventario)
    if not inventario:
        return jsonify({'error': 'Repuesto no encontrado.'}), 404

    try:
        inventario.admin_id = data['admin_id']
        inventario.nombre = data['nombre']
        inventario.stock = data['stock']
        inventario.precio_unidad = data['precio_unidad']

        db.session.commit()

        return jsonify({'message': 'El repuesto se editó correctamente'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor al editar el repuesto.', 'detalle': str(e)}), 500


@inventario_bp.route('/csv', methods=['POST'])
@jwt_required()
def cargarInventarioPorCsv():
    archivo = request.files.get('archivo')

    if not archivo:
        return jsonify({'error': 'No se recibió el archivo CSV.'}), 400

    if not archivo.filename or archivo.filename.strip() == '':
        return jsonify({'error': 'El archivo no tiene nombre.'}), 400

    if not archivo.filename.lower().endswith('.csv'):
        return jsonify({'error': 'El archivo debe ser un CSV.'}), 400

    try:
        admin_id = int(get_jwt_identity())
        archivo.stream.seek(0)
        filas = procesar_csv_inventario(archivo.stream)

        if not filas:
            return jsonify({'message': 'El CSV no contiene filas válidas.'}), 400

        for fila in filas:
            existe = Inventario.query.filter_by(nombre=fila['nombre']).first()

            if existe:
                existe.stock = fila['stock']
                existe.precio_unidad = fila['precio_unidad']
            else:
                inventario = Inventario(
                    admin_id=admin_id,
                    nombre=fila['nombre'],
                    stock=fila['stock'],
                    precio_unidad=fila['precio_unidad']
                )
                db.session.add(inventario)

        db.session.commit()

        return jsonify({'message': 'El inventario se cargó correctamente'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor al cargar el inventario.', 'detalle': str(e)}), 500

