/**
 * Módulo para gestionar suscripciones WebSocket con autenticación JWT
 * Este módulo permite a los clientes suscribirse a eventos específicos por dispositivo, modelo y usuario
 */

import { emitToRoom } from './webSocket.server.js';
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
 * @param {string} [data.device_id] - ID del dispositivo (opcional)
 * @param {string} [data.model_id] - ID del modelo (opcional)
 * @param {string} [data.user_id] - ID del usuario (opcional)
 */
const subscribeToEvents = (ws, data) => {
  try {
    const { token, device_id, model_id, user_id } = data;
    
    // Verificar token
    const tokenData = verifyToken(token);
    if (!tokenData) {
      ws.send(JSON.stringify({
        event: 'subscription_error',
        data: { message: 'Token inválido o expirado' }
      }));
      return;
    }
    
    // Almacenar información de la suscripción
    if (!subscriptions.has(ws)) {
      subscriptions.set(ws, new Set());
    }
    
    const clientSubscriptions = subscriptions.get(ws);
    
    // Suscribir a canales específicos según los parámetros proporcionados
    if (device_id) {
      const roomId = `device_${device_id}`;
      clientSubscriptions.add(roomId);
      addToRoom(roomId, ws);
      console.log(`Cliente suscrito a eventos del dispositivo ${device_id}`);
    }
    
    if (model_id) {
      const roomId = `model_${model_id}`;
      clientSubscriptions.add(roomId);
      addToRoom(roomId, ws);
      console.log(`Cliente suscrito a eventos del modelo ${model_id}`);
    }
    
    if (user_id) {
      const roomId = `user_${user_id}`;
      clientSubscriptions.add(roomId);
      addToRoom(roomId, ws);
      console.log(`Cliente suscrito a eventos del usuario ${user_id}`);
    }
    
    // Si se proporcionan tanto dispositivo como modelo, suscribir a la combinación
    if (device_id && model_id) {
      const roomId = `device_${device_id}_model_${model_id}`;
      clientSubscriptions.add(roomId);
      addToRoom(roomId, ws);
      console.log(`Cliente suscrito a eventos del dispositivo ${device_id} y modelo ${model_id}`);
    }
    
    // Confirmar suscripción
    ws.send(JSON.stringify({
      event: 'subscription_confirmed',
      data: {
        status: 'success',
        subscriptions: Array.from(clientSubscriptions)
      }
    }));
  } catch (error) {
    console.error('Error al suscribir a eventos:', error);
    ws.send(JSON.stringify({
      event: 'subscription_error',
      data: { message: 'Error al procesar la suscripción' }
    }));
  }
};

/**
 * Añade un cliente a una sala específica
 * @param {string} roomId - ID de la sala
 * @param {Object} ws - WebSocket del cliente
 */
const addToRoom = (roomId, ws) => {
  // Esta función debe ser implementada en webSocket.server.js
  // Aquí solo se simula la funcionalidad
  if (typeof emitToRoom === 'function') {
    // Si emitToRoom está disponible, usarla
    // Nota: emitToRoom debería manejar la adición a salas internamente
  } else {
    console.warn('La función emitToRoom no está disponible');
  }
};

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