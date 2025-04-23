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
    // Crear plantillas para los campos JSON
    const fieldTemplates = jsonFields.map(field => {
        return `        "${field}": random.randint(0, 100) if isinstance(random.randint(0, 100), int) else random.random(),  # Reemplazar con valores reales`;
    }).join('\n');
    
    return `import websocket
import json
import time
import random
import threading

# Configuración de la conexión WebSocket
ws_url = "ws://localhost:3000/ws"

# Token JWT para autenticación (válido por 1 año)
JWT_TOKEN = "${token}"

# Variable para controlar el envío periódico de datos
data_thread = None
running = False

# Estructura de datos basada en el modelo seleccionado
def generate_data():
    return {
        "model_id": ${model_id},
        "device_id": "${device_id}",
        "user_id": "${user_id}",
${fieldTemplates},
        "token": JWT_TOKEN
    }

# Función para enviar datos periódicamente
def send_periodic_data(ws):
    global running
    while running:
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
            if data['event'] == 'subscription_confirmed':
                print(f"Suscripción confirmada: {data['data']}")
            elif data['event'] == 'data_received':
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
    stop_periodic_data()

# Función para manejar cierre de conexión
def on_close(ws, close_status_code, close_msg):
    print("Conexión cerrada")
    stop_periodic_data()

# Función para manejar apertura de conexión
def on_open(ws):
    print("Conexión establecida")
    
    # Suscribirse a eventos del dispositivo y modelo
    subscribe_message = {
        "event": "subscribe",
        "data": {
            "device_id": "${device_id}",
            "model_id": ${model_id},
            "user_id": "${user_id}",
            "token": JWT_TOKEN
        }
    }
    ws.send(json.dumps(subscribe_message))
    print("Solicitud de suscripción enviada")
    
    # Iniciar envío periódico de datos
    start_periodic_data(ws)

# Función para iniciar el envío periódico de datos
def start_periodic_data(ws):
    global data_thread, running
    if data_thread is None or not data_thread.is_alive():
        running = True
        data_thread = threading.Thread(target=send_periodic_data, args=(ws,))
        data_thread.daemon = True
        data_thread.start()
        print("Iniciado envío periódico de datos")

# Función para detener el envío periódico de datos
def stop_periodic_data():
    global running
    running = False
    print("Detenido envío periódico de datos")

# Función para enviar datos manualmente
def send_data(data):
    if not ws.sock or not ws.sock.connected:
        print("WebSocket no conectado")
        return False
    
    # Asegurarse de que los datos incluyan los campos requeridos
    if isinstance(data, dict):
        data.update({
            "model_id": ${model_id},
            "device_id": "${device_id}",
            "user_id": "${user_id}",
            "token": JWT_TOKEN
        })
    
    # Crear mensaje de datos
    data_message = {
        "event": "data",
        "data": data
    }
    
    # Enviar datos
    ws.send(json.dumps(data_message))
    print("Datos enviados al servidor")
    return True

# Crear conexión WebSocket con encabezados de autenticación
headers = {"Authorization": f"Bearer {JWT_TOKEN}"}
ws = websocket.WebSocketApp(ws_url,
                          header=headers,
                          on_open=on_open,
                          on_message=on_message,
                          on_error=on_error,
                          on_close=on_close)

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
    stop_periodic_data()`;
};

// Función auxiliar para generar código JavaScript
const generateJavaScriptWebSocketCode = (model_id, device_id, user_id, jsonFields, token) => {
    // Crear plantillas para los campos JSON
    const fieldTemplates = jsonFields.map(field => {
        return `    "${field}": Math.random() * 100, // Reemplazar con valores reales`;
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

// Estructura de datos basada en el modelo seleccionado
function generateData() {
  return {
    "model_id": ${model_id},
    "device_id": "${device_id}",
    "user_id": "${user_id}",
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
    
    // Suscribirse a eventos del dispositivo y modelo
    const subscribeMessage = {
      event: "subscribe",
      data: {
        device_id: "${device_id}",
        model_id: ${model_id},
        user_id: "${user_id}",
        token: JWT_TOKEN
      }
    };
    ws.send(JSON.stringify(subscribeMessage));
    console.log("Solicitud de suscripción enviada");
    
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
        case 'subscription_confirmed':
          console.log("Suscripción confirmada:", message.data);
          break;
          
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
  
  // Enviar mensaje de desuscripción
  if (ws && ws.readyState === WebSocket.OPEN) {
    const unsubscribeMessage = {
      event: "unsubscribe",
      data: { token: JWT_TOKEN }
    };
    ws.send(JSON.stringify(unsubscribeMessage));
  }
  
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
    // Crear plantillas para los campos JSON
    const fieldTemplates = jsonFields.map(field => {
        return `    "${field}": random.randint(0, 100),  # Reemplazar con valores reales`;
    }).join('\n');

    return `import websocket
import json
import time
import random
# Configuración de la conexión WebSocket
ws_url = "ws://localhost:3000/ws"
# Token JWT para autenticación (válido por 1 año)
JWT_TOKEN = "${token}"
# Estructura de datos basada en el modelo seleccionado
def generate_data():
    return {
        "model_id": ${model_id},
        "device_id": "${device_id}",
        "user_id": "${user_id}",
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
            if data['event'] =='subscription_confirmed':
                print(f"Suscripción confirmada: {data['data']}")
            elif data['event'] == 'data_received':
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
    # Suscribirse a eventos del dispositivo y modelo
    subscribe_message = {
        "event": "subscribe",
        "data": {
            "device_id": "${device_id}",
            "model_id": ${model_id},
            "user_id": "${user_id}",
            "token": JWT_TOKEN
        }
    }
    ws.send(json.dumps(subscribe_message))
    print("Solicitud de suscripción enviada")
    # Iniciar envío periódico de datos
    send_periodic_data(ws)
# Crear conexión WebSocket
ws = websocket.WebSocketApp(ws_url,
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