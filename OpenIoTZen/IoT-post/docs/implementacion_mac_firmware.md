# Implementación de Captura de MAC y Firmware en Dispositivos IoT

## Introducción

Este documento describe cómo implementar la captura y envío de la dirección MAC y versión de firmware desde los dispositivos IoT hacia el servidor OpenIoTZen. Estas mejoras permiten una identificación más precisa de los dispositivos conectados y facilitan la gestión de actualizaciones de firmware.

## Modificaciones Realizadas

Se han realizado las siguientes modificaciones en el sistema:

1. Actualización del servicio de conexiones para almacenar la dirección MAC y versión de firmware
2. Actualización del controlador para mostrar estos datos en las respuestas API

## Implementación en el Cliente (Dispositivo IoT)

### 1. Obtención de la Dirección MAC

Dependiendo del hardware y sistema operativo del dispositivo IoT, se puede obtener la dirección MAC de diferentes formas:

#### Para ESP8266/ESP32 (Arduino):

```cpp
#include <WiFi.h>  // Para ESP32
// O #include <ESP8266WiFi.h> para ESP8266

String obtenerMAC() {
  byte mac[6];
  WiFi.macAddress(mac);
  char macStr[18] = { 0 };
  sprintf(macStr, "%02X:%02X:%02X:%02X:%02X:%02X", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  return String(macStr);
}
```

#### Para Raspberry Pi (Python):

```python
import uuid

def obtener_mac():
    return ':'.join(['{:02x}'.format((uuid.getnode() >> elements) & 0xff) for elements in range(0,8*6,8)][::-1])
```

### 2. Obtención de la Versión de Firmware

La versión de firmware debe ser definida en el código del dispositivo:

#### Para Arduino:

```cpp
#define FIRMWARE_VERSION "1.2.3"

String obtenerVersionFirmware() {
  return FIRMWARE_VERSION;
}
```

#### Para Python:

```python
FIRMWARE_VERSION = "1.2.3"

def obtener_version_firmware():
    return FIRMWARE_VERSION
```

### 3. Envío de Datos al Conectarse

Al establecer la conexión WebSocket con el servidor, el dispositivo debe enviar estos datos como parte del mensaje de identificación inicial o en los headers de la conexión.

#### Ejemplo con WebSocket (JavaScript/Node.js):

```javascript
const WebSocket = require('ws');
const os = require('os');

// Obtener interfaces de red
const interfaces = os.networkInterfaces();
let macAddress = 'desconocida';

// Buscar la dirección MAC en las interfaces disponibles
for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    if (iface.family === 'IPv4' && !iface.internal) {
      // En algunos sistemas, la dirección MAC está disponible como iface.mac
      if (iface.mac && iface.mac !== '00:00:00:00:00:00') {
        macAddress = iface.mac;
        break;
      }
    }
  }
}

const FIRMWARE_VERSION = '1.0.0';
const DEVICE_ID = 'device123';
const MODEL_ID = 'model456';
const USER_ID = 'user789';

// Conectar al servidor WebSocket
const ws = new WebSocket('ws://servidor:puerto/path');

ws.on('open', function open() {
  // Enviar mensaje de identificación con MAC y firmware
  const identificationMessage = {
    type: 'identification',
    device_id: DEVICE_ID,
    model_id: MODEL_ID,
    user_id: USER_ID,
    mac: macAddress,
    firmware: FIRMWARE_VERSION
  };
  
  ws.send(JSON.stringify(identificationMessage));
});
```

## Implementación en el Servidor

El servidor debe estar preparado para recibir estos datos adicionales y almacenarlos. Las modificaciones ya realizadas en el servicio de conexiones permiten esto.

### Ejemplo de Procesamiento en el Servidor (WebSocket)

```javascript
// En el manejador de conexiones WebSocket
wsServer.on('connection', (ws, req) => {
  // Obtener IP del cliente
  const ip = req.socket.remoteAddress;
  
  // Esperar mensaje de identificación
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'identification') {
        // Registrar la conexión con los datos recibidos
        const connectionData = {
          device_id: data.device_id,
          model_id: data.model_id,
          user_id: data.user_id,
          ip: ip,
          mac: data.mac,         // Usar la MAC recibida
          firmware: data.firmware // Usar el firmware recibido
        };
        
        // Registrar en el servicio de conexiones
        connectionsService.registerConnection(connectionData);
        
        // Confirmar registro al dispositivo
        ws.send(JSON.stringify({ type: 'identification_ack', status: 'success' }));
      }
    } catch (error) {
      console.error('Error al procesar mensaje:', error);
    }
  });
});
```

## Consideraciones de Seguridad

- La dirección MAC es un identificador único que puede usarse para rastrear dispositivos. Asegúrese de cumplir con las regulaciones de privacidad aplicables.
- Considere implementar cifrado para proteger estos datos durante la transmisión.
- Valide los datos recibidos para evitar inyecciones o desbordamientos.

## Pruebas

Para probar esta implementación:

1. Actualice el firmware de sus dispositivos para incluir el envío de MAC y versión.
2. Verifique en los logs del servidor que los datos se reciben correctamente.
3. Use la API para obtener información de conexiones y confirme que muestra los nuevos campos.

## Conclusión

Con estas modificaciones, el sistema ahora puede identificar dispositivos de manera más precisa y gestionar mejor las versiones de firmware, lo que facilita el mantenimiento y las actualizaciones de la red IoT.