# IoT-post (Backend)

Servidor backend para el sistema IoTmatic-Tec, desarrollado con Node.js y Express.

## Requisitos Previos

- Node.js (v14 o superior)
- npm (v6 o superior)
- PostgreSQL (v12 o superior)
- Git

## Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd IoT-post
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Configuración del Servidor
PORT=3000
NODE_ENV=development

# Configuración de la Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=iotmatic
DB_USER=postgres
DB_PASSWORD=tu_contraseña

# Configuración de JWT
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRATION=1d

# Configuración de WebSocket
WS_PATH=/ws

# Configuración de Logging
LOG_LEVEL=info

# Configuración de CORS
CORS_ORIGIN=http://localhost:8080
```

4. Inicializar la base de datos:
```bash
npm run db:migrate
npm run db:seed  # Opcional: poblar con datos de ejemplo
```

## Desarrollo

Iniciar el servidor en modo desarrollo:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Producción

Construir y ejecutar en producción:
```bash
npm run build
npm start
```

## Características Principales

- API RESTful para gestión de dispositivos y modelos
- Servidor WebSocket para comunicación en tiempo real
- Autenticación JWT
- Sistema de logging avanzado
- Validación de datos
- Manejo de errores centralizado

## Estructura del Proyecto

```
src/
  ├── controllers/   # Controladores de la API
  ├── models/        # Modelos de la base de datos
  ├── routes/        # Rutas de la API
  ├── services/      # Lógica de negocio
  ├── WebSockets/    # Manejadores de WebSocket
  ├── middlewares/   # Middlewares personalizados
  ├── utils/         # Utilidades y helpers
  └── db/            # Configuración de base de datos
```

## API Endpoints

### Autenticación
- POST `/api/auth/login` - Iniciar sesión
- POST `/api/auth/register` - Registrar nuevo usuario

### Dispositivos
- GET `/api/devices` - Listar dispositivos
- POST `/api/devices` - Crear dispositivo
- GET `/api/devices/:id` - Obtener dispositivo
- PUT `/api/devices/:id` - Actualizar dispositivo
- DELETE `/api/devices/:id` - Eliminar dispositivo

### Modelos
- GET `/api/models` - Listar modelos
- POST `/api/models` - Crear modelo
- GET `/api/models/:id` - Obtener modelo
- PUT `/api/models/:id` - Actualizar modelo
- DELETE `/api/models/:id` - Eliminar modelo

## Variables de Entorno

| Variable | Descripción | Obligatorio |
|----------|-------------|-------------|
| PORT | Puerto del servidor | No (default: 3000) |
| NODE_ENV | Entorno de ejecución | No (default: development) |
| DB_HOST | Host de la base de datos | Sí |
| DB_PORT | Puerto de la base de datos | Sí |
| DB_NAME | Nombre de la base de datos | Sí |
| DB_USER | Usuario de la base de datos | Sí |
| DB_PASSWORD | Contraseña de la base de datos | Sí |
| JWT_SECRET | Secreto para firmar tokens | Sí |
| JWT_EXPIRATION | Tiempo de expiración del token | No (default: 1d) |
| WS_PATH | Ruta para WebSocket | No (default: /ws) |
| LOG_LEVEL | Nivel de logging | No (default: info) |
| CORS_ORIGIN | Origen permitido para CORS | Sí |

## Scripts Disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo
- `npm run build`: Construye el proyecto
- `npm start`: Inicia el servidor en modo producción
- `npm run db:migrate`: Ejecuta las migraciones
- `npm run db:seed`: Ejecuta los seeders
- `npm run test`: Ejecuta las pruebas
- `npm run lint`: Ejecuta el linter

## WebSocket

El servidor WebSocket está disponible en `ws://localhost:3000/ws`

Ejemplo de conexión:
```javascript
const ws = new WebSocket('ws://localhost:3000/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Datos recibidos:', data);
};
```

## Docker

El proyecto incluye configuración para Docker:

```bash
# Construir imagen
docker build -t iot-post .

# Ejecutar contenedor
docker run -p 3000:3000 iot-post
```

## Guía de Contribución

1. Crear una rama para tu feature: `git checkout -b feature/nombre-feature`
2. Hacer commit de tus cambios: `git commit -m 'feat: añadir nueva característica'`
3. Hacer push a la rama: `git push origin feature/nombre-feature`
4. Crear un Pull Request

## Soporte

Para reportar problemas o solicitar ayuda, por favor crear un issue en el repositorio.
