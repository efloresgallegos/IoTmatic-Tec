import ProtocolInterface from '../base/ProtocolInterface.js';
import { setupWebSocketServer, emitToRoom, addToRoom } from '../../WebSockets/webSocket.server.js';
import { processSubscriptionMessage, emitDataEvent, verifyToken } from '../../WebSockets/subscription.socket.js';
import { emitDeviceStatusUpdate } from '../../WebSockets/device.socket.js';

/**
 * Adaptador del protocolo WebSocket existente para la nueva arquitectura de protocolos
 * Integra el sistema WebSocket actual con el framework de protocolos IoT
 */
class WebSocketProtocol extends ProtocolInterface {
  constructor(config = {}) {
    super(config);
    this.wss = null;
    this.server = null;
    this.authenticatedClients = new Map(); // Mapea device_id -> ws connection
  }

  /**
   * Inicia el servidor WebSocket (ya está iniciado, solo registramos eventos)
   */
  async start() {
    if (this.isRunning) {
      console.log('WebSocket protocol ya está registrado');
      return;
    }

    try {
      // El servidor WebSocket ya está iniciado en index.js
      // Solo registramos este protocolo como activo
      this.isRunning = true;
      
      // Configurar integración con el sistema existente
      this.setupProtocolIntegration();
      
      console.log(`WebSocket protocol registrado en puerto ${this.config.port}`);

    } catch (error) {
      console.error('Error registrando WebSocket protocol:', error);
      throw error;
    }
  }

  /**
   * Detiene el protocolo WebSocket
   */
  async stop() {
    if (!this.isRunning) {
      return;
    }

    try {
      this.isRunning = false;
      this.authenticatedClients.clear();
      this.connections.clear();
      
      console.log('WebSocket protocol detenido');

    } catch (error) {
      console.error('Error deteniendo WebSocket protocol:', error);
      throw error;
    }
  }

  /**
   * Configura la integración con el sistema WebSocket existente
   */
  setupProtocolIntegration() {
    // Este método configura los hooks necesarios para integrar
    // el sistema WebSocket existente con el nuevo framework de protocolos
    
    // Por ahora, el sistema WebSocket funciona independientemente
    // pero reporta eventos a través del ProtocolManager
    console.log('Integración WebSocket configurada con el framework de protocolos');
  }

  /**
   * Maneja la conexión de un cliente WebSocket
   * @param {Object} ws - Conexión WebSocket
   * @param {Object} deviceInfo - Información del dispositivo
   */
  handleClientConnection(ws, deviceInfo) {
    try {
      const { device_id, model_id, user_id } = deviceInfo;
      
      // Registrar cliente en el protocolo
      this.registerClient(device_id, ws);
      this.authenticatedClients.set(device_id, ws);

      // Emitir evento de conexión
      this.emit('device_connected', {
        device_id,
        model_id,
        user_id,
        ip: ws._socket?.remoteAddress,
        protocol: 'WebSocket'
      });

      console.log(`Cliente WebSocket registrado: dispositivo ${device_id}`);

    } catch (error) {
      console.error('Error manejando conexión WebSocket:', error);
    }
  }

  /**
   * Maneja la desconexión de un cliente WebSocket
   * @param {Object} ws - Conexión WebSocket
   * @param {Object} deviceInfo - Información del dispositivo
   */
  handleClientDisconnection(ws, deviceInfo) {
    try {
      const { device_id, model_id, user_id } = deviceInfo;
      
      // Desregistrar cliente
      this.unregisterClient(device_id);
      this.authenticatedClients.delete(device_id);

      // Emitir evento de desconexión
      this.emit('device_disconnected', {
        device_id,
        model_id,
        user_id,
        protocol: 'WebSocket'
      });

      console.log(`Cliente WebSocket desconectado: dispositivo ${device_id}`);

    } catch (error) {
      console.error('Error manejando desconexión WebSocket:', error);
    }
  }

  /**
   * Maneja datos recibidos vía WebSocket
   * @param {Object} data - Datos recibidos
   * @param {Object} client - Cliente WebSocket que envió los datos
   */
  async handleData(data, client) {
    try {
      // Validar token si está presente
      if (data.token) {
        const tokenData = verifyToken(data.token);
        if (!tokenData) {
          console.error('Token inválido en datos WebSocket');
          return;
        }
        
        // Completar datos desde el token si es necesario
        if (!data.device_id && tokenData.device) data.device_id = tokenData.device;
        if (!data.model_id && tokenData.model) data.model_id = tokenData.model;
        if (!data.user_id && tokenData.user) data.user_id = tokenData.user;
      }

      // Validar datos requeridos
      if (!data.device_id || !data.model_id || !data.user_id) {
        console.error('Datos incompletos recibidos vía WebSocket:', data);
        return;
      }

      // Procesar datos con el sistema existente
      const processedData = {
        device_id: data.device_id,
        model_id: data.model_id,
        user_id: data.user_id,
        timestamp: data.timestamp || new Date().toISOString(),
        protocol: 'WebSocket',
        ...data.payload || data
      };

      // Eliminar campos de control
      delete processedData.token;
      delete processedData.payload;

      // Emitir evento a través del framework de protocolos
      this.emit('data', processedData);

      console.log(`Datos WebSocket procesados para dispositivo ${data.device_id}`);

    } catch (error) {
      console.error('Error procesando datos WebSocket:', error);
    }
  }

  /**
   * Envía datos a un dispositivo específico vía WebSocket
   * @param {string} deviceId - ID del dispositivo
   * @param {Object} data - Datos a enviar
   */
  async sendToDevice(deviceId, data) {
    try {
      const ws = this.authenticatedClients.get(deviceId);
      
      if (!ws || ws.readyState !== 1) { // 1 = WebSocket.OPEN
        throw new Error(`Dispositivo ${deviceId} no está conectado o la conexión no está activa`);
      }

      // Enviar datos usando el formato estándar de WebSocket
      ws.send(JSON.stringify({
        event: 'command',
        data: {
          ...data,
          timestamp: new Date().toISOString(),
          target_device: deviceId
        }
      }));

      console.log(`Datos enviados a dispositivo ${deviceId} vía WebSocket`);

    } catch (error) {
      console.error('Error enviando datos vía WebSocket:', error);
      throw error;
    }
  }

  /**
   * Envía difusión a múltiples dispositivos
   * @param {Array} deviceIds - Lista de IDs de dispositivos
   * @param {Object} data - Datos a enviar
   */
  async broadcastToDevices(deviceIds, data) {
    const promises = deviceIds.map(deviceId => {
      return this.sendToDevice(deviceId, data).catch(error => {
        console.error(`Error enviando a dispositivo ${deviceId}:`, error);
      });
    });

    await Promise.allSettled(promises);
  }

  /**
   * Emite datos a una sala específica (funcionalidad del sistema existente)
   * @param {string} roomId - ID de la sala
   * @param {string} event - Nombre del evento
   * @param {Object} data - Datos a emitir
   */
  emitToRoom(roomId, event, data) {
    emitToRoom(roomId, event, data);
  }

  /**
   * Añade un cliente a una sala específica
   * @param {string} roomId - ID de la sala
   * @param {Object} ws - Conexión WebSocket
   */
  addToRoom(roomId, ws) {
    addToRoom(roomId, ws);
  }

  /**
   * Obtiene el estado de conexión de un dispositivo
   * @param {string} deviceId - ID del dispositivo
   * @returns {Object} - Estado de la conexión
   */
  getDeviceConnectionStatus(deviceId) {
    const ws = this.authenticatedClients.get(deviceId);
    
    return {
      connected: ws && ws.readyState === 1,
      readyState: ws ? ws.readyState : null,
      lastSeen: ws ? new Date() : null
    };
  }

  /**
   * Obtiene todas las conexiones activas
   * @returns {Array} - Lista de dispositivos conectados
   */
  getActiveConnections() {
    const connections = [];
    
    for (const [deviceId, ws] of this.authenticatedClients) {
      if (ws.readyState === 1) {
        connections.push({
          device_id: deviceId,
          status: 'online',
          protocol: 'WebSocket',
          connected_at: ws.connectedAt || new Date(),
          ip: ws._socket?.remoteAddress
        });
      }
    }
    
    return connections;
  }

  /**
   * Obtiene el nombre del protocolo
   * @returns {string} - Nombre del protocolo
   */
  getProtocolName() {
    return 'WebSocket';
  }

  /**
   * Obtiene el puerto por defecto del protocolo
   * @returns {number} - Puerto por defecto
   */
  getDefaultPort() {
    return 3000;
  }

  /**
   * Genera código cliente para WebSocket (usa el sistema existente)
   * @param {Object} params - Parámetros para generar el código
   * @returns {Object} - Código generado para diferentes lenguajes
   */
  generateClientCode(params) {
    const { modelJson, deviceId, modelId, userId, token } = params;
    
    return {
      python: this.generatePythonCode(modelJson, deviceId, modelId, userId, token),
      javascript: this.generateJavaScriptCode(modelJson, deviceId, modelId, userId, token),
      arduino: this.generateArduinoCode(modelJson, deviceId, modelId, userId, token)
    };
  }

  /**
   * Genera código Python para cliente WebSocket
   */
  generatePythonCode(modelJson, deviceId, modelId, userId, token) {
    const fieldsCode = modelJson.fields.map(field => {
      let valueGenerator;
      if (field.type.value === 'Number') {
        const min = field.min !== null ? field.min : 0;
        const max = field.max !== null ? field.max : 100;
        valueGenerator = `round(random.uniform(${min}, ${max}), 2)`;
      } else if (field.type.value === 'Boolean') {
        valueGenerator = 'random.choice([True, False])';
      } else {
        valueGenerator = `"valor_${field.name}"`;
      }
      return `        "${field.name}": ${valueGenerator},`;
    }).join('\n');

    return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Cliente WebSocket IoT - Generado automáticamente
Modelo: ${modelJson.name}
Dispositivo ID: ${deviceId}
Usuario ID: ${userId}
"""

import websocket
import json
import time
import random
import threading
import logging

# Configuración
WS_URL = "ws://localhost:3000/ws"
JWT_TOKEN = "${token}"

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_data():
    """Genera datos según el modelo ${modelJson.name}"""
    return {
        "device_id": "${deviceId}",
        "model_id": ${modelId},
        "user_id": "${userId}",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
${fieldsCode}
    }

def on_message(ws, message):
    """Callback para mensajes recibidos"""
    try:
        data = json.loads(message)
        logger.info(f"Mensaje recibido: {data}")
        
        if data.get('event') == 'command':
            logger.info(f"Comando recibido: {data.get('data')}")
    except Exception as e:
        logger.error(f"Error procesando mensaje: {e}")

def on_error(ws, error):
    """Callback para errores"""
    logger.error(f"Error WebSocket: {error}")

def on_close(ws, close_status_code, close_msg):
    """Callback para cierre de conexión"""
    logger.info("Conexión WebSocket cerrada")

def on_open(ws):
    """Callback para apertura de conexión"""
    logger.info("Conexión WebSocket establecida")
    
    # Enviar suscripción automática
    subscription_msg = {
        "event": "subscribe",
        "data": {
            "token": JWT_TOKEN,
            "device_id": "${deviceId}",
            "model_id": ${modelId},
            "user_id": "${userId}"
        }
    }
    ws.send(json.dumps(subscription_msg))
    
    # Iniciar envío periódico de datos
    def send_periodic_data():
        while True:
            try:
                data = generate_data()
                message = {
                    "event": "data",
                    "data": {
                        "token": JWT_TOKEN,
                        "payload": data
                    }
                }
                ws.send(json.dumps(message))
                logger.info("Datos enviados correctamente")
                time.sleep(10)  # Enviar cada 10 segundos
            except Exception as e:
                logger.error(f"Error enviando datos: {e}")
                break
    
    thread = threading.Thread(target=send_periodic_data)
    thread.daemon = True
    thread.start()

def main():
    """Función principal"""
    # Crear conexión WebSocket con autenticación
    ws = websocket.WebSocketApp(
        WS_URL,
        header={"Authorization": f"Bearer {JWT_TOKEN}"},
        on_open=on_open,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close
    )
    
    # Ejecutar conexión
    ws.run_forever()

if __name__ == "__main__":
    main()`;
  }

  /**
   * Genera código JavaScript para cliente WebSocket
   */
  generateJavaScriptCode(modelJson, deviceId, modelId, userId, token) {
    const fieldsCode = modelJson.fields.map(field => {
      let valueGenerator;
      if (field.type.value === 'Number') {
        const min = field.min !== null ? field.min : 0;
        const max = field.max !== null ? field.max : 100;
        valueGenerator = `Math.round((Math.random() * (${max} - ${min}) + ${min}) * 100) / 100`;
      } else if (field.type.value === 'Boolean') {
        valueGenerator = 'Math.random() > 0.5';
      } else {
        valueGenerator = `"valor_${field.name}"`;
      }
      return `        "${field.name}": ${valueGenerator},`;
    }).join('\n');

    return `// Cliente WebSocket IoT - Generado automáticamente
const WebSocket = require('ws');

// Configuración
const WS_URL = "ws://localhost:3000/ws";
const JWT_TOKEN = "${token}";

function generateData() {
    return {
        device_id: '${deviceId}',
        model_id: ${modelId},
        user_id: '${userId}',
        timestamp: new Date().toISOString(),
${fieldsCode}
    };
}

function connect() {
    const ws = new WebSocket(WS_URL, {
        headers: { "Authorization": \`Bearer \${JWT_TOKEN}\` }
    });

    ws.on('open', () => {
        console.log('Conexión WebSocket establecida');
        
        // Enviar suscripción
        const subscriptionMsg = {
            event: "subscribe",
            data: {
                token: JWT_TOKEN,
                device_id: '${deviceId}',
                model_id: ${modelId},
                user_id: '${userId}'
            }
        };
        ws.send(JSON.stringify(subscriptionMsg));
        
        // Iniciar envío periódico de datos
        setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                const data = generateData();
                const message = {
                    event: "data",
                    data: {
                        token: JWT_TOKEN,
                        payload: data
                    }
                };
                ws.send(JSON.stringify(message));
                console.log('Datos enviados correctamente');
            }
        }, 10000); // Cada 10 segundos
    });

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            console.log('Mensaje recibido:', message);
            
            if (message.event === 'command') {
                console.log('Comando recibido:', message.data);
            }
        } catch (error) {
            console.error('Error procesando mensaje:', error);
        }
    });

    ws.on('error', (error) => {
        console.error('Error WebSocket:', error);
    });

    ws.on('close', () => {
        console.log('Conexión cerrada. Reintentando en 5 segundos...');
        setTimeout(connect, 5000);
    });
}

// Iniciar conexión
connect();`;
  }

  /**
   * Genera código Arduino para cliente WebSocket
   */
  generateArduinoCode(modelJson, deviceId, modelId, userId, token) {
    const fieldsCode = modelJson.fields.map(field => {
      let valueGenerator;
      if (field.type.value === 'Number') {
        valueGenerator = 'random(100) / 100.0';
      } else if (field.type.value === 'Boolean') {
        valueGenerator = 'random(2) == 1';
      } else {
        valueGenerator = `"valor_${field.name}"`;
      }
      return `    doc["${field.name}"] = ${valueGenerator};`;
    }).join('\n');

    return `#include <Arduino.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

// Configuración WiFi
const char* ssid = "TU_SSID";
const char* password = "TU_PASSWORD";

// Configuración WebSocket
const char* ws_server = "localhost";
const int ws_port = 3000;
const char* ws_url = "/ws";
const char* jwt_token = "${token}";

WebSocketsClient webSocket;
unsigned long lastSend = 0;
const long interval = 10000;  // Intervalo de envío (10 segundos)
bool subscribed = false;

void generateAndSendData() {
    StaticJsonDocument<512> messageDoc;
    StaticJsonDocument<256> dataDoc;
    
    // Generar datos
    dataDoc["device_id"] = "${deviceId}";
    dataDoc["model_id"] = ${modelId};
    dataDoc["user_id"] = "${userId}";
    dataDoc["timestamp"] = millis();
${fieldsCode}

    // Crear mensaje completo
    messageDoc["event"] = "data";
    messageDoc["data"]["token"] = jwt_token;
    messageDoc["data"]["payload"] = dataDoc;

    String output;
    serializeJson(messageDoc, output);
    webSocket.sendTXT(output);
    
    Serial.println("Datos enviados: " + output);
}

void sendSubscription() {
    StaticJsonDocument<256> subDoc;
    
    subDoc["event"] = "subscribe";
    subDoc["data"]["token"] = jwt_token;
    subDoc["data"]["device_id"] = "${deviceId}";
    subDoc["data"]["model_id"] = ${modelId};
    subDoc["data"]["user_id"] = "${userId}";
    
    String output;
    serializeJson(subDoc, output);
    webSocket.sendTXT(output);
    
    Serial.println("Suscripción enviada");
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_DISCONNECTED:
            Serial.println("WebSocket Desconectado");
            subscribed = false;
            break;
            
        case WStype_CONNECTED:
            Serial.printf("WebSocket Conectado a: %s\\n", payload);
            sendSubscription();
            break;
            
        case WStype_TEXT:
            Serial.printf("Mensaje recibido: %s\\n", payload);
            
            // Procesar mensaje de confirmación de suscripción
            StaticJsonDocument<256> doc;
            deserializeJson(doc, payload);
            
            if (doc["event"] == "subscription_confirmed") {
                subscribed = true;
                Serial.println("Suscripción confirmada");
            } else if (doc["event"] == "command") {
                Serial.println("Comando recibido:");
                serializeJsonPretty(doc["data"], Serial);
            }
            break;
            
        default:
            break;
    }
}

void setup() {
    Serial.begin(115200);
    
    // Conectar WiFi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("WiFi conectado");

    // Configurar WebSocket con autenticación
    webSocket.begin(ws_server, ws_port, ws_url);
    webSocket.setExtraHeaders(("Authorization: Bearer " + String(jwt_token)).c_str());
    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(5000);
}

void loop() {
    webSocket.loop();
    
    unsigned long now = millis();
    if (subscribed && (now - lastSend >= interval)) {
        generateAndSendData();
        lastSend = now;
    }
}`;
  }

  /**
   * Método auxiliar para integrar eventos del sistema WebSocket existente
   * @param {string} eventType - Tipo de evento
   * @param {Object} data - Datos del evento
   */
  handleWebSocketSystemEvent(eventType, data) {
    try {
      switch (eventType) {
        case 'device_connected':
          this.handleClientConnection(data.ws, data.deviceInfo);
          break;
        case 'device_disconnected':
          this.handleClientDisconnection(data.ws, data.deviceInfo);
          break;
        case 'data_received':
          this.handleData(data.data, data.client);
          break;
        default:
          console.log(`Evento WebSocket no manejado: ${eventType}`);
      }
    } catch (error) {
      console.error('Error manejando evento del sistema WebSocket:', error);
    }
  }
}

export default WebSocketProtocol;