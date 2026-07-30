import json
from datetime import date, timedelta
from tests.conftest import create_test_admin, get_auth_headers
from app.extensions import db as _db
from app.models import Consulta_Telegram


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def crear_notificacion_db(db, **kwargs):
    defaults = {
        'chat_id_telegram': 123456789,
        'nombre_telegram': 'Juan Perez',
        'telefono': '+5491123456789',
        'fecha_recepcion': date.today(),
        'resumen_ia': '',
        'mensaje_original': 'Mensaje de prueba',
        'leido': False,
    }
    defaults.update(kwargs)
    notificacion = Consulta_Telegram(**defaults)
    db.session.add(notificacion)
    db.session.commit()
    return notificacion


api_key_headers = {'X-API-Key': 'n8n_bytemend_test_key_2026'}

payload_completo = {
    'card_backend': {
        'chat_id_telegram': 123456789,
        'nombre_telegram': 'Juan Perez',
        'telefono': '+5491123456789',
        'fecha_recepcion': '2026-07-24',
        'resumen_ia': 'El cliente necesita reparación de pantalla',
        'mensaje_original': 'Hola, necesito reparar mi notebook',
        'leido': False,
    }
}


# ──────────────────────────────────────────────
# Tests: POST /api/notificaciones/cargar
# ──────────────────────────────────────────────

def test_cargar_notificacion_exitosa(client):
    response = client.post('/api/notificaciones/cargar',
                           json=payload_completo,
                           headers=api_key_headers,
                           content_type='application/json')
    data = json.loads(response.data)
    assert response.status_code == 201
    assert data['mensaje'] == 'Notificación cargada exitosamente.'


def test_cargar_notificacion_resumen_ia_vacio(client):
    payload = {
        'card_backend': {
            **payload_completo['card_backend'],
            'resumen_ia': '',
        }
    }
    response = client.post('/api/notificaciones/cargar',
                           json=payload,
                           headers=api_key_headers,
                           content_type='application/json')
    assert response.status_code == 201


def test_cargar_notificacion_resumen_ia_nulo(client):
    payload = {
        'card_backend': {
            **payload_completo['card_backend'],
            'resumen_ia': None,
        }
    }
    response = client.post('/api/notificaciones/cargar',
                           json=payload,
                           headers=api_key_headers,
                           content_type='application/json')
    assert response.status_code == 201


def test_cargar_falta_card_backend(client):
    response = client.post('/api/notificaciones/cargar',
                           json={},
                           headers=api_key_headers,
                           content_type='application/json')
    data = json.loads(response.data)
    assert response.status_code == 400
    assert 'card_backend' in data['error']


def test_cargar_campo_obligatorio_vacio(client):
    payload = {
        'card_backend': {
            **payload_completo['card_backend'],
            'telefono': '',
        }
    }
    response = client.post('/api/notificaciones/cargar',
                           json=payload,
                           headers=api_key_headers,
                           content_type='application/json')
    data = json.loads(response.data)
    assert response.status_code == 400
    assert 'telefono' in data['error']


def test_cargar_campo_obligatorio_ausente(client):
    payload = {
        'card_backend': {
            'chat_id_telegram': 123456789,
            'nombre_telegram': 'Juan Perez',
        }
    }
    response = client.post('/api/notificaciones/cargar',
                           json=payload,
                           headers=api_key_headers,
                           content_type='application/json')
    data = json.loads(response.data)
    assert response.status_code == 400


def test_cargar_sin_body(client):
    response = client.post('/api/notificaciones/cargar',
                           headers=api_key_headers,
                           content_type='application/json')
    assert response.status_code == 400


# ──────────────────────────────────────────────
# Tests: GET /api/notificaciones/mostrar
# ──────────────────────────────────────────────

def test_mostrar_sin_token(client):
    response = client.get('/api/notificaciones/mostrar')
    assert response.status_code == 401


def test_mostrar_listas_vacias(client, db):
    headers = get_auth_headers(client, db)
    response = client.get('/api/notificaciones/mostrar', headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 200
    assert data['leidas'] == []
    assert data['no_leidas'] == []


def test_mostrar_no_leidas_aparecen(client, db):
    headers = get_auth_headers(client, db)
    crear_notificacion_db(db, leido=False)

    response = client.get('/api/notificaciones/mostrar', headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 200
    assert len(data['no_leidas']) == 1
    assert len(data['leidas']) == 0


def test_mostrar_leidas_dentro_de_14_dias(client, db):
    headers = get_auth_headers(client, db)
    crear_notificacion_db(db, leido=True, fecha_recepcion=date.today())

    response = client.get('/api/notificaciones/mostrar', headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 200
    assert len(data['leidas']) == 1


def test_mostrar_leidas_fuera_de_14_dias_no_aparecen(client, db):
    headers = get_auth_headers(client, db)
    crear_notificacion_db(db, leido=True, fecha_recepcion=date.today() - timedelta(days=20))

    response = client.get('/api/notificaciones/mostrar', headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 200
    assert len(data['leidas']) == 0


def test_mostrar_resumen_ia_vacio_muestra_texto_default(client, db):
    headers = get_auth_headers(client, db)
    crear_notificacion_db(db, resumen_ia='')

    response = client.get('/api/notificaciones/mostrar', headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 200
    assert data['no_leidas'][0]['resumen_ia'] == 'este mensaje no paso por el agente de IA'


def test_mostrar_resumen_ia_nulo_muestra_texto_default(client, db):
    headers = get_auth_headers(client, db)
    crear_notificacion_db(db, resumen_ia=None)

    response = client.get('/api/notificaciones/mostrar', headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 200
    assert data['no_leidas'][0]['resumen_ia'] == 'este mensaje no paso por el agente de IA'


def test_mostrar_resumen_ia_con_datos(client, db):
    headers = get_auth_headers(client, db)
    crear_notificacion_db(db, resumen_ia='Reparación de pantalla LCD')

    response = client.get('/api/notificaciones/mostrar', headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 200
    assert data['no_leidas'][0]['resumen_ia'] == 'Reparación de pantalla LCD'


# ──────────────────────────────────────────────
# Tests: PUT /api/notificaciones/leida/<id>
# ──────────────────────────────────────────────

def test_leida_sin_token(client):
    response = client.put('/api/notificaciones/leida/1')
    assert response.status_code == 401


def test_leida_exitoso(client, db):
    headers = get_auth_headers(client, db)
    notificacion = crear_notificacion_db(db, leido=False)

    response = client.put(f'/api/notificaciones/leida/{notificacion.consulta_id}',
                          headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 200
    assert data['mensaje'] == 'Notificación marcada como leída.'

    notificacion_actualizada = Consulta_Telegram.query.get(notificacion.consulta_id)
    assert notificacion_actualizada.leido is True


def test_leida_no_encontrada(client, db):
    headers = get_auth_headers(client, db)
    response = client.put('/api/notificaciones/leida/999999', headers=headers)
    data = json.loads(response.data)
    assert response.status_code == 404
    assert 'no encontrada' in data['error']
