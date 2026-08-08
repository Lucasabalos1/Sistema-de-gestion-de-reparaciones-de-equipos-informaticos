from datetime import date
from app.extensions import db


class Administrador(db.Model):
    __tablename__ = 'administrador'

    admin_id = db.Column(db.Integer, primary_key=True)
    usuario = db.Column(db.String(50), nullable=False)
    contraseña = db.Column(db.Text, nullable=False)
    nombre = db.Column(db.String(32), nullable=False)
    apellido = db.Column(db.String(32), nullable=False)
    genero = db.Column(db.String(24), nullable=False)

    inventarios = db.relationship('Inventario', backref='administrador', lazy=True)
    clientes = db.relationship('Cliente', backref='administrador', lazy=True)


class Inventario(db.Model):
    __tablename__ = 'inventario'

    repuesto_id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('administrador.admin_id'), nullable=False)
    nombre = db.Column(db.String(64), nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    precio_unidad = db.Column(db.Integer, nullable=False)


class Cliente(db.Model):
    __tablename__ = 'cliente'

    cliente_id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('administrador.admin_id'), nullable=False)
    nombre = db.Column(db.String(32), nullable=False)
    apellido = db.Column(db.String(32), nullable=True)
    telefono = db.Column(db.String(16), nullable=False)
    correo = db.Column(db.String(32), nullable=True)
    genero = db.Column(db.String(24), nullable=True)

    turnos = db.relationship('Turno', backref='cliente', lazy=True)


class Turno(db.Model):
    __tablename__ = 'turno'

    turno_id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('cliente.cliente_id'), nullable=False)
    titulo = db.Column(db.String(64), nullable=False)
    descripcion = db.Column(db.String(255), nullable=False)
    fecha_entrada = db.Column(db.Date, nullable=False, default=date.today)
    fecha_salida = db.Column(db.Date, nullable=True)
    extras = db.Column(db.String(255), nullable=True)
    estado_comercial = db.Column(db.String(32), nullable=False)
    estado_tecnico = db.Column(db.String(32), nullable=False)
    cancelado = db.Column(db.Boolean, nullable=False, default=False)

    detalles = db.relationship('Turno_Detalle', backref='turno', lazy=True)


class Servicio(db.Model):
    __tablename__ = 'servicio'

    servicio_id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(32), nullable=False)
    precio = db.Column(db.Integer, nullable=False)
    estado = db.Column(db.Boolean, nullable=False, default=True)

    detalles = db.relationship('Turno_Detalle', backref='servicio', lazy=True)


class Turno_Detalle(db.Model):
    __tablename__ = 'turno_detalle'

    turno_servicio_id = db.Column(db.Integer, primary_key=True)
    turno_id = db.Column(db.Integer, db.ForeignKey('turno.turno_id'), nullable=False)
    servicio_id = db.Column(db.Integer, db.ForeignKey('servicio.servicio_id'), nullable=False)
    precio_historico = db.Column(db.Integer, nullable=False)


class Consulta_Telegram(db.Model):
    __tablename__ = 'consulta_telegram'

    consulta_id = db.Column(db.Integer, primary_key=True)
    chat_id_telegram = db.Column(db.BigInteger, nullable=False)
    nombre_telegram = db.Column(db.String(64), nullable=False)
    telefono = db.Column(db.String(16), nullable=False)
    fecha_recepcion = db.Column(db.Date, nullable=False, default=date.today)
    resumen_ia = db.Column(db.Text, nullable=True)
    mensaje_original = db.Column(db.Text, nullable=False)
    leido = db.Column(db.Boolean, nullable=False, default=False)
