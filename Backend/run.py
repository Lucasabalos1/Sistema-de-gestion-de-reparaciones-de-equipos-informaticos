from app import create_app
from app.extensions import db

app = create_app()

with app.app_context():
    from app import models
    db.create_all()

    if models.Administrador.query.count() == 0:
        from werkzeug.security import generate_password_hash
        admin = models.Administrador(
            usuario='Lukacha531',
            contraseña=generate_password_hash('adminabalos1357'),
            nombre='Lucas',
            apellido='Abalos',
            genero='Masculino'
        )
        db.session.add(admin)
        db.session.commit()

if __name__ == '__main__':
    app.run(debug=True)
