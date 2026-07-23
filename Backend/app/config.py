import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default_key_para_pruebas_locales')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        f"sqlite:///{os.path.abspath(os.path.join(basedir, '..', 'instance', 'reparaciones.db'))}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False