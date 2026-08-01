import pytest
from datetime import timedelta
from app import create_app
from app.extensions import db as _db
from app.models import Administrador


class TestConfig:
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'test_secret_key'
    JWT_SECRET_KEY = 'test_jwt_secret_key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    NOTIFICATION_API_KEY = 'n8n_bytemend_test_key_2026'


@pytest.fixture(scope='session')
def app():
    application = create_app(config_class=TestConfig)
    with application.app_context():
        _db.create_all()
        yield application
        _db.drop_all()


@pytest.fixture(autouse=True)
def setup_db(app):
    with app.app_context():
        _db.session.rollback()
        from sqlalchemy import text
        _db.session.execute(text("DELETE FROM turno_detalle"))
        _db.session.execute(text("DELETE FROM turno"))
        _db.session.execute(text("DELETE FROM servicio"))
        _db.session.execute(text("DELETE FROM cliente"))
        _db.session.execute(text("DELETE FROM inventario"))
        _db.session.execute(text("DELETE FROM administrador"))
        _db.session.execute(text("DELETE FROM consulta_telegram"))
        _db.session.commit()
        yield
        _db.session.rollback()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def db(app):
    return _db


def create_test_admin(db):
    from werkzeug.security import generate_password_hash
    admin = Administrador(
        usuario='admin_test',
        contraseña=generate_password_hash('password123'),
        nombre='Juan',
        apellido='Perez',
        genero='Masculino'
    )
    db.session.add(admin)
    db.session.commit()
    return admin


def get_auth_headers(client, db):
    from flask_jwt_extended import create_access_token
    admin = create_test_admin(db)
    token = create_access_token(identity=str(admin.admin_id))
    return {'Authorization': f'Bearer {token}'}
