import jwt from 'jsonwebtoken';
import Model from '../models/models.model.js';
import { jsons } from '../jsons/index.js';

/**
 * Controlador para generar código WebSocket para diferentes lenguajes y tipos de conexión
 */
const websocketCodeController = {
  /**
   * Genera código WebSocket para Python, JavaScript y Arduino basado en el modelo y tipo de conexión
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} req.body - Cuerpo de la solicitud
   * @param {string} req.body.deviceId - ID del dispositivo
   * @param {string} req.body.modelId - ID del modelo
   * @param {string} req.body.userId - ID del usuario
   * @param {string} req.body.connectionType - Tipo de conexión (periodic, event, batch)
   * @param {Object} res - Objeto de respuesta Express
   */
  generateWebSocketCode: async (req, res) => {
    try {
      const { deviceId, modelId, userId, connectionType = 'periodic' } = req.body;

      // Buscar el modelo correspondiente
      const modelJson = jsons.find(json => json.model_id === modelId);
      if (!modelJson) {
        return res.status(404).json({ 
          success: false, 
          message: 'Modelo no encontrado' 
        });
      }

      // Generar token JWT (asumiendo que tienes una función para esto)
      const tokenData = {
        model: modelId,
        device: deviceId,
        user: userId
      };

      // Importar jwtMethods desde el archivo de utilidades
      const jwtMethods = (await import('../utils/jwt.util.js')).default;
      const token = jwtMethods.createDataToken(tokenData);

      // Generar código para cada lenguaje
      const pythonCode = generatePythonCode(modelJson, deviceId, modelId, userId, token, connectionType);
      const javascriptCode = generateJavaScriptCode(modelJson, deviceId, modelId, userId, token, connectionType);
      const arduinoCode = generateArduinoCode(modelJson, deviceId, modelId, userId, token, connectionType);

      res.json({
        success: true,
        data: {
          pythonCode,
          javascriptCode,
          arduinoCode
        }
      });
    } catch (error) {
      console.error('Error al generar código WebSocket:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al generar código WebSocket' 
      });
    }
  }
};

/**
 * Genera código Python para conexión WebSocket
 */
function generatePythonCode(modelJson, deviceId, modelId, userId, token, connectionType) {
  // Generar el código para los campos del modelo
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
    return `        "${field.name}": ${valueGenerator},  # ${field.required ? 'Campo requerido' : 'Campo opcional'}`;
  }).join('\n');

  return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Cliente WebSocket para IoT - Generado automáticamente
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
import sys
from datetime import datetime

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Configuración
WS_URL = "ws://localhost:3000/ws"  # Cambiar según tu servidor
JWT_TOKEN = "${token}"

def generate_data():
    """Genera datos según el modelo ${modelJson.name}"""
    return {
        "model_id": ${modelId},
        "device_id": ${deviceId},
        "user_id": ${userId},
${fieldsCode}
    }

def send_data():
    while True:
        try:
            data = generate_data()
            ws.send(json.dumps({
                "event": "data",
                "data": {
                    "token": JWT_TOKEN,
                    "payload": data
                }
            }))
            logging.info("Datos enviados correctamente")
            time.sleep(10)  # Intervalo de envío
        except Exception as e:
            logging.error(f"Error al enviar datos: {e}")
            time.sleep(5)  # Esperar antes de reintentar

def on_message(ws, message):
    logging.info(f"Mensaje recibido: {message}")

def on_error(ws, error):
    logging.error(f"Error: {error}")

def on_close(ws, close_status_code, close_msg):
    logging.warning("Conexión cerrada")

def on_open(ws):
    logging.info("Conexión establecida")
    threading.Thread(target=send_data).start()

if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp(
        WS_URL,
        header={"Authorization": f"Bearer {JWT_TOKEN}"},
        on_open=on_open,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close
    )
    ws.run_forever()`;
}

/**
 * Genera código JavaScript para conexión WebSocket
 */
function generateJavaScriptCode(modelJson, deviceId, modelId, userId, token, connectionType) {
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
    return `        "${field.name}": ${valueGenerator}, // ${field.required ? 'Campo requerido' : 'Campo opcional'}`;
  }).join('\n');

  return `// Cliente WebSocket para IoT - Generado automáticamente
const WebSocket = require('ws');

// Configuración
const WS_URL = "ws://localhost:3000/ws";  // Cambiar según tu servidor
const JWT_TOKEN = "${token}";

function generateData() {
    return {
        model_id: ${modelId},
        device_id: ${deviceId},
        user_id: ${userId},
${fieldsCode}
    };
}

function connect() {
    const ws = new WebSocket(WS_URL, {
        headers: { "Authorization": \`Bearer \${JWT_TOKEN}\` }
    });

    ws.on('open', () => {
        console.log('Conexión establecida');
        startSendingData(ws);
    });

    ws.on('message', (data) => {
        console.log('Mensaje recibido:', data.toString());
    });

    ws.on('error', (error) => {
        console.error('Error:', error);
    });

    ws.on('close', () => {
        console.log('Conexión cerrada');
        setTimeout(connect, 5000);
    });
}

function startSendingData(ws) {
    setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            const data = generateData();
            ws.send(JSON.stringify({
                event: "data",
                data: {
                    token: JWT_TOKEN,
                    payload: data
                }
            }));
            console.log('Datos enviados');
        }
    }, 10000);  // Intervalo de envío
}

// Iniciar conexión
connect();`;
}

/**
 * Genera código Arduino para conexión WebSocket
 */
function generateArduinoCode(modelJson, deviceId, modelId, userId, token, connectionType) {
  const fieldsCode = modelJson.fields.map(field => {
    let valueGenerator;
    if (field.type.value === 'Number') {
      valueGenerator = 'random(100) / 100.0';
    } else if (field.type.value === 'Boolean') {
      valueGenerator = 'random(2) == 1';
    } else {
      valueGenerator = `"valor_${field.name}"`;
    }
    return `    data["${field.name}"] = ${valueGenerator}; // ${field.required ? 'Campo requerido' : 'Campo opcional'}`;
  }).join('\n');

  return `#include <Arduino.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

// Configuración WiFi
const char* ssid = "TU_SSID";
const char* password = "TU_PASSWORD";

// Configuración WebSocket
const char* ws_server = "tu_servidor.com";
const int ws_port = 3000;
const char* ws_url = "/ws";
const char* jwt_token = "${token}";

WebSocketsClient webSocket;
unsigned long lastSend = 0;
const long interval = 10000;  // Intervalo de envío (10 segundos)

void generateAndSendData() {
    StaticJsonDocument<512> doc;
    JsonObject data = doc.createNestedObject("payload");
    
    data["model_id"] = ${modelId};
    data["device_id"] = ${deviceId};
    data["user_id"] = ${userId};
${fieldsCode}

    String output;
    serializeJson(doc, output);
    webSocket.sendTXT(output);
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_DISCONNECTED:
            Serial.println("Desconectado");
            break;
        case WStype_CONNECTED:
            Serial.println("Conectado");
            break;
        case WStype_TEXT:
            Serial.printf("Mensaje recibido: %s\\n", payload);
            break;
    }
}

void setup() {
    Serial.begin(115200);
    
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("WiFi conectado");

    webSocket.begin(ws_server, ws_port, ws_url);
    webSocket.setExtraHeaders(("Authorization: Bearer " + String(jwt_token)).c_str());
    webSocket.onEvent(webSocketEvent);
}

void loop() {
    webSocket.loop();
    
    unsigned long now = millis();
    if (now - lastSend >= interval) {
        generateAndSendData();
        lastSend = now;
    }
}`;
}

export default websocketCodeController;