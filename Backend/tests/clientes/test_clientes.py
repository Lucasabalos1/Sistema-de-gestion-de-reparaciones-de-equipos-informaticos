import json
from tests.conftest import create_test_admin, get_auth_headers
from app.models import Cliente


def crear_cliente_db(db, **kwargs):
    admin = create_test_admin(db)
    defaults = {
        'admin_id': admin.admin_id,
        'nombre': 'Juan',
        'apellido': 'Pérez',
        'telefono': '1122334455',
        'correo': 'juan@email.com',
        'genero': 'Masculino'
    }
    defaults.update(kwargs)
    cliente = Cliente(**defaults)
    db.session.add(cliente)
    db.session.commit()
    return cliente, admin


# ──────────────────────────────────────────────
# Tests: GET /api/clientes/
# ──────────────────────────────────────────────

def test_obtener_clientes_sin_token(client):
    response = client.get('/api/clientes/')
    assert response.status_code == 401


def test_obtener_clientes_vacio(client, db):
    headers = get_auth_headers(client, db)
    response = client.get('/api/clientes/', headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 404
    assert data['message'] == 'No hay clientes registrados'


def test_obtener_clientes_con_datos(client, db):
    headers = get_auth_headers(client, db)
    crear_cliente_db(db)

    response = client.get('/api/clientes/', headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]['nombre'] == 'Juan'
    assert data[0]['telefono'] == '1122334455'


def test_obtener_clientes_campos_nulos(client, db):
    headers = get_auth_headers(client, db)
    crear_cliente_db(db, apellido=None, correo=None, genero=None)

    response = client.get('/api/clientes/', headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 200
    assert data[0]['apellido'] == 'No hay datos por el momento'
    assert data[0]['correo'] == 'No hay datos por el momento'
    assert data[0]['genero'] == 'No hay datos por el momento'


# ──────────────────────────────────────────────
# Tests: GET /api/clientes/<telefono>
# ──────────────────────────────────────────────

def test_obtener_cliente_sin_token(client):
    response = client.get('/api/clientes/1122334455')
    assert response.status_code == 401


def test_obtener_cliente_telefono_vacio(client, db):
    headers = get_auth_headers(client, db)
    response = client.get('/api/clientes/', headers=headers)
    assert response.status_code == 404


def test_obtener_cliente_no_encontrado(client, db):
    headers = get_auth_headers(client, db)
    response = client.get('/api/clientes/9999999999', headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 404
    assert 'No se encontró' in data['message']


def test_obtener_cliente_exitoso(client, db):
    headers = get_auth_headers(client, db)
    crear_cliente_db(db, telefono='1122334455')

    response = client.get('/api/clientes/1122334455', headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 200
    assert data['telefono'] == '1122334455'
    assert data['nombre'] == 'Juan'


# ──────────────────────────────────────────────
# Tests: POST /api/clientes/
# ──────────────────────────────────────────────

def test_crear_cliente_sin_token(client):
    response = client.post('/api/clientes/', json={})
    assert response.status_code == 401


def test_crear_cliente_exitoso(client, db):
    headers = get_auth_headers(client, db)
    admin = create_test_admin(db)

    payload = {
        'admin_id': admin.admin_id,
        'nombre': 'María',
        'apellido': 'Gómez',
        'telefono': '1145678901',
        'correo': 'maria@email.com',
        'genero': 'Femenino'
    }
    response = client.post('/api/clientes/', json=payload, headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 201
    assert data['message'] == 'El cliente se registró correctamente'

    cliente = Cliente.query.filter_by(telefono='1145678901').first()
    assert cliente is not None
    assert cliente.nombre == 'María'


def test_crear_cliente_campo_faltante(client, db):
    headers = get_auth_headers(client, db)
    admin = create_test_admin(db)

    payload = {
        'admin_id': admin.admin_id,
        'nombre': '',
        'telefono': '1145678901'
    }
    response = client.post('/api/clientes/', json=payload, headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 400
    assert 'nombre' in data['error']


def test_crear_cliente_telefono_duplicado(client, db):
    headers = get_auth_headers(client, db)
    crear_cliente_db(db, telefono='1122334455')

    payload = {
        'admin_id': 1,
        'nombre': 'Otro',
        'telefono': '1122334455'
    }
    response = client.post('/api/clientes/', json=payload, headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 409
    assert 'ya existe' in data['error']


def test_crear_cliente_campos_opcionales_vacios(client, db):
    headers = get_auth_headers(client, db)
    admin = create_test_admin(db)

    payload = {
        'admin_id': admin.admin_id,
        'nombre': 'Carlos',
        'telefono': '1166667777'
    }
    response = client.post('/api/clientes/', json=payload, headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 201

    cliente = Cliente.query.filter_by(telefono='1166667777').first()
    assert cliente.apellido == ''
    assert cliente.correo == 'No hay datos por el momento'
    assert cliente.genero == 'No hay datos por el momento'


# ──────────────────────────────────────────────
# Tests: PUT /api/clientes/<id>
# ──────────────────────────────────────────────

def test_editar_cliente_sin_token(client):
    response = client.put('/api/clientes/1', json={})
    assert response.status_code == 401


def test_editar_cliente_no_encontrado(client, db):
    headers = get_auth_headers(client, db)

    payload = {
        'admin_id': 1,
        'nombre': 'Editado',
        'telefono': '1122334455'
    }
    response = client.put('/api/clientes/999999', json=payload, headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 404
    assert 'no encontrado' in data['error']


def test_editar_cliente_exitoso(client, db):
    headers = get_auth_headers(client, db)
    cliente, admin = crear_cliente_db(db)

    payload = {
        'admin_id': admin.admin_id,
        'nombre': 'Juan Carlos',
        'apellido': 'Martínez',
        'telefono': '1122334455',
        'correo': 'juanc@email.com',
        'genero': 'Masculino'
    }
    response = client.put(f'/api/clientes/{cliente.cliente_id}', json=payload, headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 200
    assert data['message'] == 'El cliente se editó correctamente'

    cliente_actualizado = Cliente.query.get(cliente.cliente_id)
    assert cliente_actualizado.nombre == 'Juan Carlos'
    assert cliente_actualizado.apellido == 'Martínez'


def test_editar_cliente_telefono_duplicado(client, db):
    headers = get_auth_headers(client, db)
    crear_cliente_db(db, telefono='1111111111')
    cliente2, admin2 = crear_cliente_db(db, telefono='2222222222')

    payload = {
        'admin_id': admin2.admin_id,
        'nombre': 'Cliente 2',
        'telefono': '1111111111'
    }
    response = client.put(f'/api/clientes/{cliente2.cliente_id}', json=payload, headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 409
    assert 'teléfono' in data['error']


# ──────────────────────────────────────────────
# Tests: DELETE /api/clientes/<id>
# ──────────────────────────────────────────────

def test_eliminar_cliente_sin_token(client):
    response = client.delete('/api/clientes/1')
    assert response.status_code == 401


def test_eliminar_cliente_no_encontrado(client, db):
    headers = get_auth_headers(client, db)
    response = client.delete('/api/clientes/999999', headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 404
    assert 'no encontrado' in data['error']


def test_eliminar_cliente_exitoso(client, db):
    headers = get_auth_headers(client, db)
    cliente, _ = crear_cliente_db(db)

    response = client.delete(f'/api/clientes/{cliente.cliente_id}', headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 200
    assert data['message'] == 'El cliente se eliminó correctamente'

    cliente_eliminado = Cliente.query.get(cliente.cliente_id)
    assert cliente_eliminado is None
