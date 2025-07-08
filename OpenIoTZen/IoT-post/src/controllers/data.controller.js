import dataService from "../services/data.service.js";

const createData = async (req, res) => {
    try {
        const data = await dataService.createData(req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDatabyModelandDevice = async (req, res) => {
    try {
        const { model, device } = req.params;
        const data = await dataService.getDatabyModelandDevice(model, device);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDatabyModel = async (req, res) => {
    try {
        const { model } = req.params;
        const data = await dataService.getDatabyModel(model);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDatabyDevice = async (req, res) => {
    try {
        const { device_id } = req.query;
        
        if (!device_id) {
            return res.status(400).json({ message: "device_id es requerido" });
        }

        const data = await dataService.getDatabyDevice(device_id);
        
        if (!data || data.length === 0) {
            return res.status(404).json({ message: "No se encontraron datos para este dispositivo" });
        }
        
        res.status(200).json(data);
    } catch (error) {
        console.error('Error en getDatabyDevice:', error);
        res.status(500).json({ message: error.message || "Error interno del servidor" });
    }
};

const getDatabyDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await dataService.getDatabyDateRange(startDate, endDate);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getGraphableData = async (req, res) => {
    try {
        const  model_id = req.params.id;
        console.log(model_id);
        const data = await dataService.getGraphableData(model_id);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBooleanFields = async (req, res) => {
    try {
        const  model_id  = req.params.id;
        const data = await dataService.getBooleanFields(model_id);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getModelName = async (model_id) => {
    try {
        const modelName = await dataService.getModelName(model_id);
        return modelName;
    } catch (error) {
        throw new Error(error.message);
    }
};

const getJsonForPost = async (req, res) => {
    try {
        console.log(req.body);
        const {model_id, device_id, user_id} = req.body;
        const data = await dataService.getJsonForPost(model_id, device_id, user_id);
        
        // Generar token JWT para autenticación de datos
        const tokenData = {
            model_id: model_id,
            device_id: device_id,
            user_id: user_id
        };
        
        // Importar jwtMethods desde el archivo de utilidades
        const jwtMethods = (await import('../utils/jwt.util.js')).default;
        const token = jwtMethods.createDataToken(tokenData);
        
        // Añadir el token al objeto de respuesta
        res.status(200).json({
            ...data,
            token: token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getWebSocketCode = async (req, res) => {
    try {
        const {model_id, device_id, user_id} = req.body;
        
        // Validate model_id is a valid number
        const modelIdNum = Number(model_id);
        if (isNaN(modelIdNum)) {
            return res.status(400).json({ message: 'Invalid model_id: must be a valid number' });
        }
        
        const jsonStructure = await dataService.getJsonForPost(modelIdNum, device_id, user_id);
        
        // Obtener los campos del modelo excluyendo los IDs
        const jsonFields = Object.keys(jsonStructure).filter(key => 
            !['model_id', 'device_id', 'user_id'].includes(key)
        );
        
        // Generar token JWT para autenticación de datos
        const tokenData = {
            model_id: modelIdNum,
            device_id: device_id,
            user_id: user_id
        };
        
        // Importar jwtMethods desde el archivo de utilidades
        const jwtMethods = (await import('../utils/jwt.util.js')).default;
        const token = jwtMethods.createDataToken(tokenData);
        
        // Generar código Python para WebSocket
        const pythonCode = generatePythonWebSocketCode(model_id, device_id, user_id, jsonFields, token);

        // Generar código Arduino para WebSocket
        const arduinoCode = generateArduinoWebSocketCode(model_id, device_id, user_id, jsonFields, token);
        
        // Generar código JavaScript para WebSocket
        const javascriptCode = generateJavaScriptWebSocketCode(model_id, device_id, user_id, jsonFields, token);
        
        res.status(200).json({
            pythonCode,
            javascriptCode,
            arduinoCode,
            structure: {
                ...jsonStructure,
                token: token
            }
        });
    } catch (error) {
        console.error('Error en getWebSocketCode:', error);
        res.status(500).json({ message: error.message });
    }
};

const generatePythonWebSocketCode = (model_id, device_id, user_id, jsonFields, token) => {
    // Crear plantillas para los campos JSON con valores genéricos
    const fieldTemplates = jsonFields.map(field => {
        return `        "${field}": "x",  # Reemplazar 'x' con el valor deseado`;
    }).join('\n');
    
    return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Cliente WebSocket para IoT - Generado automáticamente por OpenIoTZen

Este script proporciona una implementación completa de cliente WebSocket para enviar
datos de IoT al servidor OpenIoTZen. Incluye reconexión automática, manejo de errores
y generación inteligente de datos basados en el modelo.

Modelo ID: ${model_id}
Dispositivo ID: ${device_id}
Usuario ID: ${user_id}
"""

import websocket
import json
import time
import random
import threading
import logging
import sys
import ssl
from datetime import datetime

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("iot_websocket.log")
    ]
)
logger = logging.getLogger('IoTWebSocket')

# Configuración de la conexión WebSocket
WS_URL = "ws://localhost:3000/ws"  # Cambiar a la URL de tu servidor
WS_SECURE_URL = "wss://tu-servidor.com/ws"  # URL para conexión segura

# Token JWT para autenticación (válido por 1 año)
JWT_TOKEN = "${token}"

# Configuración
CONFIG = {
    "use_ssl": False,           # Cambiar a True para usar conexión segura (wss://)
    "interval": 10,            # Intervalo de envío de datos en segundos
    "reconnect_delay": 5,      # Tiempo de espera para reconexión en segundos
    "debug": False,            # Modo debug para información adicional
    "simulate_sensors": True,  # Generar datos simulados de sensores
    "log_to_file": True,      # Guardar logs en archivo
    "firmware_version": "1.0.0" # Versión del firmware del dispositivo (personalizar)
}

# Variables globales
data_thread = None
running = False
ws = None

# Estructura de datos basada en el modelo seleccionado
def generate_data():
    """
    Genera un conjunto de datos completo basado en el modelo definido.
    Incluye timestamp para seguimiento temporal de los datos.
    """
    # Obtener timestamp actual
    timestamp = datetime.now().isoformat()
    
    # Crear estructura base del payload
    payload = {
        "device_id": "${device_id}",
        "model_id": ${model_id},
        "user_id": "${user_id}",
        "timestamp": timestamp,
        "firmware_version": CONFIG["firmware_version"],
${fieldTemplates}
    }
    
    # Crear mensaje completo
    data = {
        "token": JWT_TOKEN,
        "payload": payload
    }
    
    if CONFIG["debug"]:
        logger.debug(f"Datos generados: {data}")
        
    return data

# Función para enviar datos periódicamente
def send_periodic_data(ws_connection):
    """
    Envía datos periódicamente al servidor WebSocket.
    Maneja errores de conexión y reintentos.
    """
    global running
    retry_count = 0
    max_retries = 5
    
    while running:
        try:
            if ws_connection and ws_connection.sock and ws_connection.sock.connected:
                # Generar datos
                data = generate_data()
                
                # Crear mensaje de datos
                data_message = {
                    "event": "data",
                    "data": data
                }
                
                # Enviar datos
                ws_connection.send(json.dumps(data_message))
                logger.info("Datos enviados al servidor correctamente")
                retry_count = 0  # Reiniciar contador de reintentos tras éxito
            else:
                retry_count += 1
                logger.warning(f"WebSocket no conectado. Reintento {retry_count}/{max_retries}")
                if retry_count >= max_retries:
                    logger.error("Máximo número de reintentos alcanzado. Esperando reconexión...")
                    time.sleep(CONFIG["interval"] * 2)  # Esperar más tiempo antes de reintentar
                    retry_count = 0
            
            # Esperar intervalo configurado antes de enviar más datos
            time.sleep(CONFIG["interval"])
        except Exception as e:
            logger.error(f"Error al enviar datos periódicos: {e}")
            time.sleep(CONFIG["reconnect_delay"])

# Función para manejar mensajes recibidos
def on_message(ws_connection, message):
    """
    Procesa los mensajes recibidos del servidor.
    Maneja diferentes tipos de eventos y respuestas.
    """
    try:
        data = json.loads(message)
        logger.info(f"Mensaje recibido: {data}")
        
        # Verificar tipo de evento
        if 'event' in data:
            if data['event'] == 'data_received':
                logger.info(f"Datos recibidos por el servidor: {data['data']}")
                
            elif data['event'] == 'data_event':
                logger.info(f"Nuevo evento de datos: {data['data']}")
                process_server_event(data['data'])
                
            elif data['event'] == 'error':
                logger.error(f"Error del servidor: {data['data']}")
                handle_server_error(data['data'])
                
            elif data['event'] == 'config':
                logger.info(f"Configuración recibida del servidor: {data['data']}")
                update_config(data['data'])
            
            else:
                logger.warning(f"Evento desconocido: {data['event']}")
    except json.JSONDecodeError:
        logger.error(f"Error al decodificar JSON: {message}")
    except Exception as e:
        logger.error(f"Error al procesar mensaje: {e}")

# Función para procesar eventos del servidor
def process_server_event(event_data):
    """
    Procesa eventos especiales enviados por el servidor.
    Puede incluir comandos de control o solicitudes de datos.
    """
    try:
        if 'command' in event_data:
            command = event_data['command']
            logger.info(f"Comando recibido: {command}")
            
            if command == 'restart':
                logger.info("Reiniciando cliente por solicitud del servidor...")
                
            elif command == 'update_interval':
                if 'value' in event_data:
                    CONFIG["interval"] = event_data['value']
                    logger.info(f"Intervalo actualizado a {CONFIG['interval']} segundos")
                    
            elif command == 'request_data':
                send_data(generate_data())
                
    except Exception as e:
        logger.error(f"Error al procesar evento del servidor: {e}")

# Función para manejar errores específicos del servidor
def handle_server_error(error_data):
    """
    Maneja errores específicos reportados por el servidor.
    Implementa lógica de recuperación según el tipo de error.
    """
    try:
        if 'code' in error_data:
            error_code = error_data['code']
            
            if error_code == 'auth_failed':
                logger.critical("Error de autenticación. Verificar token JWT.")
                
            elif error_code == 'invalid_data':
                logger.error(f"Datos inválidos: {error_data.get('message', '')}")
                
            elif error_code == 'rate_limit':
                logger.warning("Límite de tasa alcanzado. Reduciendo frecuencia de envío.")
                CONFIG["interval"] = CONFIG["interval"] * 2
                
    except Exception as e:
        logger.error(f"Error al procesar error del servidor: {e}")

# Función para actualizar configuración
def update_config(config_data):
    """
    Actualiza la configuración del cliente según instrucciones del servidor.
    """
    global CONFIG
    for key, value in config_data.items():
        if key in CONFIG:
            CONFIG[key] = value
            logger.info(f"Configuración actualizada: {key} = {value}")

# Función para manejar errores
def on_error(ws_connection, error):
    """
    Maneja errores de conexión WebSocket.
    """
    logger.error(f"Error en WebSocket: {error}")
    stop_periodic_data()

# Función para manejar cierre de conexión
def on_close(ws_connection, close_status_code, close_msg):
    """
    Maneja el cierre de la conexión WebSocket.
    """
    logger.warning(f"Conexión WebSocket cerrada: {close_status_code} - {close_msg}")
    stop_periodic_data()

# Función para manejar apertura de conexión
def on_open(ws_connection):
    """
    Maneja la apertura exitosa de la conexión WebSocket.
    Inicia el envío periódico de datos.
    """
    logger.info("Conexión WebSocket establecida correctamente")
    start_periodic_data(ws_connection)

# Función para iniciar el envío periódico de datos
def start_periodic_data(ws_connection):
    """
    Inicia un hilo separado para el envío periódico de datos.
    """
    global data_thread, running
    if data_thread is None or not data_thread.is_alive():
        running = True
        data_thread = threading.Thread(target=send_periodic_data, args=(ws_connection,))
        data_thread.daemon = True
        data_thread.start()
        logger.info("Iniciado envío periódico de datos")

# Función para detener el envío periódico de datos
def stop_periodic_data():
    """
    Detiene el envío periódico de datos de forma segura.
    """
    global running
    running = False
    logger.info("Detenido envío periódico de datos")

# Función para enviar datos manualmente
def send_data(data):
    """
    Envía datos manualmente al servidor.
    Útil para envíos puntuales o respuestas a solicitudes.
    """
    global ws
    
    if not ws or not ws.sock or not ws.sock.connected:
        logger.error("WebSocket no conectado. No se pueden enviar datos.")
        return False
    
    try:
        if data is None:
            data = generate_data()
        
        data_message = {
            "event": "data",
            "data": data
        }
        
        ws.send(json.dumps(data_message))
        logger.info("Datos enviados manualmente al servidor")
        return True
        
    except Exception as e:
        logger.error(f"Error al enviar datos manualmente: {e}")
        return False

# Función principal para iniciar el cliente
def main():
    """
    Función principal que inicia el cliente WebSocket.
    Configura la conexión y maneja la reconexión automática.
    """
    global ws
    
    logger.info("=== Cliente WebSocket IoT - OpenIoTZen ===")
    logger.info(f"Modelo ID: {${model_id}}")
    logger.info(f"Dispositivo ID: {"${device_id}"}")
    logger.info(f"Intervalo de envío: {CONFIG['interval']} segundos")
    
    url = WS_SECURE_URL if CONFIG["use_ssl"] else WS_URL
    sslopt = {"cert_reqs": ssl.CERT_NONE} if CONFIG["use_ssl"] else None
    
    try:
        headers = {"Authorization": f"Bearer {JWT_TOKEN}"}
        
        while True:
            try:
                logger.info(f"Conectando a {url}...")
                
                ws = websocket.WebSocketApp(
                    url,
                    header=headers,
                    on_open=on_open,
                    on_message=on_message,
                    on_error=on_error,
                    on_close=on_close
                )
                
                if CONFIG["use_ssl"]:
                    ws.run_forever(sslopt=sslopt)
                else:
                    ws.run_forever()
                    
                logger.warning(f"Conexión perdida. Intentando reconectar en {CONFIG['reconnect_delay']} segundos...")
                time.sleep(CONFIG["reconnect_delay"])
                
            except KeyboardInterrupt:
                logger.info("Interrupción de teclado detectada. Saliendo...")
                break
                
            except Exception as e:
                logger.error(f"Error en el bucle principal: {e}")
                logger.info(f"Reintentando en {CONFIG['reconnect_delay']} segundos...")
                time.sleep(CONFIG["reconnect_delay"])
                
    finally:
        stop_periodic_data()
        logger.info("Cliente WebSocket finalizado")

# Punto de entrada para ejecución directa
if __name__ == "__main__":
    if "--debug" in sys.argv:
        CONFIG["debug"] = True
        logger.setLevel(logging.DEBUG)
        logger.debug("Modo debug activado")
        
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Programa terminado por el usuario")
    except Exception as e:
        logger.critical(f"Error crítico: {e}")
        sys.exit(1)`;
};

const generateJavaScriptWebSocketCode = (model_id, device_id, user_id, jsonFields, token) => {
    // Crear plantillas para los campos JSON con valores genéricos
    const fieldTemplates = jsonFields.map(field => {
        return `    "${field}": "x", // Reemplazar 'x' con el valor deseado`;
    }).join('\n');
    
    return `
import WebSocket from 'ws';
  
// Configuración de la conexión WebSocket
const wsUrl = "ws://localhost:3000/ws";
let ws;
let reconnectInterval = 5000; // 5 segundos
let dataInterval;

// Token JWT para autenticación (válido por 1 año)
const JWT_TOKEN = "${token}";

// Configuración del dispositivo
const CONFIG = {
  firmwareVersion: "1.0.0", // Personalizar con la versión actual del firmware
  interval: 10000, // Intervalo de envío en milisegundos
  debug: false // Modo debug para información adicional
};

// Estructura de datos basada en el modelo seleccionado
function generateData() {
  // Crear estructura base del payload
  const payload = {
    device_id: "${device_id}",
    model_id: ${model_id},
    user_id: "${user_id}",
    timestamp: new Date().toISOString(),
    firmware_version: CONFIG.firmwareVersion,
${fieldTemplates}
  };

  // Crear mensaje completo
  return {
    token: JWT_TOKEN,
    payload: payload
  };
}

// Función para establecer la conexión WebSocket
function connectWebSocket() {
  // Crear objeto WebSocket
  ws = new WebSocket(wsUrl);
  
  // Configurar encabezados de autenticación (para navegadores que lo soportan)
  if (ws.setRequestHeader) {
    ws.setRequestHeader('Authorization', 'Bearer ' + JWT_TOKEN);
  }
  
  // Evento de apertura de conexión
  ws.onopen = function() {
    console.log("Conexión WebSocket establecida");
    // Iniciar envío periódico de datos
    startPeriodicDataSending();
  };
  
  // Evento de recepción de mensajes
  ws.onmessage = function(event) {
    try {
      const message = JSON.parse(event.data);
      console.log("Mensaje recibido:", message);
      
      // Verificar tipo de evento
      switch (message.event) {
        case 'data_received':
          console.log("Datos recibidos por el servidor:", message.data);
          break;
          
        case 'data_event':
          console.log("Nuevo evento de datos:", message.data);
          break;
          
        case 'error':
          console.error("Error del servidor:", message.data);
          break;
          
        default:
          console.log("Evento no manejado:", message);
      }
    } catch (error) {
      console.error("Error al procesar mensaje:", error);
    }
  };
  
  // Evento de error
  ws.onerror = function(error) {
    console.error("Error en la conexión WebSocket:", error);
    stopPeriodicDataSending();
  };
  
  // Evento de cierre de conexión
  ws.onclose = function() {
    console.log("Conexión WebSocket cerrada. Intentando reconectar...");
    stopPeriodicDataSending();
    setTimeout(connectWebSocket, reconnectInterval);
  };
}

// Función para iniciar el envío periódico de datos
function startPeriodicDataSending() {
  stopPeriodicDataSending();
  
  dataInterval = setInterval(() => {
    const data = generateData();
    const dataMessage = {
      event: "data",
      data: data
    };
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(dataMessage));
      console.log("Datos enviados al servidor");
    }
  }, CONFIG.interval);
}

// Función para detener el envío periódico de datos
function stopPeriodicDataSending() {
  if (dataInterval) {
    clearInterval(dataInterval);
    dataInterval = null;
  }
}

// Función para enviar datos al servidor
function sendData(data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    if (!data) {
      data = generateData();
    }
    
    const dataMessage = {
      event: "data",
      data: data
    };
    
    ws.send(JSON.stringify(dataMessage));
    console.log("Datos enviados al servidor");
    return true;
  }
  return false;
}

// Función para cerrar la conexión manualmente
function closeWebSocket() {
  stopPeriodicDataSending();
  
  if (ws) {
    ws.close();
    ws = null;
  }
}

// Iniciar la conexión WebSocket
connectWebSocket();`
};

const generateArduinoWebSocketCode = (model_id, device_id, user_id, jsonFields, token) => {
    // Crear plantillas para los campos JSON con valores genéricos
    const fieldTemplates = jsonFields.map(field => {
        return `    "${field}": "x",  # Reemplazar 'x' con el valor deseado`;
    }).join('\n');

    return `import websocket
import json
import time
import random

# Configuración de la conexión WebSocket
ws_url = "ws://localhost:3000/ws"

# Token JWT para autenticación (válido por 1 año)
JWT_TOKEN = "${token}"

# Configuración del dispositivo
CONFIG = {
    "firmware_version": "1.0.0",  # Personalizar con la versión actual del firmware
    "interval": 10,  # Intervalo de envío en segundos
    "debug": False  # Modo debug para información adicional
}

# Estructura de datos basada en el modelo seleccionado
def generate_data():
    # Crear estructura base del payload
    payload = {
        "device_id": "${device_id}",
        "model_id": ${model_id},
        "user_id": "${user_id}",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "firmware_version": CONFIG["firmware_version"],
${fieldTemplates}
    }

    # Crear mensaje completo
    return {
        "token": JWT_TOKEN,
        "payload": payload
    }

# Función para enviar datos periódicamente
def send_periodic_data(ws):
    while True:
        try:
            if ws.sock and ws.sock.connected:
                # Generar datos
                data = generate_data()
                # Crear mensaje de datos
                data_message = {
                    "event": "data",
                    "data": data
                }
                # Enviar datos
                ws.send(json.dumps(data_message))
                print("Datos enviados al servidor")
            # Esperar intervalo configurado antes de enviar más datos
            time.sleep(CONFIG["interval"])
        except Exception as e:
            print(f"Error al enviar datos periódicos: {e}")
            time.sleep(5)

# Función para manejar mensajes recibidos
def on_message(ws, message):
    try:
        data = json.loads(message)
        print(f"Mensaje recibido: {data}")
        # Verificar tipo de evento
        if 'event' in data:
            if data['event'] == 'data_received':
                print(f"Datos recibidos por el servidor: {data['data']}")
            elif data['event'] == 'data_event':
                print(f"Nuevo evento de datos: {data['data']}")
            elif data['event'] == 'error':
                print(f"Error del servidor: {data['data']}")
    except Exception as e:
        print(f"Error al procesar mensaje: {e}")

# Función para manejar errores
def on_error(ws, error):
    print(f"Error: {error}")

# Función para manejar cierre de conexión
def on_close(ws, close_status_code, close_msg):
    print("Conexión cerrada")

# Función para manejar apertura de conexión
def on_open(ws):
    print("Conexión establecida")
    # Iniciar envío periódico de datos
    send_periodic_data(ws)

# Crear conexión WebSocket
ws = websocket.WebSocketApp(ws_url,
                            header={"Authorization": f"Bearer {JWT_TOKEN}"},
                            on_message=on_message,
                            on_error=on_error,
                            on_close=on_close)
ws.on_open = on_open

# Iniciar conexión en un bucle para reconectar automáticamente
try:
    while True:
        try:
            ws.run_forever()
            print("Intentando reconectar en 5 segundos...")
            time.sleep(5)
        except KeyboardInterrupt:
            break
finally:
    # Asegurarse de detener el envío periódico de datos al salir
    ws.close()
    print("Detenido envío periódico de datos")`;
}

const getLatestData = async (req, res) => {
    try {
        const model_id = req.query.model;
        const device_id = req.query.device;
        
        if (!model_id || !device_id) {
            return res.status(400).json({ message: 'Se requieren los parámetros model y device' });
        }
        
        const data = await dataService.getLatestData(model_id, device_id);
        res.status(200).json(data);
    } catch (error) {
        console.error('Error en getLatestData:', error);
        res.status(500).json({ message: error.message });
    }
};

export default {
    create: createData,
    getByModelAndDevice: getDatabyModelandDevice,
    getByModel: getDatabyModel,
    getByDevice: getDatabyDevice,
    getLatest: getDatabyDateRange,
    getByDateRange: getDatabyDateRange,
    getGraphable: getGraphableData,
    getJsonPost: getJsonForPost,
    getBoolean: getBooleanFields,
    getModelName: getModelName,
    getWebSocketCode
};