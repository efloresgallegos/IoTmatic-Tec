# Guía de Autenticación y Suscripción WebSocket

## Introducción

Este documento describe el nuevo sistema de autenticación y suscripción para las conexiones WebSocket en OpenIoTZen. A partir de ahora, todas las conexiones WebSocket requieren:

1. **Autenticación obligatoria mediante token JWT**
2. **Suscripción obligatoria con model_id, device_id y user_id**

## Flujo de Conexión

El flujo completo para establecer una conexión WebSocket es el siguiente:

1. Obtener un token JWT válido mediante la API REST
2. Conectar al servidor WebSocket incluyendo el token en los headers
3. Enviar un mensaje de suscripción con model_id, device_id y user_id
4. Recibir confirmación de suscripción
5. Comenzar a enviar/recibir mensajes

## Autenticación con Token JWT

### Formato del Token

El token JWT debe incluir los siguientes claims:

```json
{
  "user": "[ID del usuario]",
  "device": "[ID del dispositivo]",
  "model": "[ID del modelo]",
  "exp": "[Timestamp de expiración]"
}
```

### Envío del Token

Existen dos formas de enviar el token al conectarse:

1. **Header de Autorización**: Incluir el token en el header `Authorization` con el prefijo `Bearer`
2. **Protocolo WebSocket**: Incluir el token como protocolo WebSocket

#### Ejemplo con Header de Autorización

```javascript
const socket = new WebSocket('ws://servidor:puerto/ruta');
socket.setRequestHeader('Authorization', `Bearer ${token}`);
```

#### Ejemplo con Protocolo WebSocket

```javascript
const socket = new WebSocket('ws://servidor:puerto/ruta', [`Bearer ${token}`]);
```

## Suscripción Obligatoria

Una vez establecida la conexión autenticada, se debe enviar un mensaje de suscripción en los primeros 10 segundos. De lo contrario, la conexión será cerrada automáticamente.

### Formato del Mensaje de Suscripción

```json
{
  "event": "subscribe",
  "data": {
    "token": "[Token JWT]",
    "device_id": "[ID del dispositivo]",
    "model_id": "[ID del modelo]",
    "user_id": "[ID del usuario]"
  }
}
```

### Respuesta de Confirmación

Si la suscripción es exitosa, el servidor responderá con:

```json
{
  "event": "subscription_confirmed",
  "data": {
    "status": "success",
    "subscriptions": ["device_[ID]", "model_[ID]", "user_[ID]", ...],
    "device_id": "[ID del dispositivo]",
    "model_id": "[ID del modelo]",
    "user_id": "[ID del usuario]"
  }
}
```

### Respuesta de Error

Si hay un error en la suscripción, el servidor responderá con:

```json
{
  "event": "subscription_error",
  "data": {
    "message": "[Mensaje de error]"
  }
}
```

## Envío de Mensajes

Una vez autenticado y suscrito, se pueden enviar mensajes al servidor. Todos los mensajes deben incluir:

1. Un campo `event` que indique el tipo de mensaje
2. Un campo `data` con los datos del mensaje

### Ejemplo de Mensaje de Datos

```json
{
  "event": "data",
  "data": {
    "token": "[Token JWT]",
    "device_id": "[ID del dispositivo]",
    "model_id": "[ID del modelo]",
    "user_id": "[ID del usuario]",
    "payload": {
      // Datos específicos del mensaje
    }
  }
}
```

## Implementación en el Cliente

Se ha creado un servicio WebSocket para facilitar la implementación en el cliente. Este servicio maneja automáticamente:

- Conexión con token
- Suscripción obligatoria
- Reconexión automática
- Gestión de eventos

### Ejemplo de Uso

```javascript
import websocketService from '../services/websocket.service.js';

async function conectarYSuscribir() {
  try {
    // 1. Obtener token
    const token = localStorage.getItem('auth_token');
    
    // 2. Conectar con token
    await websocketService.connect(token);
    
    // 3. Suscribirse con parámetros obligatorios
    await websocketService.subscribe({
      token,
      device_id: 'dispositivo-123',
      model_id: 'modelo-456',
      user_id: 'usuario-789'
    });
    
    // 4. Configurar listeners para eventos
    websocketService.addMessageListener('data_event', (message) => {
      console.log('Datos recibidos:', message.data);
    });
    
    // 5. Enviar datos
    websocketService.send({
      event: 'data',
      data: {
        token,
        device_id: 'dispositivo-123',
        model_id: 'modelo-456',
        user_id: 'usuario-789',
        temperatura: 25.5,
        humedad: 60
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 1008   | Error de autenticación o suscripción |

## Consideraciones de Seguridad

1. **Almacenamiento de Tokens**: Almacenar los tokens de forma segura en el cliente
2. **Expiración**: Establecer tiempos de expiración razonables para los tokens
3. **Renovación**: Implementar mecanismos para renovar tokens expirados
4. **HTTPS**: Usar HTTPS para la obtención inicial de tokens
5. **WSS**: Usar WSS (WebSocket Secure) en producción

## Solución de Problemas

### Conexión Rechazada

- Verificar que el token sea válido y no haya expirado
- Comprobar que el formato del token sea correcto

### Suscripción Fallida

- Verificar que se estén enviando todos los parámetros obligatorios
- Comprobar que los IDs coincidan con los del token

### Desconexión Inesperada

- Verificar la validez del token
- Comprobar que se haya realizado la suscripción correctamente
- Revisar los logs del servidor para más detalles