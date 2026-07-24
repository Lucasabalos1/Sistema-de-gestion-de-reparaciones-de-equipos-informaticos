import json


def test_login_exitoso(client, db):
    from tests.conftest import create_test_admin
    admin = create_test_admin(db)

    response = client.post('/api/auth/login', json={
        'usuario': 'admin_test',
        'contraseña': 'password123'
    })

    data = json.loads(response.data)
    assert response.status_code == 200
    assert 'token' in data
    assert data['token'] is not None
    assert data['usuario']['admin_id'] == admin.admin_id
    assert data['usuario']['usuario'] == 'admin_test'
    assert data['usuario']['nombre'] == 'Juan'
    assert data['usuario']['apellido'] == 'Perez'
    assert data['usuario']['genero'] == 'Masculino'


def test_login_campos_faltantes(client):
    response = client.post('/api/auth/login', json={})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['message'] == 'Usuario y contraseña son requeridos'


def test_login_solo_usuario_falta_contraseña(client):
    response = client.post('/api/auth/login', json={
        'usuario': 'admin_test'
    })
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['message'] == 'Usuario y contraseña son requeridos'


def test_login_solo_contraseña_falta_usuario(client):
    response = client.post('/api/auth/login', json={
        'contraseña': 'password123'
    })
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['message'] == 'Usuario y contraseña son requeridos'


def test_login_campos_vacios(client):
    response = client.post('/api/auth/login', json={
        'usuario': '',
        'contraseña': ''
    })
    assert response.status_code == 400


def test_login_usuario_no_existe(client):
    response = client.post('/api/auth/login', json={
        'usuario': 'usuario_inexistente',
        'contraseña': 'password123'
    })
    assert response.status_code == 401
    data = json.loads(response.data)
    assert data['message'] == 'Credenciales inválidas'


def test_login_contraseña_incorrecta(client, db):
    from tests.conftest import create_test_admin
    create_test_admin(db)

    response = client.post('/api/auth/login', json={
        'usuario': 'admin_test',
        'contraseña': 'contraseña Incorrecta'
    })
    assert response.status_code == 401
    data = json.loads(response.data)
    assert data['message'] == 'Credenciales inválidas'


def test_login_token_es_string(client, db):
    from tests.conftest import create_test_admin
    create_test_admin(db)

    response = client.post('/api/auth/login', json={
        'usuario': 'admin_test',
        'contraseña': 'password123'
    })

    data = json.loads(response.data)
    assert isinstance(data['token'], str)
    assert len(data['token']) > 0


def test_login_sin_body_json(client):
    response = client.post('/api/auth/login',
                           content_type='application/json')
    assert response.status_code == 400
