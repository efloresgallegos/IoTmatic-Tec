import { emitToRoom } from './webSocket.server.js';
import graphService from '../services/graph.service.js';

/**
 * Emite actualizaciones de datos de gráficos a los clientes conectados
 * @param {Object} data - Datos del dispositivo y modelo
 * @param {number} data.device_id - ID del dispositivo
 * @param {number} data.model_id - ID del modelo
 * @param {Object} data.newData - Nuevos datos recibidos
 */
const emitGraphDataUpdate = async (data) => {
  try {
    const { device_id, model_id, newData } = data;
    
    if (!device_id || !model_id || !newData) {
      console.error('Datos incompletos para actualización de gráficos');
      return;
    }
    
    // Obtener campos graficables para este modelo
    const graphableFields = await graphService.getGraphableFields(model_id);
    
    // Si no hay campos graficables, no es necesario emitir actualizaciones
    if (!graphableFields || graphableFields.length === 0) {
      return;
    }
    
    // Crear un objeto con solo los campos graficables
    const graphData = {};
    graphableFields.forEach(field => {
      if (newData[field] !== undefined) {
        graphData[field] = newData[field];
      }
    });
    
    // Añadir timestamp
    graphData.timestamp = new Date().toISOString();
    
    // Emitir a las salas específicas
    emitToRoom(`device_${device_id}`, 'graph_data_update', {
      device_id,
      model_id,
      data: graphData
    });
    
    emitToRoom(`model_${model_id}`, 'graph_data_update', {
      device_id,
      model_id,
      data: graphData
    });
    
    console.log(`Actualización de gráficos emitida para dispositivo ${device_id}, modelo ${model_id}`);
  } catch (error) {
    console.error('Error al emitir actualización de gráficos:', error);
  }
};

/**
 * Registra un cliente para recibir actualizaciones de gráficos
 * @param {Object} socket - Socket del cliente
 * @param {Object} data - Datos de suscripción
 * @param {number} data.device_id - ID del dispositivo (opcional)
 * @param {number} data.model_id - ID del modelo (opcional)
 */
const subscribeToGraphUpdates = (socket, data) => {
  try {
    const { device_id, model_id } = data;
    
    if (device_id) {
      socket.join(`device_${device_id}`);
      console.log(`Cliente ${socket.id} suscrito a actualizaciones de gráficos del dispositivo ${device_id}`);
    }
    
    if (model_id) {
      socket.join(`model_${model_id}`);
      console.log(`Cliente ${socket.id} suscrito a actualizaciones de gráficos del modelo ${model_id}`);
    }
    
    // Confirmar suscripción
    socket.emit('graph_subscription_confirmed', {
      status: 'success',
      subscriptions: {
        device_id,
        model_id
      }
    });
  } catch (error) {
    console.error('Error al suscribir a actualizaciones de gráficos:', error);
    socket.emit('graph_subscription_confirmed', {
      status: 'error',
      message: error.message
    });
  }
};

export {
  emitGraphDataUpdate,
  subscribeToGraphUpdates
};