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
        const { device } = req.query;
        const data = await dataService.getDatabyDevice(device);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
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

// Función auxiliar para generar código Python
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
import re
import ssl
import uuid
import platform
import subprocess
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
mac_address = "desconocida"

# Función para obtener la dirección MAC del dispositivo
def get_mac_address():
    """
    Intenta obtener la dirección MAC del dispositivo utilizando diferentes métodos
    según el sistema operativo.
    
    Returns:
        str: La dirección MAC del dispositivo o 'desconocida' si no se puede obtener
    """
    try:
        # Método 1: Usando uuid (funciona en muchos sistemas)
        mac = ':'.join(['{:02x}'.format((uuid.getnode() >> elements) & 0xff) for elements in range(0, 48, 8)][::-1])
        if mac and mac != '00:00:00:00:00:00':
            return mac
            
        # Método 2: Usando comandos del sistema según la plataforma
        system = platform.system().lower()
        
        if system == 'linux':
            # En Linux, intentar con ip o ifconfig
            try:
                output = subprocess.check_output('ip link show', shell=True).decode('utf-8')
                for line in output.split('\n'):
                    if 'link/ether' in line:
                        mac = line.split('link/ether')[1].split()[0].strip()
                        if mac and mac != '00:00:00:00:00:00':
                            return mac
            except:
                try:
                    output = subprocess.check_output('ifconfig', shell=True).decode('utf-8')
                    for line in output.split('\n'):
                        if 'ether' in line:
                            mac = line.split('ether')[1].split()[0].strip()
                            if mac and mac != '00:00:00:00:00:00':
                                return mac
                except:
                    pass
                    
        elif system == 'darwin':  # macOS
            try:
                output = subprocess.check_output('ifconfig en0', shell=True).decode('utf-8')
                for line in output.split('\n'):
                    if 'ether' in line:
                        mac = line.split('ether')[1].strip()
                        if mac and mac != '00:00:00:00:00:00':
                            return mac
            except:
                pass
                
        elif system == 'windows':
            try:
                output = subprocess.check_output('getmac /v /fo csv /nh', shell=True).decode('utf-8')
                for line in output.split('\n'):
                    if ',' in line:
                        parts = line.split(',')
                        if len(parts) >= 2:
                            mac = parts[1].strip('"')
                            if mac and mac != '00:00:00:00:00:00':
                                return mac
            except:
                pass
    except Exception as e:
        logger.error(f"Error al obtener dirección MAC: {e}")
    
    # Si todos los métodos fallan, devolver valor por defecto
    return "desconocida"



# Estructura de datos basada en el modelo seleccionado
def generate_data():
    """
    Genera un conjunto de datos completo basado en el modelo definido.
    Incluye timestamp para seguimiento temporal de los datos, dirección MAC y versión de firmware.
    """
    # Obtener timestamp actual
    timestamp = datetime.now().isoformat()
    
    # Obtener dirección MAC si aún no se ha obtenido
    global mac_address
    if mac_address == "desconocida":
        mac_address = get_mac_address()
        logger.info(f"Dirección MAC obtenida: {mac_address}")
    
    # Crear estructura base
    data = {
        "model_id": ${model_id},
        "device_id": "${device_id}",
        "user_id": "${user_id}",
        "timestamp": timestamp,
        "mac_address": mac_address,
        "firmware_version": CONFIG["firmware_version"],
${fieldTemplates},
        "token": JWT_TOKEN
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
                # Aquí puedes implementar lógica adicional según la respuesta
                
            elif data['event'] == 'data_event':
                logger.info(f"Nuevo evento de datos: {data['data']}")
                # Procesar eventos especiales del servidor
                process_server_event(data['data'])
                
            elif data['event'] == 'error':
                logger.error(f"Error del servidor: {data['data']}")
                # Manejar errores específicos del servidor
                handle_server_error(data['data'])
                
            elif data['event'] == 'config':
                logger.info(f"Configuración recibida del servidor: {data['data']}")
                # Actualizar configuración si el servidor lo solicita
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
            
            # Implementar lógica para diferentes comandos
            if command == 'restart':
                logger.info("Reiniciando cliente por solicitud del servidor...")
                # Lógica de reinicio
                
            elif command == 'update_interval':
                if 'value' in event_data:
                    CONFIG["interval"] = event_data['value']
                    logger.info(f"Intervalo actualizado a {CONFIG['interval']} segundos")
                    
            elif command == 'request_data':
                # Enviar datos inmediatamente si el servidor lo solicita
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
                # Aquí podrías implementar lógica para obtener un nuevo token
                
            elif error_code == 'invalid_data':
                logger.error(f"Datos inválidos: {error_data.get('message', '')}")
                # Corregir formato de datos en próximos envíos
                
            elif error_code == 'rate_limit':
                logger.warning("Límite de tasa alcanzado. Reduciendo frecuencia de envío.")
                # Aumentar intervalo temporalmente
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
    # La suscripción ahora es automática con el token
    # Iniciar envío periódico de datos
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
    
    Args:
        data: Diccionario con los datos a enviar o None para generar datos nuevos
        
    Returns:
        bool: True si el envío fue exitoso, False en caso contrario
    """
    global ws
    
    if not ws or not ws.sock or not ws.sock.connected:
        logger.error("WebSocket no conectado. No se pueden enviar datos.")
        return False
    
    try:
        # Si no se proporcionan datos, generarlos
        if data is None:
            data = generate_data()
        # Si se proporcionan datos, asegurarse de que incluyan los campos requeridos
        elif isinstance(data, dict):
            data.update({
                "model_id": ${model_id},
                "device_id": "${device_id}",
                "user_id": "${user_id}",
                "token": JWT_TOKEN,
                "timestamp": datetime.now().isoformat()
            })
        
        # Crear mensaje de datos
        data_message = {
            "event": "data",
            "data": data
        }
        
        # Enviar datos
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
    
    # Mostrar información de inicio
    logger.info("=== Cliente WebSocket IoT - OpenIoTZen ===")
    logger.info(f"Modelo ID: {${model_id}}")
    logger.info(f"Dispositivo ID: {"${device_id}"}")
    logger.info(f"Intervalo de envío: {CONFIG['interval']} segundos")
    
    # Seleccionar URL según configuración
    url = WS_SECURE_URL if CONFIG["use_ssl"] else WS_URL
    
    # Configurar opciones SSL si es necesario
    sslopt = {"cert_reqs": ssl.CERT_NONE} if CONFIG["use_ssl"] else None
    
    try:
        # Crear conexión WebSocket con encabezados de autenticación
        headers = {"Authorization": f"Bearer {JWT_TOKEN}"}
        
        while True:
            try:
                logger.info(f"Conectando a {url}...")
                
                # Crear objeto WebSocket
                ws = websocket.WebSocketApp(
                    url,
                    header=headers,
                    on_open=on_open,
                    on_message=on_message,
                    on_error=on_error,
                    on_close=on_close
                )
                
                # Iniciar conexión
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
        # Asegurarse de detener el envío periódico de datos al salir
        stop_periodic_data()
        logger.info("Cliente WebSocket finalizado")

# Punto de entrada para ejecución directa
if __name__ == "__main__":
    # Habilitar modo debug si se solicita
    if "--debug" in sys.argv:
        CONFIG["debug"] = True
        logger.setLevel(logging.DEBUG)
        logger.debug("Modo debug activado")
        
    # Iniciar cliente
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Programa terminado por el usuario")
    except Exception as e:
        logger.critical(f"Error crítico: {e}")
        sys.exit(1)`;
};


// Función auxiliar para generar código JavaScript
const generateJavaScriptWebSocketCode = (model_id, device_id, user_id, jsonFields, token) => {
    // Crear plantillas para los campos JSON con valores genéricos
    const fieldTemplates = jsonFields.map(field => {
        return `    "${field}": "x", // Reemplazar 'x' con el valor deseado`;
    }).join('\n');
    
    return `
import WebSocket from 'ws';
import os from 'os'; // Para obtener interfaces de red
  
// Configuración de la conexión WebSocket
const wsUrl = "ws://localhost:3000/ws";
let ws;
let reconnectInterval = 5000; // 5 segundos
let dataInterval;

// Token JWT para autenticación (válido por 1 año)
const JWT_TOKEN = "${token}";

// Configuración del dispositivo
const CONFIG = {
  firmwareVersion: "1.0.0" // Personalizar con la versión actual del firmware
};

// Función para obtener la dirección MAC del dispositivo
function getMacAddress() {
  try {
    // Obtener interfaces de red
    const interfaces = os.networkInterfaces();
    
    // Buscar la dirección MAC en las interfaces disponibles
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        // Buscar interfaces IPv4 no internas
        if (iface.family === 'IPv4' && !iface.internal) {
          // En algunos sistemas, la dirección MAC está disponible como iface.mac
          if (iface.mac && iface.mac !== '00:00:00:00:00:00') {
            return iface.mac;
          }
        }
      }
    }
    
    // Si no se encuentra, intentar con otro método dependiendo del entorno
    // Este código se ejecutará en Node.js, pero se proporciona como referencia
    
    return "desconocida"; // Valor por defecto si no se puede determinar
  } catch (error) {
    console.error("Error al obtener dirección MAC:", error);
    return "desconocida";
  }
}

// Obtener dirección MAC
const macAddress = getMacAddress();
console.log("Dirección MAC del dispositivo:", macAddress);

// Estructura de datos basada en el modelo seleccionado
function generateData() {
  return {
    "model_id": ${model_id},
    "device_id": "${device_id}",
    "user_id": "${user_id}",
    "mac_address": macAddress,
    "firmware_version": CONFIG.firmwareVersion,
${fieldTemplates},
    "token": JWT_TOKEN
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
    // La suscripción ahora es automática con el token
    
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
          // Aquí puedes procesar los datos recibidos y actualizar la UI
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
    // Detener el envío periódico de datos si hay un error
    stopPeriodicDataSending();
  };
  
  // Evento de cierre de conexión
  ws.onclose = function() {
    console.log("Conexión WebSocket cerrada. Intentando reconectar...");
    // Detener el envío periódico de datos
    stopPeriodicDataSending();
    
    // Intentar reconectar después del intervalo definido
    setTimeout(connectWebSocket, reconnectInterval);
  };
}

// Función para iniciar el envío periódico de datos
function startPeriodicDataSending() {
  // Detener cualquier intervalo existente
  stopPeriodicDataSending();
  
  // Iniciar nuevo intervalo para enviar datos cada 10 segundos
  dataInterval = setInterval(() => {
    // Generar datos de ejemplo
    const data = generateData();
    
    // Crear mensaje de datos
    const dataMessage = {
      event: "data",
      data: data
    };
    
    // Enviar datos
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(dataMessage));
      console.log("Datos enviados al servidor");
    }
  }, 10000); // Enviar datos cada 10 segundos
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
    // Crear mensaje de datos
    const dataMessage = {
      event: "data",
      data: {
        ...data,
        model_id: ${model_id},
        device_id: "${device_id}",
        user_id: "${user_id}",
        token: JWT_TOKEN
      }
    };
    
    // Enviar datos
    ws.send(JSON.stringify(dataMessage));
    console.log("Datos enviados al servidor");
    return true;
  }
  return false;
}

// Función para cerrar la conexión manualmente (llamar cuando se desmonte el componente)
function closeWebSocket() {
  // Detener el envío periódico de datos
  stopPeriodicDataSending();
  
  // Cerrar conexión
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
import uuid
import platform
import subprocess

# Configuración de la conexión WebSocket
ws_url = "ws://localhost:3000/ws"

# Token JWT para autenticación (válido por 1 año)
JWT_TOKEN = "${token}"

# Configuración del dispositivo
FIRMWARE_VERSION = "1.0.0"  # Personalizar con la versión actual del firmware

# Función para obtener la dirección MAC del dispositivo
def get_mac_address():
    try:
        # Método 1: Usando uuid (funciona en muchos sistemas)
        mac = ':'.join(['{:02x}'.format((uuid.getnode() >> elements) & 0xff) for elements in range(0, 48, 8)][::-1])
        if mac and mac != '00:00:00:00:00:00':
            return mac
            
        # Método 2: Usando comandos del sistema según la plataforma
        system = platform.system().lower()
        
        if system == 'linux':
            # En Linux, intentar con ip o ifconfig
            try:
                output = subprocess.check_output('ip link show', shell=True).decode('utf-8')
                for line in output.split('\n'):
                    if 'link/ether' in line:
                        mac = line.split('link/ether')[1].split()[0].strip()
                        if mac and mac != '00:00:00:00:00:00':
                            return mac
            except:
                try:
                    output = subprocess.check_output('ifconfig', shell=True).decode('utf-8')
                    for line in output.split('\n'):
                        if 'ether' in line:
                            mac = line.split('ether')[1].split()[0].strip()
                            if mac and mac != '00:00:00:00:00:00':
                                return mac
                except:
                    pass
        
        # Si todos los métodos fallan, devolver valor por defecto
        return "desconocida"
    except Exception as e:
        print(f"Error al obtener dirección MAC: {e}")
        return "desconocida"

# Obtener dirección MAC
mac_address = get_mac_address()
print(f"Dirección MAC del dispositivo: {mac_address}")

# Estructura de datos basada en el modelo seleccionado
def generate_data():
    return {
        "model_id": ${model_id},
        "device_id": "${device_id}",
        "user_id": "${user_id}",
        "mac_address": mac_address,
        "firmware_version": FIRMWARE_VERSION,
        ${fieldTemplates},
        "token": JWT_TOKEN
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
            # Esperar 10 segundos antes de enviar más datos
            time.sleep(10)
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
    # La suscripción ahora es automática con el token
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

export default { createData, getDatabyModelandDevice, getDatabyModel, getDatabyDevice, getDatabyDateRange, getGraphableData, getModelName, getJsonForPost, getLatestData, getBooleanFields, getWebSocketCode };