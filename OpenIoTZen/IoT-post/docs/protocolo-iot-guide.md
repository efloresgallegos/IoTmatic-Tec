# Sistema de Protocolos IoT - OpenIoTZen

Este documento describe el nuevo sistema de protocolos IoT que soporta múltiples protocolos de comunicación para dispositivos IoT.

## Protocolos Soportados

### 1. WebSocket
- **Puerto por defecto**: 3000
- **Características**: Comunicación bidireccional en tiempo real
- **Uso**: Ideal para aplicaciones que requieren comunicación inmediata

### 2. MQTT
- **Puerto por defecto**: 1883
- **Características**: Protocolo ligero pub/sub
- **Uso**: Perfecto para dispositivos con recursos limitados

### 3. CoAP
- **Puerto por defecto**: 5683
- **Características**: Protocolo REST sobre UDP
- **Uso**: Excelente para redes con ancho de banda limitado

## API Endpoints

### Generar Código para Dispositivos

```http
POST /api/protocols/generate-code
Content-Type: application/json
Authorization: Bearer <token>

{
  "deviceId": "dispositivo-001",
  "modelId": "1",
  "userId": "usuario-123",
  "protocol": "mqtt",  // Opcional: websocket, mqtt, coap
  "connectionType": "periodic"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "device_id": "dispositivo-001",
    "model_id": "1",
    "user_id": "usuario-123",
    "model_name": "Sensor de Temperatura",
    "connection_type": "periodic",
    "token": "jwt.token.here",
    "protocols": {
      "mqtt": {
        "python": "# Código Python para MQTT...",
        "javascript": "// Código JavaScript para MQTT...",
        "arduino": "// Código Arduino para MQTT..."
      }
    },
    "generated_at": "2024-07-07T10:30:00.000Z"
  }
}
```

### Obtener Información de Protocolos

```http
GET /api/protocols
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "protocols": [
      {
        "name": "websocket",
        "running": true,
        "port": 3000,
        "connections": 5,
        "enabled": true
      },
      {
        "name": "mqtt",
        "running": true,
        "port": 1883,
        "connections": 12,
        "enabled": true
      },
      {
        "name": "coap",
        "running": true,
        "port": 5683,
        "connections": 3,
        "enabled": true
      }
    ],
    "total_protocols": 3,
    "active_protocols": 3
  }
}
```

### Enviar Datos a Dispositivo

```http
POST /api/protocols/send-to-device
Content-Type: application/json
Authorization: Bearer <token>

{
  "deviceId": "dispositivo-001",
  "data": {
    "command": "set_temperature",
    "value": 25.5,
    "timestamp": "2024-07-07T10:30:00.000Z"
  }
}
```

### Estadísticas de Conexiones

```http
GET /api/protocols/stats/connections
Authorization: Bearer <token>
```

## Formatos de Datos por Protocolo

### WebSocket
```javascript
// Envío de datos
{
  "event": "data",
  "data": {
    "token": "jwt.token.here",
    "payload": {
      "device_id": "dispositivo-001",
      "model_id": 1,
      "user_id": "usuario-123",
      "temperatura": 25.5,
      "humedad": 60
    }
  }
}

// Recepción de comandos
{
  "event": "command",
  "data": {
    "command": "set_parameter",
    "value": 30,
    "timestamp": "2024-07-07T10:30:00.000Z"
  }
}
```

### MQTT
**Topics:**
- Datos: `openiotzen/data/{user_id}/{model_id}/{device_id}`
- Comandos: `openiotzen/command/{user_id}/{model_id}/{device_id}`
- Estado: `openiotzen/status/{user_id}/{model_id}/{device_id}`

**Payload (JSON):**
```json
{
  "device_id": "dispositivo-001",
  "model_id": 1,
  "user_id": "usuario-123",
  "token": "jwt.token.here",
  "timestamp": "2024-07-07T10:30:00.000Z",
  "temperatura": 25.5,
  "humedad": 60
}
```

### CoAP
**Rutas:**
- Datos: `POST /openiotzen/data/{user_id}/{model_id}/{device_id}`
- Comandos: `GET /openiotzen/command/{user_id}/{model_id}/{device_id}`
- Estado: `POST /openiotzen/status/{user_id}/{model_id}/{device_id}`
- Descubrimiento: `GET /.well-known/core`

**Payload (JSON):**
```json
{
  "device_id": "dispositivo-001",
  "model_id": 1,
  "user_id": "usuario-123",
  "token": "jwt.token.here",
  "timestamp": "2024-07-07T10:30:00.000Z",
  "temperatura": 25.5,
  "humedad": 60
}
```

## Configuración de Puertos

Puede configurar los puertos usando variables de entorno:

```bash
# WebSocket
WS_PORT=3000

# MQTT
MQTT_PORT=1883
MQTT_CLIENT_ID=openiotzen-server

# CoAP
COAP_PORT=5683

# Configuración general
HOST=localhost
```

## Características del Sistema

### Autenticación
- Todos los protocolos usan tokens JWT para autenticación
- Los tokens incluyen información del dispositivo, modelo y usuario
- Validación automática en todos los endpoints

### Manejo de Conexiones
- Registro automático de dispositivos conectados
- Seguimiento del estado de conexión por protocolo
- Notificaciones de conexión/desconexión via WebSocket

### Generación de Código
- Código automático para Python, JavaScript y Arduino
- Plantillas personalizadas según el modelo de datos
- Soporte para diferentes tipos de conexión (periódica, por eventos)

### Integración
- Sistema unificado que mantiene compatibilidad con WebSocket existente
- API REST para gestión de protocolos
- Estadísticas en tiempo real de conexiones

## Ejemplos de Uso

### Cliente Python MQTT
```python
import paho.mqtt.client as mqtt
import json
import time

client = mqtt.Client("iot_dispositivo-001_1_usuario-123")
client.connect("localhost", 1883, 60)

def enviar_datos():
    data = {
        "device_id": "dispositivo-001",
        "model_id": 1,
        "user_id": "usuario-123",
        "token": "tu.jwt.token",
        "temperatura": 25.5,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
    }
    
    topic = "openiotzen/data/usuario-123/1/dispositivo-001"
    client.publish(topic, json.dumps(data))

# Enviar datos cada 10 segundos
while True:
    enviar_datos()
    time.sleep(10)
```

### Cliente JavaScript CoAP
```javascript
const coap = require('coap');

async function enviarDatos() {
    const data = {
        device_id: 'dispositivo-001',
        model_id: 1,
        user_id: 'usuario-123',
        token: 'tu.jwt.token',
        temperatura: 25.5,
        timestamp: new Date().toISOString()
    };

    const req = coap.request({
        host: 'localhost',
        port: 5683,
        pathname: '/openiotzen/data/usuario-123/1/dispositivo-001',
        method: 'POST'
    });

    req.write(JSON.stringify(data));
    req.end();
}

setInterval(enviarDatos, 10000);
```

## Migración desde WebSocket

El sistema mantiene compatibilidad completa con el WebSocket existente. Los dispositivos actuales seguirán funcionando sin cambios. Para migrar a otros protocolos:

1. Genere nuevo código usando `/api/protocols/generate-code`
2. Configure el protocolo deseado (`mqtt` o `coap`)
3. Actualice el firmware del dispositivo con el nuevo código
4. El sistema detectará automáticamente el protocolo usado

## Monitoreo y Debugging

### Logs del Sistema
```bash
# Ver logs de protocolos
tail -f logs/protocols.log

# Ver conexiones activas
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/protocols/stats/connections
```

### Herramientas de Testing
```bash
# Test MQTT
mosquitto_pub -h localhost -t "openiotzen/data/usuario/1/dispositivo" -m '{"test": true}'

# Test CoAP
coap-client -m post coap://localhost:5683/openiotzen/data/usuario/1/dispositivo -e '{"test": true}'
```

Este sistema proporciona una base sólida y escalable para conectar dispositivos IoT usando múltiples protocolos, manteniendo la compatibilidad con el sistema existente y ofreciendo nuevas capacidades para diferentes tipos de dispositivos y casos de uso.
