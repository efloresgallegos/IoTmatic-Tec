import { emitToRoom } from './webSocket.server.js';
import eventManager from './event.manager.js';

/**
 * Emite actualizaciones de estado de dispositivos a los clientes conectados
 * @param {Object} data - Datos del dispositivo
 * @param {number} data.device_id - ID del dispositivo
 * @param {string} data.status - Estado del dispositivo ('connected' o 'disconnected')
 * @param {Object} [data.model] - Información del modelo de datos conectado (opcional)
 */
const emitDeviceStatusUpdate = (data) => {
  try {
    const { device_id, status, model } = data;
    
    if (!device_id || !status) {
      console.error('Datos incompletos para actualización de estado de dispositivo');
      return;
    }
    
    // Crear objeto de datos para la emisión
    const statusData = {
      device_id,
      status,
      timestamp: new Date().toISOString()
    };
    
    // Añadir información del modelo si está disponible
    if (model) {
      statusData.model = model;
    }
    
    // Emitir a todos los clientes suscritos a actualizaciones de estado
    eventManager.emit('device_status_update', statusData);
    
    // Emitir a la sala específica del dispositivo
    emitToRoom(`device_${device_id}`, 'device_status_update', statusData);
    
    console.log(`Actualización de estado emitida para dispositivo ${device_id}: ${status}`);
  } catch (error) {
    console.error('Error al emitir actualización de estado de dispositivo:', error);
  }
};

/**
 * Emite actualizaciones de conexión de modelos de datos a los clientes conectados
 * @param {Object} data - Datos del modelo y dispositivo
 * @param {number} data.device_id - ID del dispositivo
 * @param {number} data.model_id - ID del modelo
 * @param {string} data.status - Estado de la conexión ('connected' o 'disconnected')
 */
const emitModelConnectionUpdate = (data) => {
  try {
    const { device_id, model_id, status } = data;
    
    if (!device_id || !model_id || !status) {
      console.error('Datos incompletos para actualización de conexión de modelo');
      return;
    }
    
    // Crear objeto de datos para la emisión
    const connectionData = {
      device_id,
      model_id,
      status,
      timestamp: new Date().toISOString()
    };
    
    // Emitir a todos los clientes suscritos a actualizaciones de modelos
    eventManager.emit('model_connection_update', connectionData);
    
    // Emitir a las salas específicas
    emitToRoom(`device_${device_id}`, 'model_connection_update', connectionData);
    emitToRoom(`model_${model_id}`, 'model_connection_update', connectionData);
    
    console.log(`Actualización de conexión de modelo emitida: dispositivo ${device_id}, modelo ${model_id}, estado ${status}`);
  } catch (error) {
    console.error('Error al emitir actualización de conexión de modelo:', error);
  }
};

/**
 * Registra un cliente para recibir actualizaciones de estado de dispositivos
 * @param {Object} socket - Socket del cliente
 * @param {Object} data - Datos de suscripción
 * @param {number} data.device_id - ID del dispositivo específico (opcional)
 */
const subscribeToDeviceStatus = (socket, data = {}) => {
  try {
    // Suscribir a actualizaciones generales de estado de dispositivos
    eventManager.subscribe('device_status_update', socket);
    
    // Si se especifica un dispositivo, suscribir a su sala específica
    if (data.device_id) {
      socket.join(`device_${data.device_id}`);
      console.log(`Cliente ${socket.id} suscrito a actualizaciones de estado del dispositivo ${data.device_id}`);
    }
    
    // Confirmar suscripción
    socket.emit('device_status_subscription_confirmed', {
      status: 'success',
      subscriptions: data
    });
  } catch (error) {
    console.error('Error al suscribir a actualizaciones de estado de dispositivos:', error);
    socket.emit('device_status_subscription_confirmed', {
      status: 'error',
      message: error.message
    });
  }
};

export {
  emitDeviceStatusUpdate,
  emitModelConnectionUpdate,
  subscribeToDeviceStatus
};