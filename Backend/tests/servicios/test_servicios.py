import json
from tests.conftest import get_auth_headers
from app.models import Servicio


def crear_servicio_db(db, **kwargs):
    defaults = {
        'nombre': 'Formateo e instalación de SO',
        'precio': 15000,
        'estado': True
    }
    defaults.update(kwargs)
    servicio = Servicio(**defaults)
    db.session.add(servicio)
    db.session.commit()
    return servicio


# ──────────────────────────────────────────────
# Tests: GET /api/servicios/
# ──────────────────────────────────────────────

def test_obtener_servicios_sin_token(client):
    response = client.get('/api/servicios/')
    assert response.status_code == 401


def test_obtener_servicios_vacio(client, db):
    headers = get_auth_headers(client, db)
    response = client.get('/api/servicios/', headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 404
    assert data['message'] == 'No hay servicios registrados'


def test_obtener_servicios_con_datos(client, db):
    headers = get_auth_headers(client, db)
    crear_servicio_db(db)

    response = client.get('/api/servicios/', headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]['nombre'] == 'Formateo e instalación de SO'
    assert data[0]['precio'] == 15000
    assert data[0]['estado'] is True


def test_obtener_servicios_filtra_inactivos(client, db):
    headers = get_auth_headers(client, db)
    crear_servicio_db(db, nombre='Activo', estado=True)
    crear_servicio_db(db, nombre='Inactivo', estado=False)

    response = client.get('/api/servicios/', headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]['nombre'] == 'Activo'


# ──────────────────────────────────────────────
# Tests: GET /api/servicios/<nombre>
# ──────────────────────────────────────────────

def test_obtener_servicio_sin_token(client):
    response = client.get('/api/servicios/Formateo')
    assert response.status_code == 401


def test_obtener_servicio_nombre_vacio(client, db):
    headers = get_auth_headers(client, db)
    response = client.get('/api/servicios/', headers=headers)
    assert response.status_code == 404


def test_obtener_servicio_no_encontrado(client, db):
    headers = get_auth_headers(client, db)
    response = client.get('/api/servicios/xyz', headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 404
    assert 'No se encontraron' in data['message']


def test_obtener_servicio_exitoso(client, db):
    headers = get_auth_headers(client, db)
    crear_servicio_db(db)

    response = client.get('/api/servicios/Formateo', headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]['nombre'] == 'Formateo e instalación de SO'


def test_obtener_servicio_busqueda_parcial(client, db):
    headers = get_auth_headers(client, db)
    crear_servicio_db(db)

    response = client.get('/api/servicios/Forma', headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 200
    assert len(data) == 1
    assert 'Formateo' in data[0]['nombre']


def test_obtener_servicio_muestra_inactivos(client, db):
    headers = get_auth_headers(client, db)
    crear_servicio_db(db, nombre='Inactivo', estado=False)

    response = client.get('/api/servicios/Inactivo', headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]['estado'] is False


# ──────────────────────────────────────────────
# Tests: POST /api/servicios/
# ──────────────────────────────────────────────

def test_crear_servicio_sin_token(client):
    response = client.post('/api/servicios/', json={})
    assert response.status_code == 401


def test_crear_servicio_exitoso(client, db):
    headers = get_auth_headers(client, db)

    payload = {
        'nombre': 'Mantenimiento preventivo',
        'precio': 25000
    }
    response = client.post('/api/servicios/', json=payload, headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 201
    assert data['message'] == 'El servicio se registró correctamente'

    servicio = Servicio.query.filter_by(nombre='Mantenimiento preventivo').first()
    assert servicio is not None
    assert servicio.precio == 25000
    assert servicio.estado is True


def test_crear_servicio_campo_faltante(client, db):
    headers = get_auth_headers(client, db)

    payload = {
        'nombre': '',
        'precio': 15000
    }
    response = client.post('/api/servicios/', json=payload, headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 400
    assert 'nombre' in data['error']


def test_crear_servicio_nombre_duplicado(client, db):
    headers = get_auth_headers(client, db)
    crear_servicio_db(db, nombre='Único')

    payload = {
        'nombre': 'Único',
        'precio': 20000
    }
    response = client.post('/api/servicios/', json=payload, headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 409
    assert 'ya existe' in data['error']


# ──────────────────────────────────────────────
# Tests: PUT /api/servicios/<id>
# ──────────────────────────────────────────────

def test_editar_servicio_sin_token(client):
    response = client.put('/api/servicios/1', json={})
    assert response.status_code == 401


def test_editar_servicio_no_encontrado(client, db):
    headers = get_auth_headers(client, db)

    payload = {
        'nombre': 'Editado',
        'precio': 30000,
        'estado': True
    }
    response = client.put('/api/servicios/999999', json=payload, headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 404
    assert 'no encontrado' in data['error']


def test_editar_servicio_exitoso(client, db):
    headers = get_auth_headers(client, db)
    servicio = crear_servicio_db(db)

    payload = {
        'nombre': 'Formateo completo',
        'precio': 20000,
        'estado': True
    }
    response = client.put(f'/api/servicios/{servicio.servicio_id}', json=payload, headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 200
    assert data['message'] == 'El servicio se editó correctamente'

    servicio_actualizado = Servicio.query.get(servicio.servicio_id)
    assert servicio_actualizado.nombre == 'Formateo completo'
    assert servicio_actualizado.precio == 20000


def test_editar_servicio_cambiar_estado(client, db):
    headers = get_auth_headers(client, db)
    servicio = crear_servicio_db(db, estado=True)

    payload = {
        'nombre': servicio.nombre,
        'precio': servicio.precio,
        'estado': False
    }
    response = client.put(f'/api/servicios/{servicio.servicio_id}', json=payload, headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 200

    servicio_actualizado = Servicio.query.get(servicio.servicio_id)
    assert servicio_actualizado.estado is False
