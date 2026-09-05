# ByteMend — Sistema de gestión de reparaciones de equipos

**ByteMend** es un sistema web para administrar un taller de mantenimiento y reparación de computadoras. Permite registrar clientes, servicios e inventario, y gestionar los turnos de reparación de punta a punta: desde que un equipo ingresa al taller hasta que se entrega reparado y paga.

La aplicación se compone de un **panel de administración** (back office) y de una **recepción de notificaciones automatizada**: un agente de inteligencia artificial conectado a través de **n8n** se encarga de recibir los pedidos de los clientes, procesarlos, devolver un resumen y notificar al sistema cuando hay un nuevo equipo para registrar en el taller.

---

## Descripción técnica

Proyecto **fullstack** con arquitectura modular, listo para desplegarse como demo de portfolio (Backend en Render, Frontend en Vercel):

| Capa          | Tecnología                                                            |
|---------------|-----------------------------------------------------------------------|
| Frontend      | **React** + **Vite**, desarrollo 100% **TypeScript**, estilos con **Tailwind CSS** |
| Backend       | **Python** con **Flask** (patrón *Application Factory* + Blueprints)   |
| Base de datos | **SQLite3** mediante **SQLAlchemy**                                   |

### Arquitectura del backend

- **Application Factory:** la app se inicializa en `app/__init__.py`, donde se registran los Blueprints por dominio lógico, se configuran JWT, CORS, rate-limiting y los error handlers globales en JSON.
- **Modelos centralizados:** todas las entidades de SQLAlchemy viven en `app/models.py`, con la instancia de DB en `app/extensions.py`.
- **Relaciones complejas:** las tablas intermedias con atributos adicionales (como `precio_historico` en `Turno_Detalle`) se modelan como *Association Objects* completos.
- **Autenticación JWT:** access token + refresh token, *blocklist* de tokens para cerrar sesión de forma segura y renovación automática desde el frontend ante token expirado.
- **Errores normalizados:** respuestas JSON consistentes (400/401/404/405/413/429/500) sin exponer detalles internos (excepciones logueadas server-side).
- **Rate-limiting:** protección contra abuso de los endpoints.

### Arquitectura del frontend

- Componentes en **arrow functions** con *named exports*, **tipado estricto** (sin `any`) e `interfaces` explícitas.
- Páginas en `src/Pages/` y componentes agrupados por módulo en `src/Components/<modulo>/`.
- Lógica de estado y llamadas a la API extraída a **Custom Hooks**.
- Gestión de sesión con refresh automático y evento de expiración global.
- Ruta *catch-all* (página 404) para rutas inexistentes del panel.

### Estructura de carpetas

```
├─ Backend/
│  ├─ app/
│  │  ├─ __init__.py        # Application factory + registro de Blueprints
│  │  ├─ extensions.py      # Instancia de SQLAlchemy
│  │  ├─ models.py          # Modelos centralizados
│  │  └─ routes/            # Blueprints por dominio
│  ├─ tests/                # Suite de tests (pytest)
│  ├─ requirements.txt
│  └─ run.py
└─ frontend/
   ├─ src/
   │  ├─ Pages/             # Páginas del panel
   │  ├─ Components/        # Componentes por módulo
   │  ├─ Hooks/             # Custom Hooks
   │  ├─ context/           # AuthContext
   │  └─ Types/             # Interfaces de dominio
   └─ vercel.json
```

---

## API — Endpoints

Todas las rutas llevan el prefijo `/api`. Salvo las indicadas, requieren header `Authorization: Bearer <token>`.

### Autenticación (`/api/auth`)
| Método | Ruta             | Descripción                                  |
|--------|------------------|----------------------------------------------|
| POST   | `/login`         | Inicia sesión, devuelve `token` + `refresh_token` |
| POST   | `/refresh`       | Renueva el access token (público, sin JWT)   |
| POST   | `/logout`        | Cierra sesión y revoca el access token       |

### Clientes (`/api/clientes`)
| Método | Ruta                    | Descripción                        |
|--------|-------------------------|------------------------------------|
| GET    | `/`                     | Listar clientes                    |
| POST   | `/`                     | Crear cliente                      |
| GET    | `/<str:telefono>`       | Buscar cliente por teléfono        |
| PUT    | `/<int:id>`             | Editar cliente                     |
| DELETE | `/<int:id>`             | Eliminar cliente                   |

### Servicios (`/api/servicios`)
| Método | Ruta                     | Descripción                      |
|--------|--------------------------|----------------------------------|
| GET    | `/`                      | Listar servicios                 |
| POST   | `/`                      | Crear servicio                   |
| GET    | `/<str:nombre>`          | Buscar servicio por nombre       |
| PUT    | `/<int:id>`              | Editar servicio                  |

### Inventario (`/api/inventario`)
| Método | Ruta                     | Descripción                       |
|--------|--------------------------|-----------------------------------|
| GET    | `/`                      | Listar inventario                 |
| POST   | `/`                      | Crear ítem                        |
| GET    | `/<str:nombre>`          | Buscar por nombre                 |
| PUT    | `/<int:id>`              | Editar ítem                       |
| POST   | `/csv`                   | Importación masiva por CSV        |

### Turnos (`/api/turnos`)
| Método | Ruta                              | Descripción                              |
|--------|-----------------------------------|------------------------------------------|
| GET    | `/`                               | Kanban agrupado por estado técnico       |
| GET    | `/historial`                      | Historial (estados finales y cancelados) |
| POST   | `/`                               | Crear turno (calcula total y precio histórico) |
| PUT    | `/<int:id>`                       | Editar turno con reconciliación de servicios |
| PATCH  | `/<int:id>/estado-comercial`      | Cambiar estado comercial                 |
| PATCH  | `/<int:id>/estado-tecnico`        | Cambiar estado técnico                   |
| PATCH  | `/<int:id>/cancelar`              | Cancelar turno                           |

### Métricas (`/api/metricas`)
| Método | Ruta        | Descripción                      |
|--------|-------------|----------------------------------|
| POST   | `/mensual`  | Métricas mensuales (mes + año)   |
| POST   | `/global`   | Métricas anuales (año)           |

### Dashboard (`/api/dashboard`)
| Método | Ruta       | Descripción                  |
|--------|------------|------------------------------|
| GET    | `/resumen` | Indicadores del panel inicial |

### Notificaciones (`/api/notificaciones`)
| Método | Ruta            | Descripción                                |
|--------|-----------------|---------------------------------------------|
| POST   | `/`             | Cargar pedido desde **n8n** (requiere `X-API-Key`) |
| GET    | `/`             | Mostrar notificaciones recibidas            |
| PATCH  | `/<int:id>`     | Marcar notificación como leída              |

> El endpoint de carga de n8n no usa JWT sino la cabecera `X-API-Key: <NOTIFICATION_API_KEY>` configurada en el entorno.

---

## Tests

Suite de **155 tests** con `pytest` (base SQLite en memoria, rate-limiting deshabilitado, claves de test).

```
Backend/
└─ tests/
   ├─ conftest.py                       # Config, app de test, fixtures
   ├─ test_auth.py                      # Login, refresh, logout
   ├─ clientes/test_clientes.py         # CRUD + búsquedas
   ├─ servicios/test_servicios.py       # CRUD + búsquedas
   ├─ inventario/test_inventario.py     # CRUD + búsquedas
   ├─ notificaciones/test_notificaciones.py
   ├─ turnos/test_turnos.py             # CRUD, estados, kanban, historial, precios
   └─ ... (metricas/ y dashboard/)
```

Ejecutar:

```bash
cd Backend
python -m pytest -v        # o simplemente: pytest
```

### Ejecución local

```bash
# Backend
cd Backend
python run.py              # o: gunicorn run:app

# Frontend
cd frontend
npm run dev                # o: pnpm run dev
```

> La variable `VITE_API_URL` (frontend) y las env vars de producción (backend: `SECRET_KEY`, `JWT_SECRET_KEY`, `NOTIFICATION_API_KEY`, `CORS_ALLOWED_ORIGINS`) deben configurarse según el entorno.

---

## Credenciales de prueba

| Usuario      | Contraseña     | Rol  |
|--------------|----------------|------|
| `Lukacha531` | `adminabalos1357` | Admin |
