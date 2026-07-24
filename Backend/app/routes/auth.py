from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token
from app.models import Administrador

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('usuario') or not data.get('contraseña'):
        return jsonify({'message': 'Usuario y contraseña son requeridos'}), 400

    admin = Administrador.query.filter_by(usuario=data['usuario']).first()

    if not admin:
        return jsonify({'message': 'Credenciales inválidas'}), 401

    if not check_password_hash(admin.contraseña, data['contraseña']):
        return jsonify({'message': 'Credenciales inválidas'}), 401

    token = create_access_token(identity=str(admin.admin_id))

    return jsonify({
        'token': token,
        'usuario': {
            'admin_id': admin.admin_id,
            'usuario': admin.usuario,
            'nombre': admin.nombre,
            'apellido': admin.apellido,
            'genero': admin.genero
        }
    }), 200
