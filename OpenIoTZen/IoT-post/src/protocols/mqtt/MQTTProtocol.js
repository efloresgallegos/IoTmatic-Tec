import ProtocolInterface from '../base/ProtocolInterface.js';
import Aedes from 'aedes';
import { createServer } from 'net';
import mqtt from 'mqtt';

/**
 * Implementación del protocolo MQTT para IoT
 * Soporta tanto broker MQTT como cliente para comunicación bidireccional
 */
class MQTTProtocol extends ProtocolInterface {
  constructor(config = {}) {
    super(config);
    this.broker = null;
    this.server = null;
    this.clients = new Map(); // Mapea clientId -> client info
    this.deviceTopics = new Map(); // Mapea device_id -> topic patterns
  }

  /**
   * Inicia el broker MQTT
   */
  async start() {
    if (this.isRunning) {
      console.log('MQTT broker ya está ejecutándose');
      return;
    }

    try {
      // Crear instancia de Aedes (broker MQTT)
      this.broker = new Aedes({
        id: this.config.clientId || 'openiotzen-mqtt-broker',
        persistence: null, // Usar persistencia en memoria por defecto
        heartbeatInterval: 60000,
        connectTimeout: 30000
      });

      // Crear servidor TCP para el broker
      this.server = createServer(this.broker.handle);

      // Configurar eventos del broker
      this.setupBrokerEvents();

      // Iniciar el servidor
      await new Promise((resolve, reject) => {
        this.server.listen(this.config.port, this.config.host, (error) => {
          if (error) {
            reject(error);
          } else {
            this.isRunning = true;
            console.log(`MQTT broker iniciado en ${this.config.host}:${this.config.port}`);
            resolve();
          }
        });
      });

    } catch (error) {
      console.error('Error iniciando MQTT broker:', error);
      throw error;
    }
  }

  /**
   * Detiene el broker MQTT
   */
  async stop() {
    if (!this.isRunning) {
      return;
    }

    try {
      if (this.server) {
        await new Promise((resolve) => {
          this.server.close(() => {
            console.log('MQTT server cerrado');
            resolve();
          });
        });
      }

      if (this.broker) {
        await new Promise((resolve) => {
          this.broker.close(() => {
            console.log('MQTT broker cerrado');
            resolve();
          });
        });
      }

      this.isRunning = false;
      this.clients.clear();
      this.deviceTopics.clear();

    } catch (error) {
      console.error('Error deteniendo MQTT broker:', error);
      throw error;
    }
  }

  /**
   * Configura los eventos del broker MQTT
   */
  setupBrokerEvents() {
    // Cliente conectado
    this.broker.on('client', (client) => {
      console.log(`Cliente MQTT conectado: ${client.id}`);
      this.handleClientConnect(client);
    });

    // Cliente desconectado
    this.broker.on('clientDisconnect', (client) => {
      console.log(`Cliente MQTT desconectado: ${client.id}`);
      this.handleClientDisconnect(client);
    });

    // Mensaje publicado
    this.broker.on('publish', (packet, client) => {
      if (client) {
        this.handleMessage(packet, client);
      }
    });

    // Cliente suscrito a topic
    this.broker.on('subscribe', (subscriptions, client) => {
      console.log(`Cliente ${client.id} suscrito a:`, subscriptions.map(s => s.topic));
    });

    // Error en el broker
    this.broker.on('error', (error) => {
      console.error('Error en MQTT broker:', error);
      this.emit('error', error);
    });
  }

  /**
   * Maneja la conexión de un cliente MQTT
   * @param {Object} client - Cliente MQTT conectado
   */
  handleClientConnect(client) {
    try {
      // Extraer información del dispositivo del client ID
      // Formato esperado: device_<device_id>_model_<model_id>_user_<user_id>
      const deviceInfo = this.parseClientId(client.id);
      
      if (deviceInfo) {
        // Registrar cliente
        this.clients.set(client.id, {
          client,
          deviceInfo,
          connectedAt: new Date()
        });

        // Configurar topics para este dispositivo
        this.setupDeviceTopics(deviceInfo);

        // Registrar conexión
        this.registerClient(deviceInfo.device_id, client);

        // Emitir evento de conexión
        this.emit('device_connected', {
          device_id: deviceInfo.device_id,
          model_id: deviceInfo.model_id,
          user_id: deviceInfo.user_id,
          client_id: client.id,
          ip: client.conn.remoteAddress
        });
      }
    } catch (error) {
      console.error('Error manejando conexión MQTT:', error);
    }
  }

  /**
   * Maneja la desconexión de un cliente MQTT
   * @param {Object} client - Cliente MQTT desconectado
   */
  handleClientDisconnect(client) {
    try {
      const clientInfo = this.clients.get(client.id);
      
      if (clientInfo && clientInfo.deviceInfo) {
        // Desregistrar cliente
        this.unregisterClient(clientInfo.deviceInfo.device_id);
        
        // Emitir evento de desconexión
        this.emit('device_disconnected', {
          device_id: clientInfo.deviceInfo.device_id,
          model_id: clientInfo.deviceInfo.model_id,
          user_id: clientInfo.deviceInfo.user_id,
          client_id: client.id
        });
      }

      // Limpiar datos del cliente
      this.clients.delete(client.id);
    } catch (error) {
      console.error('Error manejando desconexión MQTT:', error);
    }
  }

  /**
   * Maneja mensajes MQTT recibidos
   * @param {Object} packet - Paquete MQTT
   * @param {Object} client - Cliente que envió el mensaje
   */
  handleMessage(packet, client) {
    try {
      // Ignorar mensajes del sistema
      if (packet.topic.startsWith('$SYS/')) {
        return;
      }

      console.log(`Mensaje MQTT recibido en topic ${packet.topic} de cliente ${client.id}`);

      const clientInfo = this.clients.get(client.id);
      if (!clientInfo || !clientInfo.deviceInfo) {
        console.log('Mensaje de cliente no registrado, ignorando');
        return;
      }

      // Parsear payload
      let data;
      try {
        data = JSON.parse(packet.payload.toString());
      } catch (error) {
        console.error('Error parseando payload MQTT:', error);
        return;
      }

      // Completar datos del dispositivo
      const completeData = {
        device_id: clientInfo.deviceInfo.device_id,
        model_id: clientInfo.deviceInfo.model_id,
        user_id: clientInfo.deviceInfo.user_id,
        topic: packet.topic,
        timestamp: new Date().toISOString(),
        ...data
      };

      // Emitir evento de datos
      this.emit('data', completeData);

    } catch (error) {
      console.error('Error manejando mensaje MQTT:', error);
    }
  }

  /**
   * Configura los topics para un dispositivo
   * @param {Object} deviceInfo - Información del dispositivo
   */
  setupDeviceTopics(deviceInfo) {
    const { device_id, model_id, user_id } = deviceInfo;
    
    // Topics estándar para el dispositivo
    const topics = {
      data: `openiotzen/data/${user_id}/${model_id}/${device_id}`,
      command: `openiotzen/command/${user_id}/${model_id}/${device_id}`,
      status: `openiotzen/status/${user_id}/${model_id}/${device_id}`,
      config: `openiotzen/config/${user_id}/${model_id}/${device_id}`
    };

    this.deviceTopics.set(device_id, topics);
    
    console.log(`Topics configurados para dispositivo ${device_id}:`, topics);
  }

  /**
   * Parsea el client ID para extraer información del dispositivo
   * @param {string} clientId - ID del cliente MQTT
   * @returns {Object|null} - Información del dispositivo o null si no es válido
   */
  parseClientId(clientId) {
    try {
      // Formato: device_<device_id>_model_<model_id>_user_<user_id>
      // o formato: iot_<device_id>_<model_id>_<user_id>
      const patterns = [
        /^device_(.+)_model_(.+)_user_(.+)$/,
        /^iot_(.+)_(.+)_(.+)$/
      ];

      for (const pattern of patterns) {
        const match = clientId.match(pattern);
        if (match) {
          return {
            device_id: match[1],
            model_id: parseInt(match[2]) || match[2],
            user_id: match[3]
          };
        }
      }

      console.log(`Client ID no reconocido: ${clientId}`);
      return null;
    } catch (error) {
      console.error('Error parseando client ID:', error);
      return null;
    }
  }

  /**
   * Maneja datos recibidos (implementación requerida por ProtocolInterface)
   * @param {Object} data - Datos recibidos
   * @param {Object} client - Cliente que envió los datos
   */
  async handleData(data, client) {
    // Esta funcionalidad se maneja en handleMessage
    console.log('handleData llamado para MQTT');
  }

  /**
   * Envía datos a un dispositivo específico
   * @param {string} deviceId - ID del dispositivo
   * @param {Object} data - Datos a enviar
   */
  async sendToDevice(deviceId, data) {
    try {
      const topics = this.deviceTopics.get(deviceId);
      if (!topics) {
        throw new Error(`No se encontraron topics para el dispositivo ${deviceId}`);
      }

      // Publicar en el topic de comandos del dispositivo
      const payload = JSON.stringify(data);
      
      return new Promise((resolve, reject) => {
        this.broker.publish({
          topic: topics.command,
          payload: Buffer.from(payload),
          qos: 1,
          retain: false
        }, (error) => {
          if (error) {
            reject(error);
          } else {
            console.log(`Datos enviados a dispositivo ${deviceId} via MQTT`);
            resolve();
          }
        });
      });

    } catch (error) {
      console.error('Error enviando datos via MQTT:', error);
      throw error;
    }
  }

  /**
   * Obtiene el nombre del protocolo
   * @returns {string} - Nombre del protocolo
   */
  getProtocolName() {
    return 'MQTT';
  }

  /**
   * Obtiene el puerto por defecto del protocolo
   * @returns {number} - Puerto por defecto
   */
  getDefaultPort() {
    return 1883;
  }

  /**
   * Genera código cliente para MQTT
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
   * Genera código Python para cliente MQTT
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
Cliente MQTT IoT - Generado automáticamente
Modelo: ${modelJson.name}
Dispositivo ID: ${deviceId}
Usuario ID: ${userId}
"""

import paho.mqtt.client as mqtt
import json
import time
import random
import logging

# Configuración
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
CLIENT_ID = "iot_${deviceId}_${modelId}_${userId}"
DATA_TOPIC = "openiotzen/data/${userId}/${modelId}/${deviceId}"
COMMAND_TOPIC = "openiotzen/command/${userId}/${modelId}/${deviceId}"

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_data():
    """Genera datos según el modelo ${modelJson.name}"""
    return {
        "device_id": "${deviceId}",
        "model_id": ${modelId},
        "user_id": "${userId}",
        "token": "${token}",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
${fieldsCode}
    }

def on_connect(client, userdata, flags, rc):
    """Callback para conexión exitosa"""
    if rc == 0:
        logger.info("Conectado al broker MQTT")
        # Suscribirse al topic de comandos
        client.subscribe(COMMAND_TOPIC)
        logger.info(f"Suscrito a {COMMAND_TOPIC}")
    else:
        logger.error(f"Error conectando al broker: {rc}")

def on_message(client, userdata, msg):
    """Callback para mensajes recibidos"""
    try:
        payload = json.loads(msg.payload.decode())
        logger.info(f"Comando recibido: {payload}")
    except Exception as e:
        logger.error(f"Error procesando mensaje: {e}")

def on_disconnect(client, userdata, rc):
    """Callback para desconexión"""
    logger.info("Desconectado del broker MQTT")

def main():
    # Crear cliente MQTT
    client = mqtt.Client(CLIENT_ID)
    
    # Configurar callbacks
    client.on_connect = on_connect
    client.on_message = on_message
    client.on_disconnect = on_disconnect
    
    try:
        # Conectar al broker
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        
        # Iniciar loop en background
        client.loop_start()
        
        # Enviar datos periódicamente
        while True:
            try:
                data = generate_data()
                payload = json.dumps(data)
                
                result = client.publish(DATA_TOPIC, payload, qos=1)
                if result.rc == mqtt.MQTT_ERR_SUCCESS:
                    logger.info("Datos enviados correctamente")
                else:
                    logger.error(f"Error enviando datos: {result.rc}")
                
                time.sleep(10)  # Enviar cada 10 segundos
                
            except KeyboardInterrupt:
                logger.info("Interrumpido por el usuario")
                break
            except Exception as e:
                logger.error(f"Error: {e}")
                time.sleep(5)
                
    except Exception as e:
        logger.error(f"Error de conexión: {e}")
    finally:
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    main()`;
  }

  /**
   * Genera código JavaScript para cliente MQTT
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

    return `// Cliente MQTT IoT - Generado automáticamente
const mqtt = require('mqtt');

// Configuración
const MQTT_BROKER = 'mqtt://localhost:1883';
const CLIENT_ID = 'iot_${deviceId}_${modelId}_${userId}';
const DATA_TOPIC = 'openiotzen/data/${userId}/${modelId}/${deviceId}';
const COMMAND_TOPIC = 'openiotzen/command/${userId}/${modelId}/${deviceId}';

function generateData() {
    return {
        device_id: '${deviceId}',
        model_id: ${modelId},
        user_id: '${userId}',
        token: '${token}',
        timestamp: new Date().toISOString(),
${fieldsCode}
    };
}

// Crear cliente MQTT
const client = mqtt.connect(MQTT_BROKER, {
    clientId: CLIENT_ID,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000
});

client.on('connect', () => {
    console.log('Conectado al broker MQTT');
    
    // Suscribirse al topic de comandos
    client.subscribe(COMMAND_TOPIC, (err) => {
        if (!err) {
            console.log(\`Suscrito a \${COMMAND_TOPIC}\`);
        }
    });
    
    // Enviar datos periódicamente
    setInterval(() => {
        const data = generateData();
        const payload = JSON.stringify(data);
        
        client.publish(DATA_TOPIC, payload, { qos: 1 }, (err) => {
            if (err) {
                console.error('Error enviando datos:', err);
            } else {
                console.log('Datos enviados correctamente');
            }
        });
    }, 10000); // Cada 10 segundos
});

client.on('message', (topic, message) => {
    try {
        const payload = JSON.parse(message.toString());
        console.log('Comando recibido:', payload);
    } catch (error) {
        console.error('Error procesando mensaje:', error);
    }
});

client.on('error', (error) => {
    console.error('Error MQTT:', error);
});

client.on('close', () => {
    console.log('Conexión MQTT cerrada');
});`;
  }

  /**
   * Genera código Arduino para cliente MQTT
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

    return `#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// Configuración WiFi
const char* ssid = "TU_SSID";
const char* password = "TU_PASSWORD";

// Configuración MQTT
const char* mqtt_server = "localhost";
const int mqtt_port = 1883;
const char* client_id = "iot_${deviceId}_${modelId}_${userId}";
const char* data_topic = "openiotzen/data/${userId}/${modelId}/${deviceId}";
const char* command_topic = "openiotzen/command/${userId}/${modelId}/${deviceId}";

WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastMsg = 0;

void setup_wifi() {
    delay(10);
    Serial.println();
    Serial.print("Conectando a ");
    Serial.println(ssid);

    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println("");
    Serial.println("WiFi conectado");
    Serial.println("IP: ");
    Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
    Serial.print("Mensaje recibido [");
    Serial.print(topic);
    Serial.print("] ");
    
    String message;
    for (int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    Serial.println(message);
}

void reconnect() {
    while (!client.connected()) {
        Serial.print("Intentando conexión MQTT...");
        
        if (client.connect(client_id)) {
            Serial.println("conectado");
            client.subscribe(command_topic);
        } else {
            Serial.print("falló, rc=");
            Serial.print(client.state());
            Serial.println(" intentando de nuevo en 5 segundos");
            delay(5000);
        }
    }
}

void sendData() {
    StaticJsonDocument<512> doc;
    
    doc["device_id"] = "${deviceId}";
    doc["model_id"] = ${modelId};
    doc["user_id"] = "${userId}";
    doc["token"] = "${token}";
    doc["timestamp"] = millis();
${fieldsCode}

    String output;
    serializeJson(doc, output);
    
    client.publish(data_topic, output.c_str());
    Serial.println("Datos enviados: " + output);
}

void setup() {
    Serial.begin(115200);
    setup_wifi();
    client.setServer(mqtt_server, mqtt_port);
    client.setCallback(callback);
}

void loop() {
    if (!client.connected()) {
        reconnect();
    }
    client.loop();

    unsigned long now = millis();
    if (now - lastMsg > 10000) {  // Enviar cada 10 segundos
        lastMsg = now;
        sendData();
    }
}`;
  }
}

export default MQTTProtocol;