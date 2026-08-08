from flask import Flask, jsonify
from app.config import Config
from app.extensions import db, cors, jwt

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    cors.init_app(app)
    jwt.init_app(app)

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

    # Ruta de prueba base
    @app.route('/')
    def index():
        return jsonify({'message': 'Backend de reparaciones funcionando correctamente'})

    return app