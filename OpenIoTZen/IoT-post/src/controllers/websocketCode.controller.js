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
  pythonCode += `\n# Función para manejar mensajes recibidos\ndef on_message(ws, message):\n    try:\n        data = json.loads(message)\n        print(f"Mensaje recibido: {data}")\n        \n        # Verificar tipo de evento\n        if 'event' in data:\n            if data['event'] == 'subscription_confirmed':\n                print(f"Suscripción confirmada: {data['data']}")\n            elif data['event'] == 'data_received':\n                print(f"Datos recibidos por el servidor: {data['data']}")\n            elif data['event'] == 'data_event':\n                print(f"Nuevo evento de datos: {data['data']}")\n            elif data['event'] == 'error':\n                print(f"Error del servidor: {data['data']}")\n    except Exception as e:\n        print(f"Error al procesar mensaje: {e}")\n\n# Función para manejar errores\ndef on_error(ws, error):\n    print(f"Error: {error}")\n    stop_periodic_data()\n\n# Función para manejar cierre de conexión\ndef on_close(ws, close_status_code, close_msg):\n    print("Conexión cerrada")\n    stop_periodic_data()\n\n# Función para manejar apertura de conexión\ndef on_open(ws):\n    print("Conexión establecida")\n    \n    # Suscribirse a eventos del dispositivo y modelo\n    subscribe_message = {\n        "event": "subscribe",\n        "data": {\n            "device_id": "${deviceId}",\n            "model_id": ${modelId},\n            "user_id": "${userId}",\n            "token": JWT_TOKEN\n        }\n    }\n    ws.send(json.dumps(subscribe_message))\n    print("Solicitud de suscripción enviada")\n    \n    # Iniciar envío de datos según el modo seleccionado\n`;

  // Agregar código específico para iniciar el envío según el tipo de conexión
  if (connectionType === 'periodic') {
    pythonCode += `    # Iniciar envío periódico de datos\n    start_periodic_data(ws)\n\n# Función para iniciar el envío periódico de datos\ndef start_periodic_data(ws):\n    global data_thread, running\n    if data_thread is None or not data_thread.is_alive():\n        running = True\n        data_thread = threading.Thread(target=send_periodic_data, args=(ws,))\n        data_thread.daemon = True\n        data_thread.start()\n        print("Iniciado envío periódico de datos")\n\n# Función para detener el envío periódico de datos\ndef stop_periodic_data():\n    global running\n    running = False\n    print("Detenido envío periódico de datos")\n`;
  } else if (connectionType === 'event') {
    pythonCode += `    # Iniciar simulación de eventos\n    start_event_simulation(ws)\n\n# Función para iniciar la simulación de eventos\ndef start_event_simulation(ws):\n    global data_thread, running\n    if data_thread is None or not data_thread.is_alive():\n        running = True\n        data_thread = threading.Thread(target=simulate_events, args=(ws,))\n        data_thread.daemon = True\n        data_thread.start()\n        print("Iniciada simulación de eventos")\n\n# Función para detener la simulación de eventos\ndef stop_periodic_data():\n    global running\n    running = False\n    print("Detenida simulación de eventos")\n`;
  } else if (connectionType === 'batch') {
    pythonCode += `    # Iniciar recolección y envío de lotes\n    start_batch_collection(ws)\n\n# Función para iniciar la recolección y envío de lotes\ndef start_batch_collection(ws):\n    global data_thread, running\n    if data_thread is None or not data_thread.is_alive():\n        running = True\n        data_thread = threading.Thread(target=collect_and_send_batch, args=(ws,))\n        data_thread.daemon = True\n        data_thread.start()\n        print("Iniciada recolección de datos en lotes")\n\n# Función para detener la recolección de lotes\ndef stop_periodic_data():\n    global running\n    running = False\n    print("Detenida recolección de datos en lotes")\n`;
  }

  // Finalizar el código Python
  pythonCode += `\n# Función para enviar datos manualmente\ndef send_data(data):\n    if not ws.sock or not ws.sock.connected:\n        print("WebSocket no conectado")\n        return False\n    \n    # Asegurarse de que los datos incluyan los campos requeridos\n    if isinstance(data, dict):\n        data.update({\n            "model_id": ${modelId},\n            "device_id": "${deviceId}",\n            "user_id": "${userId}",\n            "token": JWT_TOKEN\n        })\n    \n    # Crear mensaje de datos\n    data_message = {\n        "event": "data",\n        "data": data\n    }\n    \n    # Enviar datos\n    ws.send(json.dumps(data_message))\n    print("Datos enviados al servidor")\n    return True\n\n# Crear conexión WebSocket con encabezados de autenticación\nheaders = {"Authorization": f"Bearer {JWT_TOKEN}"}\nws = websocket.WebSocketApp(ws_url,\n                          header=headers,\n                          on_open=on_open,\n                          on_message=on_message,\n                          on_error=on_error,\n                          on_close=on_close)\n\n# Iniciar conexión en un bucle para reconectar automáticamente\ntry:\n    while True:\n        try:\n            ws.run_forever()\n            print("Intentando reconectar en 5 segundos...")\n            time.sleep(5)\n        except KeyboardInterrupt:\n            break\nfinally:\n    # Asegurarse de detener el envío periódico de datos al salir\n    stop_periodic_data()\n`;

  return pythonCode;
}

/**
 * Genera código JavaScript para conexión WebSocket
 */
function generateJavaScriptCode(deviceId, modelId, userId, jwtToken, connectionType, serverUrl, modelFields) {
  // Estructura base del código JavaScript
  let jsCode = `// Configuración de la conexión WebSocket\nconst wsUrl = "${serverUrl}";\n\n// Token JWT para autenticación\nconst JWT_TOKEN = "${jwtToken}";\n\n// Variables para controlar el envío de datos\nlet ws = null;\nlet isRunning = false;\nlet dataInterval = null;\n\n// Función para generar datos según el modelo seleccionado\nfunction generateData() {\n  return {\n    model_id: ${modelId},\n    device_id: "${deviceId}",\n    user_id: "${userId}",`;

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

  jsCode += `\n    token: JWT_TOKEN\n  };\n}\n\n`;

  // Agregar código específico según el tipo de conexión
  if (connectionType === 'periodic') {
    jsCode += `// Función para enviar datos periódicamente\nfunction startPeriodicData() {\n  if (dataInterval) {\n    clearInterval(dataInterval);\n  }\n  \n  isRunning = true;\n  dataInterval = setInterval(() => {\n    if (ws && ws.readyState === WebSocket.OPEN) {\n      // Generar datos\n      const data = generateData();\n      \n      // Crear mensaje de datos\n      const dataMessage = {\n        event: "data",\n        data: data\n      };\n      \n      // Enviar datos\n      ws.send(JSON.stringify(dataMessage));\n      console.log("Datos enviados al servidor");\n    }\n  }, 10000); // Enviar cada 10 segundos\n  \n  console.log("Iniciado envío periódico de datos");\n}\n\nfunction stopPeriodicData() {\n  isRunning = false;\n  if (dataInterval) {\n    clearInterval(dataInterval);\n    dataInterval = null;\n  }\n  console.log("Detenido envío periódico de datos");\n}\n`;
  } else if (connectionType === 'event') {
    jsCode += `// Función para simular eventos y enviar datos\nfunction startEventSimulation() {\n  if (dataInterval) {\n    clearInterval(dataInterval);\n  }\n  \n  isRunning = true;\n  simulateEvent();\n  \n  console.log("Iniciada simulación de eventos");\n}\n\nfunction simulateEvent() {\n  if (!isRunning) return;\n  \n  // Simular un evento aleatorio\n  const eventTypes = ["temperature_alert", "humidity_change", "pressure_drop", "level_critical"];\n  const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];\n  \n  // Generar datos basados en el evento\n  const data = generateData();\n  data.event_type = eventType;\n  \n  // Crear mensaje de datos\n  const dataMessage = {\n    event: "data_event",\n    data: data\n  };\n  \n  // Enviar datos solo si hay un evento\n  if (ws && ws.readyState === WebSocket.OPEN) {\n    ws.send(JSON.stringify(dataMessage));\n    console.log(`Evento ${eventType} enviado al servidor`);\n  }\n  \n  // Programar el próximo evento en un tiempo aleatorio (entre 5 y 30 segundos)\n  const nextEventTime = Math.floor(Math.random() * 25000) + 5000;\n  setTimeout(simulateEvent, nextEventTime);\n}\n\nfunction stopEventSimulation() {\n  isRunning = false;\n  console.log("Detenida simulación de eventos");\n}\n`;
  } else if (connectionType === 'batch') {
    jsCode += `// Variables para el manejo de lotes\nlet batchData = [];\nconst batchSize = 5;\n\n// Función para acumular datos en lotes y enviarlos\nfunction startBatchCollection() {\n  if (dataInterval) {\n    clearInterval(dataInterval);\n  }\n  \n  isRunning = true;\n  dataInterval = setInterval(() => {\n    // Generar y acumular datos\n    if (batchData.length < batchSize) {\n      batchData.push(generateData());\n      console.log(`Datos acumulados: ${batchData.length}/${batchSize}`);\n    }\n    \n    // Enviar el lote cuando alcance el tamaño deseado\n    if (batchData.length >= batchSize && ws && ws.readyState === WebSocket.OPEN) {\n      const batchMessage = {\n        event: "batch_data",\n        data: {\n          batch: batchData,\n          timestamp: Date.now(),\n          device_id: "${deviceId}",\n          model_id: ${modelId},\n          user_id: "${userId}",\n          token: JWT_TOKEN\n        }\n      };\n      \n      ws.send(JSON.stringify(batchMessage));\n      console.log(`Lote de ${batchData.length} datos enviado al servidor`);\n      batchData = []; // Reiniciar el lote\n    }\n  }, 5000); // Recolectar datos cada 5 segundos\n  \n  console.log("Iniciada recolección de datos en lotes");\n}\n\nfunction stopBatchCollection() {\n  isRunning = false;\n  if (dataInterval) {\n    clearInterval(dataInterval);\n    dataInterval = null;\n  }\n  batchData = [];\n  console.log("Detenida recolección de datos en lotes");\n}\n`;
  }

  // Agregar funciones comunes para todos los tipos de conexión
  jsCode += `\n// Función para manejar mensajes recibidos\nfunction handleMessage(event) {\n  try {\n    const data = JSON.parse(event.data);\n    console.log("Mensaje recibido:", data);\n    \n    // Verificar tipo de evento\n    if (data.event) {\n      if (data.event === 'subscription_confirmed') {\n        console.log("Suscripción confirmada:", data.data);\n      } else if (data.event === 'data_received') {\n        console.log("Datos recibidos por el servidor:", data.data);\n      } else if (data.event === 'data_event') {\n        console.log("Nuevo evento de datos:", data.data);\n      } else if (data.event === 'error') {\n        console.error("Error del servidor:", data.data);\n      }\n    }\n  } catch (error) {\n    console.error("Error al procesar mensaje:", error);\n  }\n}\n\n// Función para iniciar la conexión WebSocket\nfunction connectWebSocket() {\n  // Cerrar conexión existente si hay alguna\n  if (ws) {\n    ws.close();\n  }\n  \n  // Crear nueva conexión WebSocket\n  ws = new WebSocket(wsUrl);\n  \n  // Configurar manejadores de eventos\n  ws.onopen = function() {\n    console.log("Conexión establecida");\n    \n    // Suscribirse a eventos del dispositivo y modelo\n    const subscribeMessage = {\n      event: "subscribe",\n      data: {\n        device_id: "${deviceId}",\n        model_id: ${modelId},\n        user_id: "${userId}",\n        token: JWT_TOKEN\n      }\n    };\n    ws.send(JSON.stringify(subscribeMessage));\n    console.log("Solicitud de suscripción enviada");\n    \n    // Iniciar envío de datos según el modo seleccionado\n`;

  // Agregar código específico para iniciar el envío según el tipo de conexión
  if (connectionType === 'periodic') {
    jsCode += `    // Iniciar envío periódico de datos\n    startPeriodicData();\n`;
  } else if (connectionType === 'event') {
    jsCode += `    // Iniciar simulación de eventos\n    startEventSimulation();\n`;
  } else if (connectionType === 'batch') {
    jsCode += `    // Iniciar recolección y envío de lotes\n    startBatchCollection();\n`;
  }

  jsCode += `  };\n  \n  ws.onmessage = handleMessage;\n  \n  ws.onerror = function(error) {\n    console.error("Error en la conexión:", error);\n  };\n  \n  ws.onclose = function(event) {\n    console.log("Conexión cerrada");\n    \n    // Detener el envío de datos\n`;

  // Agregar código específico para detener el envío según el tipo de conexión
  if (connectionType === 'periodic') {
    jsCode += `    stopPeriodicData();\n`;
  } else if (connectionType === 'event') {
    jsCode += `    stopEventSimulation();\n`;
  } else if (connectionType === 'batch') {
    jsCode += `    stopBatchCollection();\n`;
  }

  jsCode += `    // Intentar reconectar después de un tiempo\n    setTimeout(connectWebSocket, 5000);\n  };\n}\n\n// Función para enviar datos manualmente\nfunction sendData(data) {\n  if (!ws || ws.readyState !== WebSocket.OPEN) {\n    console.error("WebSocket no conectado");\n    return false;\n  }\n  \n  // Asegurarse de que los datos incluyan los campos requeridos\n  if (typeof data === 'object') {\n    data = {\n      ...data,\n      model_id: ${modelId},\n      device_id: "${deviceId}",\n      user_id: "${userId}",\n      token: JWT_TOKEN\n    };\n  }\n  \n  // Crear mensaje de datos\n  const dataMessage = {\n    event: "data",\n    data: data\n  };\n  \n  // Enviar datos\n  ws.send(JSON.stringify(dataMessage));\n  console.log("Datos enviados al servidor");\n  return true;\n}\n\n// Iniciar la conexión WebSocket\nconnectWebSocket();\n\n// Manejar cierre de la página\nwindow.addEventListener('beforeunload', function() {\n  // Detener el envío de datos\n`;

  // Agregar código específico para detener el envío según el tipo de conexión
  if (connectionType === 'periodic') {
    jsCode += `  stopPeriodicData();\n`;
  } else if (connectionType === 'event') {
    jsCode += `  stopEventSimulation();\n`;
  } else if (connectionType === 'batch') {
    jsCode += `  stopBatchCollection();\n`;
  }

  jsCode += `  // Cerrar conexión WebSocket\n  if (ws) {\n    ws.close();\n  }\n});\n`;

  return jsCode;
}

export default websocketCodeController;