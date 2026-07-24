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

    # Ruta de prueba base
    @app.route('/')
    def index():
        return jsonify({'message': 'Backend de reparaciones funcionando correctamente'})

    return app