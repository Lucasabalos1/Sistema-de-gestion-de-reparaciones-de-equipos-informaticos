import os
from datetime import timedelta

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default_key_para_pruebas_locales')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        f"sqlite:///{os.path.abspath(os.path.join(basedir, '..', 'instance', 'reparaciones.db'))}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'default_jwt_key_para_pruebas_locales')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)