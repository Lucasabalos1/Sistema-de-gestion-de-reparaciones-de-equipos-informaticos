import os
from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException
from app.config import Config
from app.extensions import db, cors, jwt, limiter
from app.logging_config import setup_logging

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    setup_logging(app)
    db.init_app(app)
    origins = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')
    cors.init_app(app, origins=origins)
    jwt.init_app(app)
    app.config["RATELIMIT_DEFAULT"] = os.environ.get('RATELIMIT_DEFAULT', '60 per minute')
    limiter.init_app(app)

    from app.models import TokenBlocklist

    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload["jti"]
        return db.session.query(TokenBlocklist.id).filter_by(jti=jti).first() is not None

    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    from app.routes.notificaciones import notificaciones_bp
    app.register_blueprint(notificaciones_bp, url_prefix='/api/notificaciones')

    from app.routes.clientes import clientes_bp
    app.register_blueprint(clientes_bp, url_prefix='/api/clientes')

    from app.routes.servicios import servicios_bp
    app.register_blueprint(servicios_bp, url_prefix='/api/servicios')

    from app.routes.inventario import inventario_bp
    app.register_blueprint(inventario_bp, url_prefix='/api/inventario')

    from app.routes.turnos import turnos_bp
    app.register_blueprint(turnos_bp, url_prefix='/api/turnos')

    from app.routes.metricas import metricas_bp
    app.register_blueprint(metricas_bp, url_prefix='/api/metricas')

    from app.routes.dashboard import dashboard_bp
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

    # Ruta de prueba base
    @app.route('/')
    def index():
        return jsonify({'message': 'Backend de reparaciones funcionando correctamente'})

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({'error': 'Solicitud inválida.'}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({'error': 'No autorizado.'}), 401

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Recurso no encontrado.'}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({'error': 'Método no permitido.'}), 405

    @app.errorhandler(413)
    def payload_too_large(e):
        return jsonify({'error': 'El tamaño de la solicitud excede el límite permitido.'}), 413

    @app.errorhandler(429)
    def too_many_requests(e):
        return jsonify({'error': 'Demasiadas solicitudes. Intente nuevamente más tarde.'}), 429

    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        return jsonify({'error': e.description}), e.code or 500

    @app.errorhandler(Exception)
    def handle_unhandled_exception(e):
        app.logger.error(f"Excepción no manejada: {e}", exc_info=True)
        return jsonify({'error': 'Error interno del servidor.'}), 500

    return app