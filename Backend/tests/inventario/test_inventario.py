import io
import json
from pathlib import Path

from tests.conftest import get_auth_headers
from app.models import Inventario

CSV_DIR = Path(__file__).parent / 'csv'


def crear_inventario_db(db, **kwargs):
    defaults = {
        'admin_id': 1,
        'nombre': 'pasta termica',
        'stock': 2,
        'precio_unidad': 15000
    }
    defaults.update(kwargs)
    inventario = Inventario(**defaults)
    db.session.add(inventario)
    db.session.commit()
    return inventario


def cargar_csv(client, headers, nombre_archivo):
    with open(CSV_DIR / nombre_archivo, 'rb') as f:
        data = {'archivo': (io.BytesIO(f.read()), nombre_archivo)}
        return client.post(
            '/api/inventario/csv',
            data=data,
            headers=headers,
            content_type='multipart/form-data'
        )


# ──────────────────────────────────────────────
# Tests: GET /api/inventario/
# ──────────────────────────────────────────────

def test_obtener_inventario_sin_token(client):
    response = client.get('/api/inventario/')
    assert response.status_code == 401


def test_obtener_inventario_vacio(client, db):
    headers = get_auth_headers(client, db)
    response = client.get('/api/inventario/', headers=headers)
    assert response.status_code == 404
    assert response.get_json()['message'] == 'No hay repuestos en el inventario'


def test_obtener_inventario_con_datos(client, db):
    headers = get_auth_headers(client, db)
    crear_inventario_db(db)
    response = client.get('/api/inventario/', headers=headers)
    assert response.status_code == 200
    datos = response.get_json()
    assert len(datos) == 1
    assert set(datos[0].keys()) == {'repuesto_id', 'admin_id', 'nombre', 'stock', 'precio_unidad'}
    assert datos[0]['nombre'] == 'pasta termica'


# ──────────────────────────────────────────────
# Tests: GET /api/inventario/<nombre>
# ──────────────────────────────────────────────

def test_obtener_inventario_por_nombre_sin_token(client):
    response = client.get('/api/inventario/pasta')
    assert response.status_code == 401


def test_obtener_inventario_por_nombre_coincidencia_parcial(client, db):
    headers = get_auth_headers(client, db)
    crear_inventario_db(db)
    response = client.get('/api/inventario/pasta', headers=headers)
    assert response.status_code == 200
    datos = response.get_json()
    assert len(datos) == 1
    assert datos[0]['nombre'] == 'pasta termica'


def test_obtener_inventario_por_nombre_sin_coincidencias(client, db):
    headers = get_auth_headers(client, db)
    crear_inventario_db(db)
    response = client.get('/api/inventario/fuente', headers=headers)
    assert response.status_code == 404
    assert response.get_json()['message'] == 'No se encontraron repuestos con ese nombre.'


# ──────────────────────────────────────────────
# Tests: POST /api/inventario/
# ──────────────────────────────────────────────

def test_cargar_inventario_sin_token(client):
    response = client.post('/api/inventario/', json={
        'admin_id': 1,
        'nombre': 'fuente 500w',
        'stock': 3,
        'precio_unidad': 45000
    })
    assert response.status_code == 401


def test_cargar_inventario_campo_faltante(client, db):
    headers = get_auth_headers(client, db)
    response = client.post('/api/inventario/', headers=headers, json={
        'admin_id': 1,
        'nombre': 'fuente 500w',
        'stock': 3
    })
    assert response.status_code == 400
    assert "El campo 'precio_unidad' es requerido" in response.get_json()['error']


def test_cargar_inventario_precio_invalido(client, db):
    headers = get_auth_headers(client, db)
    response = client.post('/api/inventario/', headers=headers, json={
        'admin_id': 1,
        'nombre': 'fuente 500w',
        'stock': 3,
        'precio_unidad': 0
    })
    assert response.status_code == 400
    assert "El campo 'precio_unidad' debe ser mayor a 0" in response.get_json()['error']


def test_cargar_inventario_stock_negativo(client, db):
    headers = get_auth_headers(client, db)
    response = client.post('/api/inventario/', headers=headers, json={
        'admin_id': 1,
        'nombre': 'fuente 500w',
        'stock': -1,
        'precio_unidad': 45000
    })
    assert response.status_code == 400
    assert "El campo 'stock' debe ser mayor o igual a 0" in response.get_json()['error']


def test_cargar_inventario_nombre_duplicado(client, db):
    headers = get_auth_headers(client, db)
    crear_inventario_db(db)
    response = client.post('/api/inventario/', headers=headers, json={
        'admin_id': 1,
        'nombre': 'pasta termica',
        'stock': 2,
        'precio_unidad': 15000
    })
    assert response.status_code == 409
    assert "ya existe en el inventario" in response.get_json()['error']


def test_cargar_inventario_exitoso(client, db):
    headers = get_auth_headers(client, db)
    response = client.post('/api/inventario/', headers=headers, json={
        'admin_id': 1,
        'nombre': 'fuente 500w',
        'stock': 3,
        'precio_unidad': 45000
    })
    assert response.status_code == 201
    assert response.get_json()['message'] == 'El repuesto se registró correctamente'
    inventario = Inventario.query.filter_by(nombre='fuente 500w').first()
    assert inventario is not None


# ──────────────────────────────────────────────
# Tests: PUT /api/inventario/<id>
# ──────────────────────────────────────────────

def test_editar_inventario_sin_token(client, db):
    inventario = crear_inventario_db(db)
    response = client.put(f'/api/inventario/{inventario.repuesto_id}', json={
        'admin_id': 1,
        'nombre': 'pasta termica nueva',
        'stock': 10,
        'precio_unidad': 20000
    })
    assert response.status_code == 401


def test_editar_inventario_campo_faltante(client, db):
    headers = get_auth_headers(client, db)
    inventario = crear_inventario_db(db)
    response = client.put(f'/api/inventario/{inventario.repuesto_id}', headers=headers, json={
        'admin_id': 1,
        'nombre': 'pasta termica nueva',
        'stock': 10
    })
    assert response.status_code == 400
    assert "El campo 'precio_unidad' es requerido" in response.get_json()['error']


def test_editar_inventario_stock_negativo(client, db):
    headers = get_auth_headers(client, db)
    inventario = crear_inventario_db(db)
    response = client.put(f'/api/inventario/{inventario.repuesto_id}', headers=headers, json={
        'admin_id': 1,
        'nombre': 'pasta termica nueva',
        'stock': -1,
        'precio_unidad': 20000
    })
    assert response.status_code == 400
    assert "El campo 'stock' debe ser mayor o igual a 0" in response.get_json()['error']


def test_editar_inventario_precio_invalido(client, db):
    headers = get_auth_headers(client, db)
    inventario = crear_inventario_db(db)
    response = client.put(f'/api/inventario/{inventario.repuesto_id}', headers=headers, json={
        'admin_id': 1,
        'nombre': 'pasta termica nueva',
        'stock': 10,
        'precio_unidad': 0
    })
    assert response.status_code == 400
    assert "El campo 'precio_unidad' debe ser mayor a 0" in response.get_json()['error']


def test_editar_inventario_nombre_duplicado(client, db):
    headers = get_auth_headers(client, db)
    crear_inventario_db(db, nombre='fuente 500w')
    inventario = crear_inventario_db(db, nombre='aire comprimido')
    response = client.put(f'/api/inventario/{inventario.repuesto_id}', headers=headers, json={
        'admin_id': 1,
        'nombre': 'fuente 500w',
        'stock': 10,
        'precio_unidad': 20000
    })
    assert response.status_code == 409
    assert "ya existe en el inventario" in response.get_json()['error']


def test_editar_inventario_no_encontrado(client, db):
    headers = get_auth_headers(client, db)
    response = client.put('/api/inventario/9999', headers=headers, json={
        'admin_id': 1,
        'nombre': 'pasta termica nueva',
        'stock': 10,
        'precio_unidad': 20000
    })
    assert response.status_code == 404
    assert response.get_json()['error'] == 'Repuesto no encontrado.'


def test_editar_inventario_exitoso(client, db):
    headers = get_auth_headers(client, db)
    inventario = crear_inventario_db(db)
    response = client.put(f'/api/inventario/{inventario.repuesto_id}', headers=headers, json={
        'admin_id': 1,
        'nombre': 'pasta termica pro',
        'stock': 10,
        'precio_unidad': 20000
    })
    assert response.status_code == 200
    assert response.get_json()['message'] == 'El repuesto se editó correctamente'
    inventario_editado = Inventario.query.get(inventario.repuesto_id)
    assert inventario_editado.nombre == 'pasta termica pro'
    assert inventario_editado.stock == 10
    assert inventario_editado.precio_unidad == 20000


# ──────────────────────────────────────────────
# Tests: POST /api/inventario/csv
# ──────────────────────────────────────────────

def test_cargar_inventario_csv_sin_token(client):
    with open(CSV_DIR / 'inventario_todo_correcto.csv', 'rb') as f:
        response = client.post('/api/inventario/csv', data={
            'archivo': (io.BytesIO(f.read()), 'inventario_todo_correcto.csv')
        }, content_type='multipart/form-data')
    assert response.status_code == 401


def test_cargar_inventario_csv_sin_archivo(client, db):
    headers = get_auth_headers(client, db)
    response = client.post('/api/inventario/csv', headers=headers, content_type='multipart/form-data')
    assert response.status_code == 400
    assert response.get_json()['error'] == 'No se recibió el archivo CSV.'


def test_cargar_inventario_csv_extension_invalida(client, db):
    headers = get_auth_headers(client, db)
    data = {'archivo': (io.BytesIO(b'nombre,stock,precio_unidad'), 'inventario.txt')}
    response = client.post('/api/inventario/csv', data=data, headers=headers,
                           content_type='multipart/form-data')
    assert response.status_code == 400
    assert response.get_json()['error'] == 'El archivo debe ser un CSV.'


def test_cargar_inventario_csv_sin_filas_validas(client, db):
    headers = get_auth_headers(client, db)
    data = {'archivo': (io.BytesIO(b'nombre,stock,precio_unidad\n'), 'vacio.csv')}
    response = client.post('/api/inventario/csv', data=data, headers=headers,
                           content_type='multipart/form-data')
    assert response.status_code == 400
    assert response.get_json()['message'] == 'El CSV no contiene filas válidas.'


def test_cargar_inventario_csv_exitoso(client, db):
    headers = get_auth_headers(client, db)
    response = cargar_csv(client, headers, 'inventario_todo_correcto.csv')
    assert response.status_code == 201
    assert response.get_json()['message'] == 'El inventario se cargó correctamente'
    registros = Inventario.query.order_by(Inventario.nombre).all()
    assert [r.nombre for r in registros] == ['aire comprimido', 'pasta termica']


def test_cargar_inventario_csv_dedupe_interno(client, db):
    headers = get_auth_headers(client, db)
    response = cargar_csv(client, headers, 'inventario_todo_duplicados.csv')
    assert response.status_code == 201
    registros = Inventario.query.all()
    assert len(registros) == 2


def test_cargar_inventario_csv_descarta_invalidas(client, db):
    headers = get_auth_headers(client, db)
    response = cargar_csv(client, headers, 'inventario_todo_invalido.csv')
    assert response.status_code == 201
    registros = Inventario.query.order_by(Inventario.nombre).all()
    assert [r.nombre for r in registros] == ['aire comprimido', 'pasta termica']
    assert Inventario.query.filter_by(nombre='memoria RAM').first() is None


def test_cargar_inventario_csv_upsert(client, db):
    headers = get_auth_headers(client, db)
    response = cargar_csv(client, headers, 'inventario_todo_correcto.csv')
    assert response.status_code == 201
    response = cargar_csv(client, headers, 'inventario_todo_duplicados.csv')
    assert response.status_code == 201
    registros = Inventario.query.all()
    assert len(registros) == 2
    pasta = Inventario.query.filter_by(nombre='pasta termica').first()
    assert pasta.stock == 2
    assert pasta.precio_unidad == 15000


def test_cargar_inventario_csv_con_bom(client, db):
    headers = get_auth_headers(client, db)
    contenido = (
        'nombre,stock,precio_unidad\n'
        'pasta termica,2,15000\n'
        'aire comprimido,5,12000\n'
    ).encode('utf-8-sig')
    data = {'archivo': (io.BytesIO(contenido), 'con_bom.csv')}
    response = client.post('/api/inventario/csv', data=data, headers=headers,
                           content_type='multipart/form-data')
    assert response.status_code == 201
    registros = Inventario.query.order_by(Inventario.nombre).all()
    assert [r.nombre for r in registros] == ['aire comprimido', 'pasta termica']
    assert not registros[0].nombre.startswith('\ufeff')


def test_cargar_inventario_csv_guarda_admin_id(client, db):
    from tests.conftest import create_test_admin
    from flask_jwt_extended import create_access_token
    admin = create_test_admin(db)
    token = create_access_token(identity=str(admin.admin_id))
    headers = {'Authorization': f'Bearer {token}'}
    response = cargar_csv(client, headers, 'inventario_todo_correcto.csv')
    assert response.status_code == 201
    for registro in Inventario.query.all():
        assert registro.admin_id == admin.admin_id
