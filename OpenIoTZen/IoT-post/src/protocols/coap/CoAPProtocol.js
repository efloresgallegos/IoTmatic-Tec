import ProtocolInterface from '../base/ProtocolInterface.js';
import coap from 'coap';
import url from 'url';

/**
 * Implementación del protocolo CoAP para IoT
 * Soporta servidor CoAP para recibir datos de dispositivos IoT
 */
class CoAPProtocol extends ProtocolInterface {
  constructor(config = {}) {
    super(config);
    this.server = null;
    this.routes = new Map(); // Mapea rutas -> handlers
    this.deviceRoutes = new Map(); // Mapea device_id -> rutas específicas
  }

  /**
   * Inicia el servidor CoAP
   */
  async start() {
    if (this.isRunning) {
      console.log('CoAP server ya está ejecutándose');
      return;
    }

    try {
      // Crear servidor CoAP
      this.server = coap.createServer({
        type: 'udp4',
        reuseAddr: true,
        multicast: false,
        multicastInterface: null
      });

      // Configurar eventos del servidor
      this.setupServerEvents();

      // Configurar rutas estándar
      this.setupRoutes();

      // Iniciar el servidor
      await new Promise((resolve, reject) => {
        this.server.listen(this.config.port, this.config.host, (error) => {
          if (error) {
            reject(error);
          } else {
            this.isRunning = true;
            console.log(`CoAP server iniciado en coap://${this.config.host}:${this.config.port}`);
            resolve();
          }
        });
      });

    } catch (error) {
      console.error('Error iniciando CoAP server:', error);
      throw error;
    }
  }

  /**
   * Detiene el servidor CoAP
   */
  async stop() {
    if (!this.isRunning) {
      return;
    }

    try {
      if (this.server) {
        await new Promise((resolve) => {
          this.server.close(() => {
            console.log('CoAP server cerrado');
            resolve();
          });
        });
      }

      this.isRunning = false;
      this.routes.clear();
      this.deviceRoutes.clear();
      this.connections.clear();

    } catch (error) {
      console.error('Error deteniendo CoAP server:', error);
      throw error;
    }
  }

  /**
   * Configura los eventos del servidor CoAP
   */
  setupServerEvents() {
    this.server.on('request', (req, res) => {
      this.handleRequest(req, res);
    });

    this.server.on('error', (error) => {
      console.error('Error en CoAP server:', error);
      this.emit('error', error);
    });

    this.server.on('listening', () => {
      console.log('CoAP server escuchando conexiones');
    });
  }

  /**
   * Configura las rutas estándar del servidor CoAP
   */
  setupRoutes() {
    // Ruta para recibir datos de dispositivos
    // Formato: /openiotzen/data/:user_id/:model_id/:device_id
    this.routes.set('/openiotzen/data', this.handleDataRoute.bind(this));

    // Ruta para comandos hacia dispositivos
    // Formato: /openiotzen/command/:user_id/:model_id/:device_id
    this.routes.set('/openiotzen/command', this.handleCommandRoute.bind(this));

    // Ruta para estado de dispositivos
    // Formato: /openiotzen/status/:user_id/:model_id/:device_id
    this.routes.set('/openiotzen/status', this.handleStatusRoute.bind(this));

    // Ruta para configuración de dispositivos
    // Formato: /openiotzen/config/:user_id/:model_id/:device_id
    this.routes.set('/openiotzen/config', this.handleConfigRoute.bind(this));

    // Ruta de descubrimiento de recursos (.well-known/core)
    this.routes.set('/.well-known/core', this.handleDiscoveryRoute.bind(this));
  }

  /**
   * Maneja las solicitudes CoAP entrantes
   * @param {Object} req - Solicitud CoAP
   * @param {Object} res - Respuesta CoAP
   */
  handleRequest(req, res) {
    try {
      const pathname = url.parse(req.url).pathname;
      console.log(`Solicitud CoAP recibida: ${req.method} ${pathname} desde ${req.rsinfo.address}`);

      // Buscar handler para la ruta
      let handler = null;
      let routeMatch = null;

      for (const [route, routeHandler] of this.routes) {
        if (pathname.startsWith(route)) {
          handler = routeHandler;
          routeMatch = route;
          break;
        }
      }

      if (handler) {
        handler(req, res, pathname, routeMatch);
      } else {
        // Ruta no encontrada
        res.code = '4.04'; // Not Found
        res.end('Ruta no encontrada');
      }

    } catch (error) {
      console.error('Error manejando solicitud CoAP:', error);
      res.code = '5.00'; // Internal Server Error
      res.end('Error interno del servidor');
    }
  }

  /**
   * Maneja la ruta de datos (/openiotzen/data/...)
   */
  handleDataRoute(req, res, pathname, routeMatch) {
    try {
      if (req.method !== 'POST' && req.method !== 'PUT') {
        res.code = '4.05'; // Method Not Allowed
        res.end('Método no permitido. Use POST o PUT para enviar datos');
        return;
      }

      // Extraer parámetros de la ruta
      const pathParts = pathname.replace(routeMatch, '').split('/').filter(p => p);
      if (pathParts.length < 3) {
        res.code = '4.00'; // Bad Request
        res.end('Formato de ruta inválido. Use /openiotzen/data/{user_id}/{model_id}/{device_id}');
        return;
      }

      const [userId, modelId, deviceId] = pathParts;
      
      // Registrar o actualizar información del dispositivo
      this.registerClient(deviceId, {
        userId,
        modelId,
        deviceId,
        lastSeen: new Date(),
        address: req.rsinfo.address,
        port: req.rsinfo.port
      });

      // Parsear payload
      let data;
      try {
        const payload = req.payload.toString();
        data = payload ? JSON.parse(payload) : {};
      } catch (error) {
        res.code = '4.00'; // Bad Request
        res.end('Payload JSON inválido');
        return;
      }

      // Completar datos del dispositivo
      const completeData = {
        device_id: deviceId,
        model_id: parseInt(modelId) || modelId,
        user_id: userId,
        timestamp: new Date().toISOString(),
        source_ip: req.rsinfo.address,
        ...data
      };

      // Emitir evento de conexión si es la primera vez
      if (!this.connections.has(deviceId)) {
        this.emit('device_connected', {
          device_id: deviceId,
          model_id: parseInt(modelId) || modelId,
          user_id: userId,
          ip: req.rsinfo.address,
          protocol: 'CoAP'
        });
      }

      // Emitir evento de datos
      this.emit('data', completeData);

      // Responder con éxito
      res.code = '2.04'; // Changed
      res.end(JSON.stringify({
        status: 'success',
        message: 'Datos recibidos correctamente',
        timestamp: new Date().toISOString()
      }));

      console.log(`Datos CoAP recibidos de dispositivo ${deviceId}`);

    } catch (error) {
      console.error('Error en ruta de datos CoAP:', error);
      res.code = '5.00'; // Internal Server Error
      res.end('Error procesando datos');
    }
  }

  /**
   * Maneja la ruta de comandos (/openiotzen/command/...)
   */
  handleCommandRoute(req, res, pathname, routeMatch) {
    try {
      if (req.method !== 'GET') {
        res.code = '4.05'; // Method Not Allowed
        res.end('Método no permitido. Use GET para obtener comandos');
        return;
      }

      // Extraer parámetros de la ruta
      const pathParts = pathname.replace(routeMatch, '').split('/').filter(p => p);
      if (pathParts.length < 3) {
        res.code = '4.00'; // Bad Request
        res.end('Formato de ruta inválido');
        return;
      }

      const [userId, modelId, deviceId] = pathParts;

      // Por ahora, devolver respuesta vacía (implementar cola de comandos en futuras versiones)
      res.code = '2.05'; // Content
      res.setOption('Content-Format', 'application/json');
      res.end(JSON.stringify({
        status: 'success',
        commands: [],
        timestamp: new Date().toISOString()
      }));

      console.log(`Solicitud de comandos CoAP de dispositivo ${deviceId}`);

    } catch (error) {
      console.error('Error en ruta de comandos CoAP:', error);
      res.code = '5.00'; // Internal Server Error
      res.end('Error obteniendo comandos');
    }
  }

  /**
   * Maneja la ruta de estado (/openiotzen/status/...)
   */
  handleStatusRoute(req, res, pathname, routeMatch) {
    try {
      // Extraer parámetros de la ruta
      const pathParts = pathname.replace(routeMatch, '').split('/').filter(p => p);
      if (pathParts.length < 3) {
        res.code = '4.00'; // Bad Request
        res.end('Formato de ruta inválido');
        return;
      }

      const [userId, modelId, deviceId] = pathParts;

      if (req.method === 'POST' || req.method === 'PUT') {
        // Actualizar estado del dispositivo
        let statusData;
        try {
          const payload = req.payload.toString();
          statusData = payload ? JSON.parse(payload) : {};
        } catch (error) {
          res.code = '4.00'; // Bad Request
          res.end('Payload JSON inválido');
          return;
        }

        // Emitir evento de actualización de estado
        this.emit('device_status_update', {
          device_id: deviceId,
          model_id: parseInt(modelId) || modelId,
          user_id: userId,
          status: statusData.status || 'online',
          ...statusData
        });

        res.code = '2.04'; // Changed
        res.end('Estado actualizado');

      } else if (req.method === 'GET') {
        // Obtener estado del dispositivo
        const client = this.getClient(deviceId);
        const status = {
          device_id: deviceId,
          status: client ? 'online' : 'offline',
          last_seen: client?.lastSeen || null,
          timestamp: new Date().toISOString()
        };

        res.code = '2.05'; // Content
        res.setOption('Content-Format', 'application/json');
        res.end(JSON.stringify(status));
      } else {
        res.code = '4.05'; // Method Not Allowed
        res.end('Método no permitido');
      }

    } catch (error) {
      console.error('Error en ruta de estado CoAP:', error);
      res.code = '5.00'; // Internal Server Error
      res.end('Error manejando estado');
    }
  }

  /**
   * Maneja la ruta de configuración (/openiotzen/config/...)
   */
  handleConfigRoute(req, res, pathname, routeMatch) {
    try {
      res.code = '2.05'; // Content
      res.setOption('Content-Format', 'application/json');
      res.end(JSON.stringify({
        server: 'OpenIoTZen CoAP Server',
        version: '1.0.0',
        supported_methods: ['GET', 'POST', 'PUT'],
        timestamp: new Date().toISOString()
      }));

    } catch (error) {
      console.error('Error en ruta de configuración CoAP:', error);
      res.code = '5.00'; // Internal Server Error
      res.end('Error obteniendo configuración');
    }
  }

  /**
   * Maneja la ruta de descubrimiento (.well-known/core)
   */
  handleDiscoveryRoute(req, res) {
    try {
      if (req.method !== 'GET') {
        res.code = '4.05'; // Method Not Allowed
        res.end('Método no permitido');
        return;
      }

      // Devolver recursos disponibles en formato CoRE Link
      const resources = [
        '</openiotzen/data>;rt="iot.data";if="sensor";sz=1024',
        '</openiotzen/command>;rt="iot.command";if="actuator"',
        '</openiotzen/status>;rt="iot.status";if="status"',
        '</openiotzen/config>;rt="iot.config";if="config"'
      ];

      res.code = '2.05'; // Content
      res.setOption('Content-Format', 'application/link-format');
      res.end(resources.join(','));

      console.log('Solicitud de descubrimiento CoAP respondida');

    } catch (error) {
      console.error('Error en ruta de descubrimiento CoAP:', error);
      res.code = '5.00'; // Internal Server Error
      res.end('Error en descubrimiento');
    }
  }

  /**
   * Maneja datos recibidos (implementación requerida por ProtocolInterface)
   * @param {Object} data - Datos recibidos
   * @param {Object} client - Cliente que envió los datos
   */
  async handleData(data, client) {
    // Esta funcionalidad se maneja en handleDataRoute
    console.log('handleData llamado para CoAP');
  }

  /**
   * Envía datos a un dispositivo específico (no soportado directamente en CoAP)
   * @param {string} deviceId - ID del dispositivo
   * @param {Object} data - Datos a enviar
   */
  async sendToDevice(deviceId, data) {
    // CoAP es principalmente request-response, no soporta push nativo
    // Los dispositivos deben hacer polling a la ruta de comandos
    console.log(`CoAP no soporta envío directo. El dispositivo ${deviceId} debe consultar /openiotzen/command`);
    throw new Error('CoAP no soporta envío directo de datos. Use polling desde el dispositivo.');
  }

  /**
   * Obtiene el nombre del protocolo
   * @returns {string} - Nombre del protocolo
   */
  getProtocolName() {
    return 'CoAP';
  }

  /**
   * Obtiene el puerto por defecto del protocolo
   * @returns {number} - Puerto por defecto
   */
  getDefaultPort() {
    return 5683;
  }

  /**
   * Genera código cliente para CoAP
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
   * Genera código Python para cliente CoAP
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
Cliente CoAP IoT - Generado automáticamente
Modelo: ${modelJson.name}
Dispositivo ID: ${deviceId}
Usuario ID: ${userId}
"""

import asyncio
from aiocoap import *
import json
import time
import random
import logging

# Configuración
COAP_SERVER = "coap://localhost:5683"
DATA_URI = f"/openiotzen/data/${userId}/${modelId}/${deviceId}"
COMMAND_URI = f"/openiotzen/command/${userId}/${modelId}/${deviceId}"
STATUS_URI = f"/openiotzen/status/${userId}/${modelId}/${deviceId}"

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

async def send_data():
    """Envía datos al servidor CoAP"""
    try:
        protocol = await Context.create_client_context()
        
        data = generate_data()
        payload = json.dumps(data).encode('utf-8')
        
        request = Message(
            code=POST,
            payload=payload,
            uri=COAP_SERVER + DATA_URI
        )
        request.opt.content_format = 50  # application/json
        
        response = await protocol.request(request).response
        
        if response.code.is_successful():
            logger.info("Datos enviados correctamente")
            logger.info(f"Respuesta: {response.payload.decode()}")
        else:
            logger.error(f"Error enviando datos: {response.code}")
            
    except Exception as e:
        logger.error(f"Error en envío CoAP: {e}")

async def check_commands():
    """Verifica comandos pendientes del servidor"""
    try:
        protocol = await Context.create_client_context()
        
        request = Message(code=GET, uri=COAP_SERVER + COMMAND_URI)
        response = await protocol.request(request).response
        
        if response.code.is_successful():
            commands = json.loads(response.payload.decode())
            if commands.get('commands'):
                logger.info(f"Comandos recibidos: {commands['commands']}")
                
    except Exception as e:
        logger.error(f"Error verificando comandos: {e}")

async def send_status():
    """Envía estado del dispositivo"""
    try:
        protocol = await Context.create_client_context()
        
        status_data = {
            "status": "online",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
            "uptime": time.time()
        }
        payload = json.dumps(status_data).encode('utf-8')
        
        request = Message(
            code=POST,
            payload=payload,
            uri=COAP_SERVER + STATUS_URI
        )
        request.opt.content_format = 50  # application/json
        
        response = await protocol.request(request).response
        
        if response.code.is_successful():
            logger.info("Estado enviado correctamente")
            
    except Exception as e:
        logger.error(f"Error enviando estado: {e}")

async def main():
    """Función principal"""
    logger.info("Iniciando cliente CoAP...")
    
    # Enviar estado inicial
    await send_status()
    
    while True:
        try:
            # Enviar datos
            await send_data()
            
            # Verificar comandos
            await check_commands()
            
            # Esperar antes del siguiente ciclo
            await asyncio.sleep(10)
            
        except KeyboardInterrupt:
            logger.info("Interrumpido por el usuario")
            break
        except Exception as e:
            logger.error(f"Error en bucle principal: {e}")
            await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(main())`;
  }

  /**
   * Genera código JavaScript para cliente CoAP
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

    return `// Cliente CoAP IoT - Generado automáticamente
const coap = require('coap');

// Configuración
const COAP_SERVER = 'localhost';
const COAP_PORT = 5683;
const DATA_PATH = '/openiotzen/data/${userId}/${modelId}/${deviceId}';
const COMMAND_PATH = '/openiotzen/command/${userId}/${modelId}/${deviceId}';
const STATUS_PATH = '/openiotzen/status/${userId}/${modelId}/${deviceId}';

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

async function sendData() {
    return new Promise((resolve, reject) => {
        const data = generateData();
        const payload = JSON.stringify(data);
        
        const req = coap.request({
            host: COAP_SERVER,
            port: COAP_PORT,
            pathname: DATA_PATH,
            method: 'POST',
            confirmable: true,
            options: {
                'Content-Format': 'application/json'
            }
        });
        
        req.write(payload);
        
        req.on('response', (res) => {
            if (res.code.startsWith('2.')) {
                console.log('Datos enviados correctamente');
                console.log('Respuesta:', res.payload.toString());
                resolve();
            } else {
                console.error('Error enviando datos:', res.code);
                reject(new Error(\`Error CoAP: \${res.code}\`));
            }
        });
        
        req.on('error', (err) => {
            console.error('Error de conexión:', err);
            reject(err);
        });
        
        req.end();
    });
}

async function checkCommands() {
    return new Promise((resolve, reject) => {
        const req = coap.request({
            host: COAP_SERVER,
            port: COAP_PORT,
            pathname: COMMAND_PATH,
            method: 'GET',
            confirmable: true
        });
        
        req.on('response', (res) => {
            if (res.code.startsWith('2.')) {
                try {
                    const commands = JSON.parse(res.payload.toString());
                    if (commands.commands && commands.commands.length > 0) {
                        console.log('Comandos recibidos:', commands.commands);
                    }
                    resolve(commands);
                } catch (error) {
                    console.error('Error parseando comandos:', error);
                    resolve({});
                }
            } else {
                reject(new Error(\`Error obteniendo comandos: \${res.code}\`));
            }
        });
        
        req.on('error', (err) => {
            reject(err);
        });
        
        req.end();
    });
}

async function sendStatus() {
    return new Promise((resolve, reject) => {
        const statusData = {
            status: 'online',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        };
        
        const req = coap.request({
            host: COAP_SERVER,
            port: COAP_PORT,
            pathname: STATUS_PATH,
            method: 'POST',
            confirmable: true,
            options: {
                'Content-Format': 'application/json'
            }
        });
        
        req.write(JSON.stringify(statusData));
        
        req.on('response', (res) => {
            if (res.code.startsWith('2.')) {
                console.log('Estado enviado correctamente');
                resolve();
            } else {
                reject(new Error(\`Error enviando estado: \${res.code}\`));
            }
        });
        
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    console.log('Iniciando cliente CoAP...');
    
    // Enviar estado inicial
    try {
        await sendStatus();
    } catch (error) {
        console.error('Error enviando estado inicial:', error);
    }
    
    // Bucle principal
    setInterval(async () => {
        try {
            await sendData();
            await checkCommands();
        } catch (error) {
            console.error('Error en ciclo principal:', error);
        }
    }, 10000); // Cada 10 segundos
}

// Manejar cierre limpio
process.on('SIGINT', () => {
    console.log('Cerrando cliente CoAP...');
    process.exit(0);
});

main().catch(console.error);`;
  }

  /**
   * Genera código Arduino para cliente CoAP
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
#include <WiFiUdp.h>
#include <ArduinoJson.h>
#include <coap-simple.h>

// Configuración WiFi
const char* ssid = "TU_SSID";
const char* password = "TU_PASSWORD";

// Configuración CoAP
const char* coap_server = "192.168.1.100"; // Cambiar por IP del servidor
const int coap_port = 5683;
const char* data_path = "/openiotzen/data/${userId}/${modelId}/${deviceId}";
const char* command_path = "/openiotzen/command/${userId}/${modelId}/${deviceId}";
const char* status_path = "/openiotzen/status/${userId}/${modelId}/${deviceId}";

WiFiUDP udp;
Coap coap(udp);

unsigned long lastDataSend = 0;
unsigned long lastCommandCheck = 0;
const long dataInterval = 10000;  // Enviar datos cada 10 segundos
const long commandInterval = 30000; // Verificar comandos cada 30 segundos

void setup() {
    Serial.begin(115200);
    setup_wifi();
    
    // Inicializar CoAP
    coap.start();
    
    // Enviar estado inicial
    sendStatus();
}

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

void sendData() {
    StaticJsonDocument<512> doc;
    
    doc["device_id"] = "${deviceId}";
    doc["model_id"] = ${modelId};
    doc["user_id"] = "${userId}";
    doc["token"] = "${token}";
    doc["timestamp"] = millis();
${fieldsCode}

    String payload;
    serializeJson(doc, payload);
    
    // Crear packet CoAP
    CoapPacket packet;
    packet.type = COAP_CON;
    packet.code = COAP_POST;
    packet.token = NULL;
    packet.tokenlen = 0;
    packet.payload = (uint8_t*)payload.c_str();
    packet.payloadlen = payload.length();
    packet.optionnum = 0;
    packet.messageid = random(0xFFFF);
    
    // Enviar al servidor
    IPAddress serverIP;
    serverIP.fromString(coap_server);
    
    coap.sendPacket(packet, serverIP, coap_port);
    
    Serial.println("Datos enviados: " + payload);
}

void checkCommands() {
    // Crear packet CoAP GET
    CoapPacket packet;
    packet.type = COAP_CON;
    packet.code = COAP_GET;
    packet.token = NULL;
    packet.tokenlen = 0;
    packet.payload = NULL;
    packet.payloadlen = 0;
    packet.optionnum = 0;
    packet.messageid = random(0xFFFF);
    
    IPAddress serverIP;
    serverIP.fromString(coap_server);
    
    coap.sendPacket(packet, serverIP, coap_port);
    
    Serial.println("Verificando comandos...");
}

void sendStatus() {
    StaticJsonDocument<256> doc;
    
    doc["status"] = "online";
    doc["timestamp"] = millis();
    doc["uptime"] = millis() / 1000;
    doc["free_heap"] = ESP.getFreeHeap();
    
    String payload;
    serializeJson(doc, payload);
    
    CoapPacket packet;
    packet.type = COAP_CON;
    packet.code = COAP_POST;
    packet.token = NULL;
    packet.tokenlen = 0;
    packet.payload = (uint8_t*)payload.c_str();
    packet.payloadlen = payload.length();
    packet.optionnum = 0;
    packet.messageid = random(0xFFFF);
    
    IPAddress serverIP;
    serverIP.fromString(coap_server);
    
    coap.sendPacket(packet, serverIP, coap_port);
    
    Serial.println("Estado enviado: " + payload);
}

void loop() {
    coap.loop();
    
    unsigned long now = millis();
    
    // Enviar datos periódicamente
    if (now - lastDataSend >= dataInterval) {
        lastDataSend = now;
        sendData();
    }
    
    // Verificar comandos periódicamente
    if (now - lastCommandCheck >= commandInterval) {
        lastCommandCheck = now;
        checkCommands();
    }
    
    delay(100);
}`;
  }
}

export default CoAPProtocol;