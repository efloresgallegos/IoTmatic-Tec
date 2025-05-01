/**
 * Módulo para gestionar suscripciones WebSocket con autenticación JWT
 * Este módulo permite a los clientes suscribirse a eventos específicos por dispositivo, modelo y usuario
 */

import { emitToRoom, addToRoom } from './webSocket.server.js';
import jwt from 'jwt-simple';
import 'dotenv/config';

// Mapa para almacenar las suscripciones activas
const subscriptions = new Map();

// Clave secreta para verificar tokens JWT
const secret = process.env.SECRET_JWT || '';

/**
 * Verifica la validez de un token JWT
 * @param {string} token - Token JWT a verificar
 * @returns {Object|null} - Datos decodificados del token o null si es inválido
 */
const verifyToken = (token) => {
  try {
    if (!token) return null;
    
    // Eliminar 'Bearer ' si está presente
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }
    
    const decoded = jwt.decode(token, secret);
    
    // Verificar si el token ha expirado
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      console.log('Token expirado');
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Error al verificar token:', error.message);
    return null;
  }
};

/**
 * Suscribe un cliente a eventos específicos basados en dispositivo, modelo y usuario
 * @param {Object} ws - WebSocket del cliente
 * @param {Object} data - Datos de suscripción
 * @param {string} data.token - Token JWT para autenticación
 * @param {string} data.device_id - ID del dispositivo (obligatorio)
 * @param {string} data.model_id - ID del modelo (obligatorio)
 * @param {string} data.user_id - ID del usuario (obligatorio)
 */
const subscribeToEvents = (ws, data) => {
  try {
    const { token, device_id, model_id, user_id } = data;
    
    // Verificar que se proporcionaron todos los campos obligatorios
    if (!device_id || !model_id || !user_id) {
      // Si tenemos datos del token almacenados, podemos completar los campos faltantes
      if (ws.tokenData) {
        if (!device_id) data.device_id = ws.tokenData.device;
        if (!model_id) data.model_id = ws.tokenData.model;
        if (!user_id) data.user_id = ws.tokenData.user;
      } else {
        ws.send(JSON.stringify({
          event: 'subscription_error',
          data: { message: 'Se requieren device_id, model_id y user_id para la suscripción' }
        }));
        return;
      }
    }
    
    // Verificar token si no está ya en los datos de la conexión
    let tokenData = ws.tokenData;
    if (!tokenData && token) {
      tokenData = verifyToken(token);
      if (!tokenData) {
        ws.send(JSON.stringify({
          event: 'subscription_error',
          data: { message: 'Token inválido o expirado' }
        }));
        return;
      }
    }
    
    if (!tokenData) {
      ws.send(JSON.stringify({
        event: 'subscription_error',
        data: { message: 'No hay datos de autenticación válidos' }
      }));
      return;
    }
    
    // Usar los IDs que tenemos disponibles, priorizar los pasados explícitamente en la solicitud
    const deviceId = data.device_id || tokenData.device;
    const modelId = data.model_id || tokenData.model;
    const userId = data.user_id || tokenData.user;
    
    // Almacenar información de la suscripción
    if (!subscriptions.has(ws)) {
      subscriptions.set(ws, new Set());
    }
    
    const clientSubscriptions = subscriptions.get(ws);
    
    // Suscribir a canales específicos según los parámetros proporcionados
    const deviceRoomId = `device_${deviceId}`;
    clientSubscriptions.add(deviceRoomId);
    addToRoom(deviceRoomId, ws);
    console.log(`Cliente suscrito a eventos del dispositivo ${deviceId}`);
    
    const modelRoomId = `model_${modelId}`;
    clientSubscriptions.add(modelRoomId);
    addToRoom(modelRoomId, ws);
    console.log(`Cliente suscrito a eventos del modelo ${modelId}`);
    
    const userRoomId = `user_${userId}`;
    clientSubscriptions.add(userRoomId);
    addToRoom(userRoomId, ws);
    console.log(`Cliente suscrito a eventos del usuario ${userId}`);
    
    // Suscribir a la combinación de dispositivo y modelo
    const deviceModelRoomId = `device_${deviceId}_model_${modelId}`;
    clientSubscriptions.add(deviceModelRoomId);
    addToRoom(deviceModelRoomId, ws);
    console.log(`Cliente suscrito a eventos del dispositivo ${deviceId} y modelo ${modelId}`);
    
    // Suscribir a la combinación completa de dispositivo, modelo y usuario
    const fullRoomId = `device_${deviceId}_model_${modelId}_user_${userId}`;
    clientSubscriptions.add(fullRoomId);
    addToRoom(fullRoomId, ws);
    console.log(`Cliente suscrito a eventos del dispositivo ${deviceId}, modelo ${modelId} y usuario ${userId}`);
    
    // Confirmar suscripción
    ws.send(JSON.stringify({
      event: 'subscription_confirmed',
      data: {
        status: 'success',
        subscriptions: Array.from(clientSubscriptions),
        device_id: deviceId,
        model_id: modelId,
        user_id: userId
      }
    }));
  } catch (error) {
    console.error('Error al suscribir a eventos:', error);
    ws.send(JSON.stringify({
      event: 'subscription_error',
      data: { message: 'Error al procesar la suscripción' }
    }));
  }
}

/**
 * Elimina todas las suscripciones de un cliente
 * @param {Object} ws - WebSocket del cliente
 */
const unsubscribeFromAllEvents = (ws) => {
  if (subscriptions.has(ws)) {
    subscriptions.delete(ws);
    console.log('Cliente desuscrito de todos los eventos');
  }
};

/**
 * Emite un evento de datos a todos los canales relevantes
 * @param {Object} data - Datos a emitir
 * @param {string} data.device_id - ID del dispositivo
 * @param {string} data.model_id - ID del modelo
 * @param {string} data.user_id - ID del usuario
 * @param {string} data.token - Token JWT para autenticación
 * @param {Object} data.payload - Datos del evento
 */
const emitDataEvent = (data) => {
  try {
    const { device_id, model_id, user_id, token, ...payload } = data;
    
    // Verificar token
    const tokenData = verifyToken(token);
    if (!tokenData) {
      console.error('Token inválido o expirado al emitir evento');
      return;
    }
    
    // Verificar que los IDs coincidan con los del token
    if (tokenData.device !== device_id || tokenData.model !== Number(model_id) || tokenData.user !== user_id) {
      console.error('Los IDs no coinciden con los del token');
      return;
    }
    
    // Crear objeto de datos para la emisión
    const eventData = {
      device_id,
      model_id,
      user_id,
      timestamp: new Date().toISOString(),
      data: payload
    };
    
    // Emitir a todos los canales relevantes
    if (device_id) {
      emitToRoom(`device_${device_id}`, 'data_event', eventData);
    }
    
    if (model_id) {
      emitToRoom(`model_${model_id}`, 'data_event', eventData);
    }
    
    if (user_id) {
      emitToRoom(`user_${user_id}`, 'data_event', eventData);
    }
    
    if (device_id && model_id) {
      emitToRoom(`device_${device_id}_model_${model_id}`, 'data_event', eventData);
    }
    
    console.log(`Evento de datos emitido para dispositivo ${device_id}, modelo ${model_id}`);
    return true;
  } catch (error) {
    console.error('Error al emitir evento de datos:', error);
    return false;
  }
};

/**
 * Procesa un mensaje WebSocket relacionado con suscripciones
 * @param {Object} ws - WebSocket del cliente
 * @param {Object} message - Mensaje recibido
 */
const processSubscriptionMessage = (ws, message) => {
  try {
    const { event, data } = message;
    
    switch (event) {
      case 'subscribe':
        subscribeToEvents(ws, data);
        break;
      case 'unsubscribe':
        unsubscribeFromAllEvents(ws);
        break;
      case 'data':
        // Procesar datos recibidos y emitirlos a los suscriptores
        const success = emitDataEvent(data);
        // Confirmar recepción
        ws.send(JSON.stringify({
          event: 'data_received',
          data: { success, timestamp: new Date().toISOString() }
        }));
        break;
      default:
        console.log(`Tipo de evento de suscripción no manejado: ${event}`);
    }
  } catch (error) {
    console.error('Error al procesar mensaje de suscripción:', error);
    ws.send(JSON.stringify({
      event: 'error',
      data: { message: 'Error al procesar mensaje' }
    }));
  }
};

export {
  subscribeToEvents,
  unsubscribeFromAllEvents,
  emitDataEvent,
  processSubscriptionMessage,
  verifyToken
};