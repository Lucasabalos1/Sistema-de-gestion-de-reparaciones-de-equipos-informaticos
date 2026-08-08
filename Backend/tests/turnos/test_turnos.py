import json
from datetime import date, timedelta

from tests.conftest import get_auth_headers
from app.models import Turno, Turno_Detalle, Cliente, Servicio
from app.routes.turnos import ESTADOS_TECNICOS, ESTADOS_COMERCIALES


def crear_cliente_db(db, **kwargs):
    defaults = {
        'admin_id': 1,
        'nombre': 'Ana',
        'apellido': 'Gomez',
        'telefono': '1111'
    }
    defaults.update(kwargs)
    cliente = Cliente(**defaults)
    db.session.add(cliente)
    db.session.commit()
    return cliente


def crear_servicio_db(db, **kwargs):
    defaults = {
        'nombre': 'Formateo',
        'precio': 15000
    }
    defaults.update(kwargs)
    servicio = Servicio(**defaults)
    db.session.add(servicio)
    db.session.commit()
    return servicio


def crear_turno_db(db, cliente_id, **kwargs):
    defaults = {
        'cliente_id': cliente_id,
        'titulo': 'PC rota',
        'descripcion': 'No enciende',
        'extras': None,
        'estado_comercial': 'No pagado',
        'estado_tecnico': 'En espera'
    }
    defaults.update(kwargs)
    turno = Turno(**defaults)
    db.session.add(turno)
    db.session.commit()
    return turno


def crear_detalle_db(db, turno, servicio):
    detalle = Turno_Detalle(
        turno_id=turno.turno_id,
        servicio_id=servicio.servicio_id,
        precio_historico=servicio.precio
    )
    db.session.add(detalle)
    db.session.commit()
    return detalle


# ──────────────────────────────────────────────
# Tests: GET /api/turnos/
# ──────────────────────────────────────────────

def test_obtener_turnos_sin_token(client):
    response = client.get('/api/turnos/')
    assert response.status_code == 401


def test_obtener_turnos_vacio(client, db):
    headers = get_auth_headers(client, db)
    response = client.get('/api/turnos/', headers=headers)
    assert response.status_code == 200
    data = response.get_json()
    assert set(data.keys()) == set(ESTADOS_TECNICOS)
    for estado in ESTADOS_TECNICOS:
        assert data[estado] == []


def test_obtener_turnos_agrupa_por_estado(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    crear_turno_db(db, cliente.cliente_id, titulo='A', estado_tecnico='En espera')
    crear_turno_db(db, cliente.cliente_id, titulo='B', estado_tecnico='Reparando')
    crear_turno_db(db, cliente.cliente_id, titulo='C', estado_tecnico='Reparado')
    response = client.get('/api/turnos/', headers=headers)
    assert response.status_code == 200
    data = response.get_json()
    assert [t['titulo'] for t in data['En espera']] == ['A']
    assert [t['titulo'] for t in data['Reparando']] == ['B']
    assert [t['titulo'] for t in data['Reparado']] == ['C']
    assert data['En espera de stock'] == []
    assert data['Sin solución'] == []


def test_obtener_turnos_incluye_cancelados(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    crear_turno_db(db, cliente.cliente_id, titulo='Cancelado', estado_tecnico='Reparando', cancelado=True)
    response = client.get('/api/turnos/', headers=headers)
    data = response.get_json()
    assert data['Reparando'][0]['titulo'] == 'Cancelado'
    assert data['Reparando'][0]['cancelado'] is True


def test_obtener_turnos_mapeo_completo(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db, nombre='Carlos', apellido='Lopez', telefono='9999')
    servicio1 = crear_servicio_db(db, nombre='Formateo', precio=15000)
    servicio2 = crear_servicio_db(db, nombre='Limpieza', precio=5000)
    turno = crear_turno_db(db, cliente.cliente_id, extras='Cambio flex', estado_comercial='Pagado')
    crear_detalle_db(db, turno, servicio1)
    crear_detalle_db(db, turno, servicio2)

    response = client.get('/api/turnos/', headers=headers)
    data = response.get_json()
    turno_data = data['En espera'][0]

    assert set(turno_data.keys()) == {
        'turno_id', 'cliente_id', 'titulo', 'descripcion', 'fecha_entrada',
        'fecha_salida', 'extras', 'estado_comercial', 'estado_tecnico', 'cancelado',
        'cliente_nombre', 'cliente_apellido', 'telefono', 'servicios', 'total'
    }
    assert turno_data['cliente_nombre'] == 'Carlos'
    assert turno_data['cliente_apellido'] == 'Lopez'
    assert turno_data['telefono'] == '9999'
    assert turno_data['extras'] == 'Cambio flex'
    assert turno_data['total'] == 20000
    assert len(turno_data['servicios']) == 2
    assert {s['nombre'] for s in turno_data['servicios']} == {'Formateo', 'Limpieza'}
    assert {s['precio_historico'] for s in turno_data['servicios']} == {15000, 5000}


def test_obtener_turnos_nulos_como_sin_datos(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    crear_turno_db(db, cliente.cliente_id, extras=None, fecha_salida=None)
    response = client.get('/api/turnos/', headers=headers)
    turno_data = response.get_json()['En espera'][0]
    assert turno_data['extras'] == 'Sin datos'
    assert turno_data['fecha_salida'] == 'Sin datos'


def test_obtener_turnos_sin_servicios_lista_vacia(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    crear_turno_db(db, cliente.cliente_id)
    response = client.get('/api/turnos/', headers=headers)
    turno_data = response.get_json()['En espera'][0]
    assert turno_data['servicios'] == []
    assert turno_data['total'] == 0


def test_obtener_turnos_reparando_reciente_se_incluye(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    crear_turno_db(db, cliente.cliente_id, titulo='Reciente', estado_tecnico='Reparando',
                   fecha_entrada=date.today())
    response = client.get('/api/turnos/', headers=headers)
    data = response.get_json()
    assert [t['titulo'] for t in data['Reparando']] == ['Reciente']


def test_obtener_turnos_reparando_viejo_se_excluye(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    crear_turno_db(db, cliente.cliente_id, titulo='Viejo', estado_tecnico='Reparando',
                   fecha_entrada=date.today() - timedelta(days=10))
    response = client.get('/api/turnos/', headers=headers)
    data = response.get_json()
    assert data['Reparando'] == []


def test_obtener_turnos_sin_solucion_limite_semana(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    crear_turno_db(db, cliente.cliente_id, titulo='Sin sol reciente', estado_tecnico='Sin solución',
                   fecha_entrada=date.today() - timedelta(days=3))
    crear_turno_db(db, cliente.cliente_id, titulo='Sin sol viejo', estado_tecnico='Sin solución',
                   fecha_entrada=date.today() - timedelta(days=20))
    response = client.get('/api/turnos/', headers=headers)
    data = response.get_json()
    assert [t['titulo'] for t in data['Sin solución']] == ['Sin sol reciente']


def test_obtener_turnos_limite_semana_no_afecta_otros_estados(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    crear_turno_db(db, cliente.cliente_id, titulo='Espera viejo', estado_tecnico='En espera',
                   fecha_entrada=date.today() - timedelta(days=60))
    crear_turno_db(db, cliente.cliente_id, titulo='Reparado viejo', estado_tecnico='Reparado',
                   fecha_entrada=date.today() - timedelta(days=60))
    crear_turno_db(db, cliente.cliente_id, titulo='Stock viejo', estado_tecnico='En espera de stock',
                   fecha_entrada=date.today() - timedelta(days=60))
    response = client.get('/api/turnos/', headers=headers)
    data = response.get_json()
    assert [t['titulo'] for t in data['En espera']] == ['Espera viejo']
    assert [t['titulo'] for t in data['Reparado']] == ['Reparado viejo']
    assert [t['titulo'] for t in data['En espera de stock']] == ['Stock viejo']


# ──────────────────────────────────────────────
# Tests: GET /api/turnos/historial
# ──────────────────────────────────────────────

def test_obtener_historial_sin_token(client):
    response = client.get('/api/turnos/historial')
    assert response.status_code == 401


def test_obtener_historial_vacio(client, db):
    headers = get_auth_headers(client, db)
    response = client.get('/api/turnos/historial', headers=headers)
    assert response.status_code == 404
    assert response.get_json()['message'] == 'No hay turnos en el historial'


def test_obtener_historial_filtra_estados_finales_y_cancelados(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    crear_turno_db(db, cliente.cliente_id, titulo='Reparado', estado_tecnico='Reparado')
    crear_turno_db(db, cliente.cliente_id, titulo='Sin solucion', estado_tecnico='Sin solución')
    crear_turno_db(db, cliente.cliente_id, titulo='Cancelado', estado_tecnico='Reparando', cancelado=True)
    crear_turno_db(db, cliente.cliente_id, titulo='En espera', estado_tecnico='En espera')
    crear_turno_db(db, cliente.cliente_id, titulo='Reparando', estado_tecnico='Reparando')

    response = client.get('/api/turnos/historial', headers=headers)
    assert response.status_code == 200
    titulos = {t['titulo'] for t in response.get_json()}
    assert titulos == {'Reparado', 'Sin solucion', 'Cancelado'}
    assert 'En espera' not in titulos
    assert 'Reparando' not in titulos


def test_obtener_historial_mapea_con_servicios_y_total(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    servicio = crear_servicio_db(db, precio=10000)
    turno = crear_turno_db(db, cliente.cliente_id, titulo='Reparado', estado_tecnico='Reparado')
    crear_detalle_db(db, turno, servicio)

    response = client.get('/api/turnos/historial', headers=headers)
    data = response.get_json()
    assert len(data) == 1
    assert data[0]['titulo'] == 'Reparado'
    assert data[0]['total'] == 10000
    assert data[0]['servicios'][0]['nombre'] == 'Formateo'


# ──────────────────────────────────────────────
# Tests: POST /api/turnos/
# ──────────────────────────────────────────────

def test_crear_turno_sin_token(client, db):
    response = client.post('/api/turnos/', json={
        'cliente_id': 1,
        'titulo': 'PC',
        'descripcion': 'x',
        'estado_comercial': 'No pagado',
        'estado_tecnico': 'En espera',
        'servicios': [1]
    })
    assert response.status_code == 401


def test_crear_turno_campo_faltante(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    servicio = crear_servicio_db(db)
    response = client.post('/api/turnos/', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'descripcion': 'x',
        'estado_comercial': 'No pagado',
        'estado_tecnico': 'En espera',
        'servicios': [servicio.servicio_id]
    })
    assert response.status_code == 400
    assert "El campo 'titulo' es requerido" in response.get_json()['error']


def test_crear_turno_cliente_inexistente(client, db):
    headers = get_auth_headers(client, db)
    servicio = crear_servicio_db(db)
    response = client.post('/api/turnos/', headers=headers, json={
        'cliente_id': 9999,
        'titulo': 'PC',
        'descripcion': 'x',
        'estado_comercial': 'No pagado',
        'estado_tecnico': 'En espera',
        'servicios': [servicio.servicio_id]
    })
    assert response.status_code == 404
    assert response.get_json()['error'] == 'Cliente no encontrado.'


def test_crear_turno_servicios_vacio(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    response = client.post('/api/turnos/', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'PC',
        'descripcion': 'x',
        'estado_comercial': 'No pagado',
        'estado_tecnico': 'En espera',
        'servicios': []
    })
    assert response.status_code == 400
    assert response.get_json()['error'] == 'La lista de servicios no puede estar vacía.'


def test_crear_turno_servicios_duplicados(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    servicio = crear_servicio_db(db)
    response = client.post('/api/turnos/', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'PC',
        'descripcion': 'x',
        'estado_comercial': 'No pagado',
        'estado_tecnico': 'En espera',
        'servicios': [servicio.servicio_id, servicio.servicio_id]
    })
    assert response.status_code == 400
    assert response.get_json()['error'] == 'No se pueden asignar servicios duplicados.'


def test_crear_turno_servicio_inexistente(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    response = client.post('/api/turnos/', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'PC',
        'descripcion': 'x',
        'estado_comercial': 'No pagado',
        'estado_tecnico': 'En espera',
        'servicios': [9999]
    })
    assert response.status_code == 400
    assert "no existe o está inactivo" in response.get_json()['error']


def test_crear_turno_servicio_inactivo(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    servicio = crear_servicio_db(db, estado=False)
    response = client.post('/api/turnos/', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'PC',
        'descripcion': 'x',
        'estado_comercial': 'No pagado',
        'estado_tecnico': 'En espera',
        'servicios': [servicio.servicio_id]
    })
    assert response.status_code == 400
    assert "no existe o está inactivo" in response.get_json()['error']


def test_crear_turno_estado_comercial_invalido(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    servicio = crear_servicio_db(db)
    response = client.post('/api/turnos/', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'PC',
        'descripcion': 'x',
        'estado_comercial': 'Atrasado',
        'estado_tecnico': 'En espera',
        'servicios': [servicio.servicio_id]
    })
    assert response.status_code == 400
    assert "no es válido" in response.get_json()['error']


def test_crear_turno_estado_tecnico_invalido(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    servicio = crear_servicio_db(db)
    response = client.post('/api/turnos/', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'PC',
        'descripcion': 'x',
        'estado_comercial': 'No pagado',
        'estado_tecnico': 'Roto',
        'servicios': [servicio.servicio_id]
    })
    assert response.status_code == 400
    assert "no es válido" in response.get_json()['error']


def test_crear_turno_fecha_entrada_invalida(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    servicio = crear_servicio_db(db)
    response = client.post('/api/turnos/', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'PC',
        'descripcion': 'x',
        'fecha_entrada': 'no-es-fecha',
        'estado_comercial': 'No pagado',
        'estado_tecnico': 'En espera',
        'servicios': [servicio.servicio_id]
    })
    assert response.status_code == 400
    assert 'formato de fecha_entrada es inválido' in response.get_json()['error']


def test_crear_turno_exitoso(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    servicio = crear_servicio_db(db, precio=10000)
    response = client.post('/api/turnos/', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'PC rota',
        'descripcion': 'No enciende',
        'extras': 'Cambio fuente',
        'estado_comercial': 'No pagado',
        'estado_tecnico': 'En espera',
        'servicios': [servicio.servicio_id]
    })
    assert response.status_code == 201
    assert response.get_json()['message'] == 'El turno se registró correctamente'

    turno = Turno.query.first()
    assert turno is not None
    assert turno.titulo == 'PC rota'
    assert turno.extras == 'Cambio fuente'
    assert turno.cancelado is False
    assert turno.fecha_entrada == date.today()
    detalle = Turno_Detalle.query.filter_by(turno_id=turno.turno_id).first()
    assert detalle is not None
    assert detalle.precio_historico == 10000


def test_crear_turno_ignora_total_y_fecha_salida(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    servicio = crear_servicio_db(db, precio=10000)
    response = client.post('/api/turnos/', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'PC',
        'descripcion': 'x',
        'fecha_salida': '2026-01-01',
        'estado_comercial': 'No pagado',
        'estado_tecnico': 'En espera',
        'servicios': [servicio.servicio_id],
        'total': 99999
    })
    assert response.status_code == 201
    turno = Turno.query.first()
    assert turno.fecha_salida is None
    turno_data = client.get('/api/turnos/', headers=headers).get_json()['En espera'][0]
    assert turno_data['total'] == 10000


def test_crear_turno_con_fecha_entrada_personalizada(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    servicio = crear_servicio_db(db)
    response = client.post('/api/turnos/', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'PC',
        'descripcion': 'x',
        'fecha_entrada': '2026-06-15',
        'estado_comercial': 'No pagado',
        'estado_tecnico': 'En espera',
        'servicios': [servicio.servicio_id]
    })
    assert response.status_code == 201
    turno = Turno.query.first()
    assert turno.fecha_entrada == date(2026, 6, 15)


def test_crear_turno_sin_estados_usa_defaults(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    servicio = crear_servicio_db(db)
    response = client.post('/api/turnos/', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'PC',
        'descripcion': 'x',
        'servicios': [servicio.servicio_id]
    })
    assert response.status_code == 201
    turno = Turno.query.first()
    assert turno.estado_comercial == 'No pagado'
    assert turno.estado_tecnico == 'En espera'


def test_crear_turno_varios_servicios_precio_historico(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    s1 = crear_servicio_db(db, nombre='Formateo', precio=15000)
    s2 = crear_servicio_db(db, nombre='Limpieza', precio=5000)
    response = client.post('/api/turnos/', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'PC',
        'descripcion': 'x',
        'estado_comercial': 'No pagado',
        'estado_tecnico': 'En espera',
        'servicios': [s1.servicio_id, s2.servicio_id]
    })
    assert response.status_code == 201
    turno_data = client.get('/api/turnos/', headers=headers).get_json()['En espera'][0]
    assert turno_data['total'] == 20000
    assert len(turno_data['servicios']) == 2


# ──────────────────────────────────────────────
# Tests: PUT /api/turnos/<id>
# ──────────────────────────────────────────────

def test_editar_turno_sin_token(client, db):
    cliente = crear_cliente_db(db)
    turno = crear_turno_db(db, cliente.cliente_id)
    response = client.put(f'/api/turnos/{turno.turno_id}', json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'Nuevo',
        'descripcion': 'x',
        'estado_comercial': 'Pagado',
        'estado_tecnico': 'Reparando',
        'servicios': [1]
    })
    assert response.status_code == 401


def test_editar_turno_campo_faltante(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    turno = crear_turno_db(db, cliente.cliente_id)
    response = client.put(f'/api/turnos/{turno.turno_id}', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'Nuevo',
        'descripcion': 'x',
        'estado_comercial': 'Pagado',
        'estado_tecnico': 'Reparando'
    })
    assert response.status_code == 400
    assert "El campo 'servicios' es requerido" in response.get_json()['error']


def test_editar_turno_cliente_inexistente(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    turno = crear_turno_db(db, cliente.cliente_id)
    servicio = crear_servicio_db(db)
    response = client.put(f'/api/turnos/{turno.turno_id}', headers=headers, json={
        'cliente_id': 9999,
        'titulo': 'Nuevo',
        'descripcion': 'x',
        'estado_comercial': 'Pagado',
        'estado_tecnico': 'Reparando',
        'servicios': [servicio.servicio_id]
    })
    assert response.status_code == 404
    assert response.get_json()['error'] == 'Cliente no encontrado.'


def test_editar_turno_no_encontrado(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    servicio = crear_servicio_db(db)
    response = client.put('/api/turnos/9999', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'Nuevo',
        'descripcion': 'x',
        'estado_comercial': 'Pagado',
        'estado_tecnico': 'Reparando',
        'servicios': [servicio.servicio_id]
    })
    assert response.status_code == 404
    assert response.get_json()['error'] == 'Turno no encontrado.'


def test_editar_turno_cliente_no_editable(client, db):
    headers = get_auth_headers(client, db)
    cliente1 = crear_cliente_db(db, telefono='1111')
    cliente2 = crear_cliente_db(db, telefono='2222')
    turno = crear_turno_db(db, cliente1.cliente_id)
    servicio = crear_servicio_db(db)
    response = client.put(f'/api/turnos/{turno.turno_id}', headers=headers, json={
        'cliente_id': cliente2.cliente_id,
        'titulo': 'Nuevo',
        'descripcion': 'x',
        'estado_comercial': 'Pagado',
        'estado_tecnico': 'Reparando',
        'servicios': [servicio.servicio_id]
    })
    assert response.status_code == 404
    assert response.get_json()['error'] == 'El turno no pertenece al cliente indicado.'
    turno_db = Turno.query.get(turno.turno_id)
    assert turno_db.cliente_id == cliente1.cliente_id


def test_editar_turno_servicios_vacio(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    turno = crear_turno_db(db, cliente.cliente_id)
    response = client.put(f'/api/turnos/{turno.turno_id}', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'Nuevo',
        'descripcion': 'x',
        'estado_comercial': 'Pagado',
        'estado_tecnico': 'Reparando',
        'servicios': []
    })
    assert response.status_code == 400
    assert response.get_json()['error'] == 'La lista de servicios no puede estar vacía.'


def test_editar_turno_servicios_duplicados(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    turno = crear_turno_db(db, cliente.cliente_id)
    servicio = crear_servicio_db(db)
    response = client.put(f'/api/turnos/{turno.turno_id}', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'Nuevo',
        'descripcion': 'x',
        'estado_comercial': 'Pagado',
        'estado_tecnico': 'Reparando',
        'servicios': [servicio.servicio_id, servicio.servicio_id]
    })
    assert response.status_code == 400
    assert response.get_json()['error'] == 'No se pueden asignar servicios duplicados.'


def test_editar_turno_servicio_inactivo(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    turno = crear_turno_db(db, cliente.cliente_id)
    servicio = crear_servicio_db(db, estado=False)
    response = client.put(f'/api/turnos/{turno.turno_id}', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'Nuevo',
        'descripcion': 'x',
        'estado_comercial': 'Pagado',
        'estado_tecnico': 'Reparando',
        'servicios': [servicio.servicio_id]
    })
    assert response.status_code == 400
    assert "no existe o está inactivo" in response.get_json()['error']


def test_editar_turno_estado_invalido(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    turno = crear_turno_db(db, cliente.cliente_id)
    servicio = crear_servicio_db(db)
    response = client.put(f'/api/turnos/{turno.turno_id}', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'Nuevo',
        'descripcion': 'x',
        'estado_comercial': 'Pagado',
        'estado_tecnico': 'Roto',
        'servicios': [servicio.servicio_id]
    })
    assert response.status_code == 400
    assert "no es válido" in response.get_json()['error']


def test_editar_turno_exitoso_con_reconciliacion(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    s1 = crear_servicio_db(db, nombre='Formateo', precio=15000)
    s2 = crear_servicio_db(db, nombre='Limpieza', precio=5000)
    s3 = crear_servicio_db(db, nombre='Antivirus', precio=8000)
    turno = crear_turno_db(db, cliente.cliente_id, extras='Original')
    crear_detalle_db(db, turno, s1)
    crear_detalle_db(db, turno, s2)

    response = client.put(f'/api/turnos/{turno.turno_id}', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'PC arreglada',
        'descripcion': 'Nueva desc',
        'fecha_entrada': '2026-06-20',
        'extras': 'Actualizado',
        'estado_comercial': 'Pagado',
        'estado_tecnico': 'Reparando',
        'servicios': [s1.servicio_id, s3.servicio_id],
        'total': 1
    })
    assert response.status_code == 200
    assert response.get_json()['message'] == 'El turno se editó correctamente'

    turno_db = Turno.query.get(turno.turno_id)
    assert turno_db.titulo == 'PC arreglada'
    assert turno_db.extras == 'Actualizado'
    assert turno_db.fecha_entrada == date(2026, 6, 20)
    assert turno_db.estado_comercial == 'Pagado'

    detalles = Turno_Detalle.query.filter_by(turno_id=turno.turno_id).all()
    assert len(detalles) == 2
    servicios_ids = {d.servicio_id for d in detalles}
    assert servicios_ids == {s1.servicio_id, s3.servicio_id}
    assert all(d.precio_historico in (15000, 8000) for d in detalles)
    assert sum(d.precio_historico for d in detalles) == 23000

    turno_data = client.get('/api/turnos/', headers=headers).get_json()['Reparando']
    assert turno_data == []


def test_editar_turno_transicion_a_reparado_setea_fecha_salida(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    servicio = crear_servicio_db(db)
    turno = crear_turno_db(db, cliente.cliente_id, estado_tecnico='En espera')
    response = client.put(f'/api/turnos/{turno.turno_id}', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'PC',
        'descripcion': 'x',
        'estado_comercial': 'No pagado',
        'estado_tecnico': 'Reparado',
        'servicios': [servicio.servicio_id]
    })
    assert response.status_code == 200
    turno_db = Turno.query.get(turno.turno_id)
    assert turno_db.fecha_salida == date.today()


def test_editar_turno_ya_reparado_no_pisa_fecha_salida(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    servicio = crear_servicio_db(db)
    turno = crear_turno_db(db, cliente.cliente_id, estado_tecnico='Reparado', fecha_salida=date(2026, 7, 1))
    response = client.put(f'/api/turnos/{turno.turno_id}', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'PC',
        'descripcion': 'x',
        'estado_comercial': 'Pagado',
        'estado_tecnico': 'Reparado',
        'servicios': [servicio.servicio_id]
    })
    assert response.status_code == 200
    turno_db = Turno.query.get(turno.turno_id)
    assert turno_db.fecha_salida == date(2026, 7, 1)


def test_editar_turno_no_toca_cancelado(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    servicio = crear_servicio_db(db)
    turno = crear_turno_db(db, cliente.cliente_id)
    response = client.put(f'/api/turnos/{turno.turno_id}', headers=headers, json={
        'cliente_id': cliente.cliente_id,
        'titulo': 'PC',
        'descripcion': 'x',
        'estado_comercial': 'Pagado',
        'estado_tecnico': 'Reparando',
        'servicios': [servicio.servicio_id]
    })
    assert response.status_code == 200
    turno_db = Turno.query.get(turno.turno_id)
    assert turno_db.cancelado is False


# ──────────────────────────────────────────────
# Tests: PATCH /api/turnos/<id>/estado-comercial
# ──────────────────────────────────────────────

def test_editar_estado_comercial_sin_token(client, db):
    cliente = crear_cliente_db(db)
    turno = crear_turno_db(db, cliente.cliente_id)
    response = client.patch(f'/api/turnos/{turno.turno_id}/estado-comercial', json={'estado_comercial': 'Pagado'})
    assert response.status_code == 401


def test_editar_estado_comercial_no_encontrado(client, db):
    headers = get_auth_headers(client, db)
    response = client.patch('/api/turnos/9999/estado-comercial', headers=headers,
                            json={'estado_comercial': 'Pagado'})
    assert response.status_code == 404
    assert response.get_json()['error'] == 'Turno no encontrado.'


def test_editar_estado_comercial_vacio(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    turno = crear_turno_db(db, cliente.cliente_id)
    response = client.patch(f'/api/turnos/{turno.turno_id}/estado-comercial', headers=headers,
                            json={'estado_comercial': ''})
    assert response.status_code == 400


def test_editar_estado_comercial_invalido(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    turno = crear_turno_db(db, cliente.cliente_id)
    response = client.patch(f'/api/turnos/{turno.turno_id}/estado-comercial', headers=headers,
                            json={'estado_comercial': 'Atrasado'})
    assert response.status_code == 400
    assert "no es válido" in response.get_json()['error']


def test_editar_estado_comercial_exitoso(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    turno = crear_turno_db(db, cliente.cliente_id)
    response = client.patch(f'/api/turnos/{turno.turno_id}/estado-comercial', headers=headers,
                            json={'estado_comercial': 'Pagado'})
    assert response.status_code == 200
    assert response.get_json()['message'] == 'El estado comercial se actualizó correctamente'
    turno_db = Turno.query.get(turno.turno_id)
    assert turno_db.estado_comercial == 'Pagado'


# ──────────────────────────────────────────────
# Tests: PATCH /api/turnos/<id>/estado-tecnico
# ──────────────────────────────────────────────

def test_editar_estado_tecnico_sin_token(client, db):
    cliente = crear_cliente_db(db)
    turno = crear_turno_db(db, cliente.cliente_id)
    response = client.patch(f'/api/turnos/{turno.turno_id}/estado-tecnico', json={'estado_tecnico': 'Reparando'})
    assert response.status_code == 401


def test_editar_estado_tecnico_no_encontrado(client, db):
    headers = get_auth_headers(client, db)
    response = client.patch('/api/turnos/9999/estado-tecnico', headers=headers,
                            json={'estado_tecnico': 'Reparando'})
    assert response.status_code == 404


def test_editar_estado_tecnico_vacio(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    turno = crear_turno_db(db, cliente.cliente_id)
    response = client.patch(f'/api/turnos/{turno.turno_id}/estado-tecnico', headers=headers,
                            json={'estado_tecnico': ''})
    assert response.status_code == 400


def test_editar_estado_tecnico_invalido(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    turno = crear_turno_db(db, cliente.cliente_id)
    response = client.patch(f'/api/turnos/{turno.turno_id}/estado-tecnico', headers=headers,
                            json={'estado_tecnico': 'Roto'})
    assert response.status_code == 400
    assert "no es válido" in response.get_json()['error']


def test_editar_estado_tecnico_transicion_a_reparado(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    turno = crear_turno_db(db, cliente.cliente_id, estado_tecnico='En espera')
    response = client.patch(f'/api/turnos/{turno.turno_id}/estado-tecnico', headers=headers,
                            json={'estado_tecnico': 'Reparado'})
    assert response.status_code == 200
    turno_db = Turno.query.get(turno.turno_id)
    assert turno_db.estado_tecnico == 'Reparado'
    assert turno_db.fecha_salida == date.today()


def test_editar_estado_tecnico_sin_transicion_no_setea_fecha(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    turno = crear_turno_db(db, cliente.cliente_id, estado_tecnico='En espera')
    response = client.patch(f'/api/turnos/{turno.turno_id}/estado-tecnico', headers=headers,
                            json={'estado_tecnico': 'Reparando'})
    assert response.status_code == 200
    turno_db = Turno.query.get(turno.turno_id)
    assert turno_db.estado_tecnico == 'Reparando'
    assert turno_db.fecha_salida is None


def test_editar_estado_tecnico_ya_reparado_no_pisa_fecha(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    turno = crear_turno_db(db, cliente.cliente_id, estado_tecnico='Reparado', fecha_salida=date(2026, 7, 1))
    response = client.patch(f'/api/turnos/{turno.turno_id}/estado-tecnico', headers=headers,
                            json={'estado_tecnico': 'Reparado'})
    assert response.status_code == 200
    turno_db = Turno.query.get(turno.turno_id)
    assert turno_db.fecha_salida == date(2026, 7, 1)


# ──────────────────────────────────────────────
# Tests: PATCH /api/turnos/<id>/cancelar
# ──────────────────────────────────────────────

def test_cancelar_turno_sin_token(client, db):
    cliente = crear_cliente_db(db)
    turno = crear_turno_db(db, cliente.cliente_id)
    response = client.patch(f'/api/turnos/{turno.turno_id}/cancelar')
    assert response.status_code == 401


def test_cancelar_turno_no_encontrado(client, db):
    headers = get_auth_headers(client, db)
    response = client.patch('/api/turnos/9999/cancelar', headers=headers)
    assert response.status_code == 404
    assert response.get_json()['error'] == 'Turno no encontrado.'


def test_cancelar_turno_ya_cancelado(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    turno = crear_turno_db(db, cliente.cliente_id, cancelado=True)
    response = client.patch(f'/api/turnos/{turno.turno_id}/cancelar', headers=headers)
    assert response.status_code == 400
    assert response.get_json()['error'] == 'El turno ya está cancelado.'


def test_cancelar_turno_exitoso(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    turno = crear_turno_db(db, cliente.cliente_id)
    response = client.patch(f'/api/turnos/{turno.turno_id}/cancelar', headers=headers)
    assert response.status_code == 200
    assert response.get_json()['message'] == 'El turno se canceló correctamente'
    turno_db = Turno.query.get(turno.turno_id)
    assert turno_db.cancelado is True


# ──────────────────────────────────────────────
# Tests: utilidades
# ──────────────────────────────────────────────

def test_estados_validos_no_se_alteran():
    assert ESTADOS_TECNICOS == [
        'En espera', 'Reparando', 'En espera de stock', 'Reparado', 'Sin solución'
    ]
    assert ESTADOS_COMERCIALES == ['Pagado', 'No pagado']


def test_json_keys_del_mapeo_consistentes_con_estados(client, db):
    headers = get_auth_headers(client, db)
    cliente = crear_cliente_db(db)
    crear_turno_db(db, cliente.cliente_id)
    response = client.get('/api/turnos/', headers=headers)
    assert response.status_code == 200
    assert json.dumps(response.get_json(), ensure_ascii=False) is not None
