# IoTmatic-Tec

Este proyecto consiste en un **framework IoT** para dispositivos inteligentes, integrando **inteligencia artificial (IA)** y una arquitectura **frontend-backend** escalable. El sistema permite gestionar dispositivos IoT y realizar análisis avanzado utilizando OpenAI.

## Tabla de Contenidos

- [Características](#características)
- [Requisitos Previos](#requisitos-previos)
- [Configuración](#configuración)
- [Frontend](#frontend)
- [Backend](#backend)
- [Scripts Disponibles](#scripts-disponibles)
- [Seguridad](#seguridad)
- [Contribuciones](#contribuciones)
- [Licencia](#licencia)
- [Contacto](#contacto)

---

## Características

1. **Gestión IoT**: Soporte para integración y control de dispositivos inteligentes.
2. **Inteligencia Artificial**: Integración con GPT (OpenAI) para análisis avanzado.
3. **Frontend moderno**: Construido con **Vue 3**, **Quasar** y **Pinia**.
4. **Backend robusto**: Implementado con **Node.js**, **Express**, **GraphQL**, y **Sequelize** para manejar bases de datos relacionales.
5. **Seguridad**: Autenticación JWT y protección de datos sensibles.

---

## Requisitos Previos

Antes de instalar y ejecutar el proyecto, asegúrate de contar con lo siguiente:

- **Node.js** (v18 o superior).
- **npm** o **yarn** instalado.
- **PostgreSQL** como base de datos.
- Una clave de API válida de OpenAI para utilizar IA.

---

## Configuración

### Variables de Entorno

Crea un archivo `.env` en las carpetas de **backend** y **frontend** y configura las siguientes variables según corresponda:

## Backend

### Pasos para Configurar el Backend

1. **Clonar el Repositorio**
   ```bash
   git clone <URL-del-repositorio>
   ```

2. **Ir al Directorio del Backend**
   ```bash
   cd iot-post
   ```

3. **Instalar Dependencias**
   ```bash
   npm install
   ```

4. **Configurar las Variables de Entorno**
   - Crea un archivo `.env` en el directorio raíz del backend.
   - Copia y pega las siguientes variables de entorno y actualízalas con tus credenciales:
     ```env
     DB_USER=<tu-user>
     DB_HOST=<tu-host>
     DB_DATABASE=<tu-base-datos>
     DB_PASSWORD=<tu-clave-secreta>
     DB_PORT=<tu-puerto-db>
     AI_API_KEY=<tu-api-key-de-openai>
     SECRET_JWT=<tu-clave-secreta-jwt>
     ```
5. **Iniciar el Servidor de Desarrollo**
   ```bash
   npm run dev
   ```

---

## Frontend

### Pasos para Configurar el Frontend

1. **Clonar el Repositorio**
   ```bash
   git clone <URL-del-repositorio>
   ```

2. **Ir al Directorio del Frontend**
   ```bash
   cd iot-front
   ```

3. **Instalar Dependencias**
   ```bash
   npm install
   ```

4. **Iniciar el Servidor de Desarrollo**
   ```bash
   npm run dev
   ```

5. **Construir para Producción**
   ```bash
   npm run build
   ```

---

## Scripts Disponibles

### Frontend
- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Construye la aplicación para producción.
- `npm run lint`: Ejecuta ESLint para revisar el código.
- `npm run format`: Formatea el código con Prettier.

### Backend
- `npm run dev`: Inicia el servidor de desarrollo usando `nodemon`.

---

## Seguridad

1. **Mantén las Variables de Entorno Privadas**: Nunca compartas tu archivo `.env` ni incluyas tus claves API, contraseñas o secretos en el control de versiones.

2. **Actualiza las Dependencias Regularmente**: Asegúrate de mantener actualizadas las dependencias del proyecto para evitar vulnerabilidades conocidas.
   ```bash
   npm outdated
   npm update
   ```

3. **Usa HTTPS**: Configura tu aplicación para usar HTTPS en producción y protege las comunicaciones entre clientes y servidores.

4. **Autenticación Segura**: Implementa buenas prácticas de autenticación, como el uso de tokens JWT y un sistema de autorización robusto.

5. **Audita la Seguridad**: Utiliza herramientas como `npm audit` para analizar posibles vulnerabilidades en las dependencias.
   ```bash
   npm audit
   ```

---

## Contribuciones

1. **Clona el Repositorio**
   ```bash
   git clone <URL-del-repositorio>
   ```

2. **Crea una Rama para tus Cambios**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

3. **Realiza Tus Cambios y Haz Commit**
   ```bash
   git add .
   git commit -m "Agrega nueva funcionalidad"
   ```

4. **Sube Tus Cambios al Repositorio**
   ```bash
   git push origin feature/nueva-funcionalidad
   ```

5. **Crea un Pull Request (PR)**: Ve al repositorio en GitHub y abre un PR explicando tus cambios.

<<<<<<< HEAD
---
=======
---

>>>>>>> 826ea184b32fb16dd574750014afb05b5909b6ca
