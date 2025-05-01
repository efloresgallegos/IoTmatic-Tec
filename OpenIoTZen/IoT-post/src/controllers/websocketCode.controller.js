import jwt from 'jsonwebtoken';
import Model from '../models/models.model.js';

/**
 * Controlador para generar código WebSocket para diferentes lenguajes y tipos de conexión
 */
const websocketCodeController = {
  /**
   * Genera código WebSocket para Python y JavaScript basado en el modelo y tipo de conexión
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

      // Validar parámetros requeridos
      if (!deviceId || !modelId || !userId) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren deviceId, modelId y userId'
        });
      }

      // Obtener información del modelo para generar campos de ejemplo
      let modelFields = [];
      try {
        const modelData = await Model.findByPk(modelId);
        if (modelData && modelData.fields) {
          modelFields = modelData.fields;
        } else {
          // Usar campos de ejemplo si no se encuentra el modelo
          modelFields = [
            { name: 'temperatura', type: 'Float' },
            { name: 'humedad', type: 'Float' },
            { name: 'presion', type: 'Float' },
            { name: 'nivel', type: 'Float' },
            { name: 'ubicacion', type: 'String' }
          ];
        }
      } catch (error) {
        console.error('Error al obtener campos del modelo:', error);
        // Continuar con campos de ejemplo
        modelFields = [
          { name: 'temperatura', type: 'Float' },
          { name: 'humedad', type: 'Float' },
          { name: 'presion', type: 'Float' },
          { name: 'nivel', type: 'Float' },
          { name: 'ubicacion', type: 'String' }
        ];
      }

      // Generar un token JWT de ejemplo (en producción vendría del servidor)
      const jwtToken = jwt.sign(
        { user: userId, device: deviceId, model: modelId },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1y' }
      );

      // URL del servidor WebSocket
      const serverUrl = process.env.WS_SERVER_URL || "ws://localhost:3000/ws";

      // Generar código para Python
      const pythonCode = generatePythonCode(deviceId, modelId, userId, jwtToken, connectionType, serverUrl, modelFields);

      // Generar código para JavaScript
      const javascriptCode = generateJavaScriptCode(deviceId, modelId, userId, jwtToken, connectionType, serverUrl, modelFields);

      // Devolver ambos códigos
      return res.status(200).json({
        success: true,
        data: {
          pythonCode,
          javascriptCode
        }
      });
    } catch (error) {
      console.error('Error al generar código WebSocket:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al generar código WebSocket',
        error: error.message
      });
    }
  }
};

/**
 * Genera código Python para conexión WebSocket
 */
function generatePythonCode(deviceId, modelId, userId, jwtToken, connectionType, serverUrl, modelFields) {
  // Estructura base del código Python
  let pythonCode = `import websocket
import json
import time
import random
import threading
import sys
import ssl

# Configuración de la conexión WebSocket
ws_url = "${serverUrl}"

# Token JWT para autenticación (válido por 1 año)
JWT_TOKEN = "${jwtToken}"

# Variable para controlar el envío periódico de datos
data_thread = None
running = False

# Estructura de datos basada en el modelo seleccionado
def generate_data():
    return {
        "model_id": ${modelId},
        "device_id": "${deviceId}",
        "user_id": "${userId}",`;

  // Agregar campos basados en el modelo
  modelFields.forEach(field => {
    let defaultValue;
    switch (field.type) {
      case 'Integer':
        defaultValue = 'random.randint(0, 100)';
        break;
      case 'Float':
      case 'Number':
        defaultValue = 'round(random.uniform(0, 100), 2)';
        break;
      case 'Boolean':
        defaultValue = 'random.choice([True, False])';
        break;
      case 'Date':
        defaultValue = 'time.strftime("%Y-%m-%d %H:%M:%S")';
        break;
      case 'String':
      default:
        defaultValue = `"valor_${field.name}"`;
    }
    pythonCode += `\n        "${field.name}": ${defaultValue},  # Reemplazar con valores reales`;
  });

  pythonCode += `\n        "token": JWT_TOKEN\n    }\n\n`;

  // Agregar código específico según el tipo de conexión
  if (connectionType === 'periodic') {
    pythonCode += `# Función para enviar datos periódicamente\ndef send_periodic_data(ws):\n    global running\n    while running:\n        try:\n            if ws.sock and ws.sock.connected:\n                # Generar datos\n                data = generate_data()\n                \n                # Crear mensaje de datos\n                data_message = {\n                    "event": "data",\n                    "data": data\n                }\n                \n                # Enviar datos\n                ws.send(json.dumps(data_message))\n                print("Datos enviados al servidor")\n            \n            # Esperar 10 segundos antes de enviar más datos\n            time.sleep(10)\n        except Exception as e:\n            print(f"Error al enviar datos periódicos: {e}")\n            time.sleep(5)\n`;
  } else if (connectionType === 'event') {
    pythonCode += `# Función para simular eventos y enviar datos\ndef simulate_events(ws):\n    global running\n    while running:\n        try:\n            # Simular un evento aleatorio (en un caso real, esto sería un evento real del dispositivo)\n            event_type = random.choice(["temperature_alert", "humidity_change", "pressure_drop", "level_critical"])\n            \n            # Generar datos basados en el evento\n            data = generate_data()\n            data["event_type"] = event_type\n            \n            # Crear mensaje de datos\n            data_message = {\n                "event": "data_event",\n                "data": data\n            }\n            \n            # Enviar datos solo si hay un evento\n            if ws.sock and ws.sock.connected:\n                ws.send(json.dumps(data_message))\n                print(f"Evento {event_type} enviado al servidor")\n            \n            # Esperar un tiempo aleatorio antes del próximo evento (entre 5 y 30 segundos)\n            time.sleep(random.randint(5, 30))\n        except Exception as e:\n            print(f"Error al simular eventos: {e}")\n            time.sleep(5)\n`;
  } else if (connectionType === 'batch') {
    pythonCode += `# Función para acumular datos en lotes y enviarlos\ndef collect_and_send_batch(ws):\n    global running\n    batch_data = []\n    batch_size = 5  # Tamaño del lote\n    \n    while running:\n        try:\n            # Generar y acumular datos\n            if len(batch_data) < batch_size:\n                batch_data.append(generate_data())\n                print(f"Datos acumulados: {len(batch_data)}/{batch_size}")\n                time.sleep(5)  # Esperar 5 segundos entre cada recolección de datos\n            \n            # Enviar el lote cuando alcance el tamaño deseado\n            if len(batch_data) >= batch_size and ws.sock and ws.sock.connected:\n                batch_message = {\n                    "event": "batch_data",\n                    "data": {\n                        "batch": batch_data,\n                        "timestamp": time.time(),\n                        "device_id": "${deviceId}",\n                        "model_id": ${modelId},\n                        "user_id": "${userId}",\n                        "token": JWT_TOKEN\n                    }\n                }\n                \n                ws.send(json.dumps(batch_message))\n                print(f"Lote de {len(batch_data)} datos enviado al servidor")\n                batch_data = []  # Reiniciar el lote\n        except Exception as e:\n            print(f"Error al procesar lote de datos: {e}")\n            time.sleep(5)\n`;
  }

  // Agregar funciones comunes para todos los tipos de conexión
  pythonCode += `\n# Función para manejar mensajes recibidos\ndef on_message(ws, message):\n    try:\n        data = json.loads(message)\n        print(f"Mensaje recibido: {data}")\n        \n        # Verificar tipo de evento\n        if 'event' in data:\n            if data['event'] == 'subscription_confirmed':\n                print(f"Suscripción confirmada: {data['data']}")\n            elif data['event'] == 'data_received':\n                print(f"Datos recibidos por el servidor: {data['data']}")\n            elif data['event'] == 'data_event':\n                print(f"Nuevo evento de datos: {data['data']}")\n            elif data['event'] == 'error':\n                print(f"Error del servidor: {data['data']}")\n    except Exception as e:\n        print(f"Error al procesar mensaje: {e}")\n\n# Función para manejar errores\ndef on_error(ws, error):\n    print(f"Error: {error}")\n    stop_periodic_data()\n\n# Función para manejar cierre de conexión\ndef on_close(ws, close_status_code, close_msg):\n    print("Conexión cerrada")\n    stop_periodic_data()\n\n# Función para manejar apertura de conexión\ndef on_open(ws):\n    print("Conexión establecida")\n    # La autenticación ya se ha realizado con el token JWT en la cabecera\n    # Y la suscripción es automática al conectarse con el token JWT\n    print("Autenticación y suscripción automáticas completadas")\n    \n    # Iniciar envío de datos según el modo seleccionado\n`;

  // Agregar código específico para iniciar el envío según el tipo de conexión
  if (connectionType === 'periodic') {
    pythonCode += `    # Iniciar envío periódico de datos\n    start_periodic_data(ws)\n\n# Función para iniciar el envío periódico de datos\ndef start_periodic_data(ws):\n    global data_thread, running\n    if data_thread is None or not data_thread.is_alive():\n        running = True\n        data_thread = threading.Thread(target=send_periodic_data, args=(ws,))\n        data_thread.daemon = True\n        data_thread.start()\n        print("Iniciado envío periódico de datos")\n\n# Función para detener el envío periódico de datos\ndef stop_periodic_data():\n    global running\n    running = False\n    print("Detenido envío periódico de datos")\n`;
  } else if (connectionType === 'event') {
    pythonCode += `    # Iniciar simulación de eventos\n    start_event_simulation(ws)\n\n# Función para iniciar la simulación de eventos\ndef start_event_simulation(ws):\n    global data_thread, running\n    if data_thread is None or not data_thread.is_alive():\n        running = True\n        data_thread = threading.Thread(target=simulate_events, args=(ws,))\n        data_thread.daemon = True\n        data_thread.start()\n        print("Iniciada simulación de eventos")\n\n# Función para detener la simulación de eventos\ndef stop_periodic_data():\n    global running\n    running = False\n    print("Detenida simulación de eventos")\n`;
  } else if (connectionType === 'batch') {
    pythonCode += `    # Iniciar recolección y envío de lotes\n    start_batch_collection(ws)\n\n# Función para iniciar la recolección y envío de lotes\ndef start_batch_collection(ws):\n    global data_thread, running\n    if data_thread is None or not data_thread.is_alive():\n        running = True\n        data_thread = threading.Thread(target=collect_and_send_batch, args=(ws,))\n        data_thread.daemon = True\n        data_thread.start()\n        print("Iniciada recolección de datos en lotes")\n\n# Función para detener la recolección de lotes\ndef stop_periodic_data():\n    global running\n    running = False\n    print("Detenida recolección de datos en lotes")\n`;
  }

  // Finalizar el código Python
  pythonCode += `\n# Función para enviar datos manualmente\ndef send_data(data):\n    if not ws.sock or not ws.sock.connected:\n        print("WebSocket no conectado")\n        return False\n    \n    # Asegurarse de que los datos incluyan los campos requeridos\n    if isinstance(data, dict):\n        data.update({\n            "model_id": ${modelId},\n            "device_id": "${deviceId}",\n            "user_id": "${userId}",\n            "token": JWT_TOKEN\n        })\n    \n    # Crear mensaje de datos\n    data_message = {\n        "event": "data",\n        "data": data\n    }\n    \n    # Enviar datos\n    ws.send(json.dumps(data_message))\n    print("Datos enviados al servidor")\n    return True\n\n# Establecer la conexión WebSocket con el token JWT como protocolo\nif __name__ == "__main__":\n    websocket.enableTrace(True)  # Activar para depurar la conexión\n    \n    # Usar el token JWT como protocolo para la autenticación\n    # Esta es la forma más confiable para asegurar autenticación\n    ws = websocket.WebSocketApp(\n        ws_url,\n        header=[f"Authorization: Bearer {JWT_TOKEN}"],\n        on_open=on_open,\n        on_message=on_message,\n        on_error=on_error,\n        on_close=on_close,\n        subprotocols=[f"Bearer {JWT_TOKEN}"]  # Incluir token como subprotocolo para mayor compatibilidad\n    )\n    \n    # Iniciar conexión en bucle para reconectar automáticamente\n    try:\n        print(f"Conectando a {ws_url} con token JWT...")\n        while True:\n            try:\n                ws.run_forever()\n                print("Conexión perdida. Intentando reconectar en 5 segundos...")\n                time.sleep(5)\n            except KeyboardInterrupt:\n                print("Programa terminado por el usuario")\n                break\n            except Exception as e:\n                print(f"Error: {e}")\n                time.sleep(5)\n    finally:\n        # Asegurarse de detener el envío de datos al salir\n        stop_periodic_data()\n`;

  return pythonCode;
}

/**
 * Genera código JavaScript para conexión WebSocket
 */
function generateJavaScriptCode(deviceId, modelId, userId, jwtToken, connectionType, serverUrl, modelFields) {
  // Estructura base del código JavaScript
  let jsCode = `// Configuración de la conexión WebSocket
const wsUrl = "${serverUrl}";

// Token JWT para autenticación
const JWT_TOKEN = "${jwtToken}";

// Variables para controlar el envío de datos
let ws = null;
let isRunning = false;
let dataInterval = null;

// Función para generar datos según el modelo seleccionado
function generateData() {
  return {
    model_id: ${modelId},
    device_id: "${deviceId}",
    user_id: "${userId}",`;

  // Agregar campos basados en el modelo
  modelFields.forEach(field => {
    let defaultValue;
    switch (field.type) {
      case 'Integer':
        defaultValue = 'Math.floor(Math.random() * 100)';
        break;
      case 'Float':
      case 'Number':
        defaultValue = 'Math.round(Math.random() * 100 * 100) / 100';
        break;
      case 'Boolean':
        defaultValue = 'Math.random() > 0.5';
        break;
      case 'Date':
        defaultValue = 'new Date().toISOString()';
        break;
      case 'String':
      default:
        defaultValue = `"valor_${field.name}"`;
    }
    jsCode += `\n    ${field.name}: ${defaultValue}, // Reemplazar con valores reales`;
  });

  jsCode += `\n    token: JWT_TOKEN
  };
}

`;

  // Agregar código específico según el tipo de conexión
  if (connectionType === 'periodic') {
    jsCode += `// Función para enviar datos periódicamente
function startPeriodicData() {
  if (dataInterval) {
    clearInterval(dataInterval);
  }
  
  isRunning = true;
  dataInterval = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      // Generar datos
      const data = generateData();
      
      // Crear mensaje de datos
      const dataMessage = {
        event: "data",
        data: data
      };
      
      // Enviar datos
      ws.send(JSON.stringify(dataMessage));
      console.log("Datos enviados al servidor");
    }
  }, 10000); // Enviar cada 10 segundos
  
  console.log("Iniciado envío periódico de datos");
}

function stopPeriodicData() {
  isRunning = false;
  if (dataInterval) {
    clearInterval(dataInterval);
    dataInterval = null;
  }
  console.log("Detenido envío periódico de datos");
}
`;
  } else if (connectionType === 'event') {
    jsCode += `// Función para simular eventos y enviar datos
function startEventSimulation() {
  if (dataInterval) {
    clearInterval(dataInterval);
  }
  
  isRunning = true;
  simulateEvent();
  
  console.log("Iniciada simulación de eventos");
}

function simulateEvent() {
  if (!isRunning) return;
  
  // Simular un evento aleatorio
  const eventTypes = ["temperature_alert", "humidity_change", "pressure_drop", "level_critical"];
  const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  
  // Generar datos basados en el evento
  const data = generateData();
  data.event_type = eventType;
  
  // Crear mensaje de datos
  const dataMessage = {
    event: "data_event",
    data: data
  };
  
  // Enviar datos solo si hay un evento
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(dataMessage));
    console.log(\`Evento \${eventType} enviado al servidor\`);
  }
  
  // Programar el próximo evento en un tiempo aleatorio (entre 5 y 30 segundos)
  const nextEventTime = Math.floor(Math.random() * 25000) + 5000;
  setTimeout(simulateEvent, nextEventTime);
}

function stopEventSimulation() {
  isRunning = false;
  console.log("Detenida simulación de eventos");
}
`;
  } else if (connectionType === 'batch') {
    jsCode += `// Variables para el manejo de lotes
let batchData = [];
const batchSize = 5;

// Función para acumular datos en lotes y enviarlos
function startBatchCollection() {
  if (dataInterval) {
    clearInterval(dataInterval);
  }
  
  isRunning = true;
  dataInterval = setInterval(() => {
    // Generar y acumular datos
    if (batchData.length < batchSize) {
      batchData.push(generateData());
      console.log(\`Datos acumulados: \${batchData.length}/\${batchSize}\`);
    }
    
    // Enviar el lote cuando alcance el tamaño deseado
    if (batchData.length >= batchSize && ws && ws.readyState === WebSocket.OPEN) {
      const batchMessage = {
        event: "batch_data",
        data: {
          batch: batchData,
          timestamp: Date.now(),
          device_id: "${deviceId}",
          model_id: ${modelId},
          user_id: "${userId}",
          token: JWT_TOKEN
        }
      };
      
      ws.send(JSON.stringify(batchMessage));
      console.log(\`Lote de \${batchData.length} datos enviado al servidor\`);
      batchData = []; // Reiniciar el lote
    }
  }, 5000); // Recolectar datos cada 5 segundos
  
  console.log("Iniciada recolección de datos en lotes");
}

function stopBatchCollection() {
  isRunning = false;
  if (dataInterval) {
    clearInterval(dataInterval);
    dataInterval = null;
  }
  batchData = [];
  console.log("Detenida recolección de datos en lotes");
}
`;
  }

  // Agregar funciones comunes para todos los tipos de conexión
  jsCode += `
// Función para manejar mensajes recibidos
function handleMessage(event) {
  try {
    const data = JSON.parse(event.data);
    console.log("Mensaje recibido:", data);
    
    // Verificar tipo de evento
    if (data.event) {
      if (data.event === 'subscription_confirmed') {
        console.log("Suscripción confirmada:", data.data);
      } else if (data.event === 'data_received') {
        console.log("Datos recibidos por el servidor:", data.data);
      } else if (data.event === 'data_event') {
        console.log("Nuevo evento de datos:", data.data);
      } else if (data.event === 'error') {
        console.error("Error del servidor:", data.data);
      }
    }
  } catch (error) {
    console.error("Error al procesar mensaje:", error);
  }
}

// Función para iniciar la conexión WebSocket
function connectWebSocket() {
  // Cerrar conexión existente si hay alguna
  if (ws) {
    ws.close();
  }
  
  try {
    // Crear nueva conexión WebSocket con autenticación
    console.log("Conectando a WebSocket con token JWT...");
    
    // Método 1: Usar el token como subprotocolo
    const protocols = [\`Bearer \${JWT_TOKEN}\`];
    ws = new WebSocket(wsUrl, protocols);
    
    // Alternativamente, configurar encabezado de autorización (solo funciona en algunos navegadores/entornos)
    // Este método es una alternativa y puede no funcionar en todos los navegadores
    if (ws.setRequestHeader) {
      ws.setRequestHeader('Authorization', \`Bearer \${JWT_TOKEN}\`);
    }
  } catch (error) {
    console.error("Error al crear conexión WebSocket:", error);
    // Reintento automático después de un tiempo
    setTimeout(connectWebSocket, 5000);
    return;
  }
  
  // Configurar manejadores de eventos
  ws.onopen = function() {
    console.log("Conexión WebSocket establecida");
    console.log("La autenticación y suscripción son automáticas con el token JWT");
    
    // Iniciar envío de datos según el modo seleccionado
`;

  // Agregar código específico para iniciar el envío según el tipo de conexión
  if (connectionType === 'periodic') {
    jsCode += `    // Iniciar envío periódico de datos
    startPeriodicData();
`;
  } else if (connectionType === 'event') {
    jsCode += `    // Iniciar simulación de eventos
    startEventSimulation();
`;
  } else if (connectionType === 'batch') {
    jsCode += `    // Iniciar recolección y envío de lotes
    startBatchCollection();
`;
  }

  jsCode += `  };
  
  ws.onmessage = handleMessage;
  
  ws.onerror = function(error) {
    console.error("Error en la conexión WebSocket:", error);
  };
  
  ws.onclose = function(event) {
    console.log("Conexión WebSocket cerrada:", event.code, event.reason);
    
    // Detener el envío de datos
`;

  // Agregar código específico para detener el envío según el tipo de conexión
  if (connectionType === 'periodic') {
    jsCode += `    stopPeriodicData();
`;
  } else if (connectionType === 'event') {
    jsCode += `    stopEventSimulation();
`;
  } else if (connectionType === 'batch') {
    jsCode += `    stopBatchCollection();
`;
  }

  jsCode += `    // Intentar reconectar después de un tiempo
    console.log("Intentando reconectar en 5 segundos...");
    setTimeout(connectWebSocket, 5000);
  };
}

// Función para enviar datos manualmente
function sendData(data) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.error("WebSocket no conectado");
    return false;
  }
  
  // Asegurarse de que los datos incluyan los campos requeridos
  if (typeof data === 'object') {
    data = {
      ...data,
      model_id: ${modelId},
      device_id: "${deviceId}",
      user_id: "${userId}",
      token: JWT_TOKEN
    };
  }
  
  // Crear mensaje de datos
  const dataMessage = {
    event: "data",
    data: data
  };
  
  // Enviar datos
  ws.send(JSON.stringify(dataMessage));
  console.log("Datos enviados al servidor");
  return true;
}

// Iniciar la conexión WebSocket
connectWebSocket();

// Manejar cierre de la página
window.addEventListener('beforeunload', function() {
  console.log("Página cerrada, limpiando recursos...");
  
  // Detener el envío de datos
`;

  // Agregar código específico para detener el envío según el tipo de conexión
  if (connectionType === 'periodic') {
    jsCode += `  stopPeriodicData();
`;
  } else if (connectionType === 'event') {
    jsCode += `  stopEventSimulation();
`;
  } else if (connectionType === 'batch') {
    jsCode += `  stopBatchCollection();
`;
  }

  jsCode += `  // Cerrar conexión WebSocket
  if (ws) {
    ws.close();
  }
});
`;

  return jsCode;
}

export default websocketCodeController;