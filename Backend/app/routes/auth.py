from datetime import datetime, timezone

from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt,
    get_jwt_identity,
)
from app.extensions import db, limiter
from app.models import Administrador, TokenBlocklist

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    data = request.get_json()

    if not data or not data.get('usuario') or not data.get('contraseña'):
        return jsonify({'message': 'Usuario y contraseña son requeridos'}), 400

    admin = Administrador.query.filter_by(usuario=data['usuario']).first()

    if not admin:
        return jsonify({'message': 'Credenciales inválidas'}), 401

    if not check_password_hash(admin.contraseña, data['contraseña']):
        return jsonify({'message': 'Credenciales inválidas'}), 401

    access_token = create_access_token(identity=str(admin.admin_id))
    refresh_token = create_refresh_token(identity=str(admin.admin_id))

    return jsonify({
        'token': access_token,
        'refresh_token': refresh_token,
        'usuario': {
            'admin_id': admin.admin_id,
            'usuario': admin.usuario,
            'nombre': admin.nombre,
            'apellido': admin.apellido,
            'genero': admin.genero
        }
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@limiter.limit("10 per minute")
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    nuevo_token = create_access_token(identity=identity)
    return jsonify({'token': nuevo_token}), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    revocado = TokenBlocklist(
        jti=jti,
        created_at=datetime.now(timezone.utc)
    )
    db.session.add(revocado)
    db.session.commit()
    return jsonify({'message': 'Sesión cerrada correctamente.'}), 200
