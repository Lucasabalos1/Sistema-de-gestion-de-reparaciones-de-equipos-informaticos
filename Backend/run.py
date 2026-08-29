import os
from dotenv import load_dotenv
load_dotenv()

missing = [var for var in ('SECRET_KEY', 'JWT_SECRET_KEY', 'NOTIFICATION_API_KEY') if not os.environ.get(var)]
if missing:
    raise RuntimeError(f"Faltan variables de entorno obligatorias en .env: {', '.join(missing)}")

from app import create_app
from app.extensions import db

app = create_app()

with app.app_context():
    from app import models
    db.create_all()

    if models.Administrador.query.count() == 0:
        from werkzeug.security import generate_password_hash
        admin = models.Administrador(
            usuario=os.environ.get('SEED_ADMIN_USER', 'admin'),
            contraseña=generate_password_hash(os.environ.get('SEED_ADMIN_PASS', 'admin')),
            nombre=os.environ.get('SEED_ADMIN_NOMBRE', 'Admin'),
            apellido=os.environ.get('SEED_ADMIN_APELLIDO', 'Demo'),
            genero='Masculino'
        )
        db.session.add(admin)
        db.session.commit()

if __name__ == '__main__':
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(debug=debug)