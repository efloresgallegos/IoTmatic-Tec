/**
 * Módulo para gestionar suscripciones WebSocket con autenticación JWT
 * Este módulo permite a los clientes suscribirse a eventos específicos por dispositivo, modelo y usuario
 */

import { emitToRoom, addToRoom } from './webSocket.server.js';
import jwt from 'jwt-simple';
import 'dotenv/config';
import dataService from '../services/data.service.js';
<<<<<<< HEAD

const createData = dataService.createData;
=======
>>>>>>> d5400d713f195b3cff70d4a82df972cab384402c

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
 * Valida que un objeto de datos contenga los campos obligatorios
 * @param {Object} data - Datos a validar
 * @param {Object} tokenData - Datos del token para completar campos faltantes
 * @returns {Object} Objeto con los datos validados y campos obligatorios
 */
const validateAndCompleteData = (data, tokenData) => {
  const validatedData = { ...data };
  
  // Verificar y completar user_id si falta
  if (!validatedData.user_id) {
    if (tokenData && tokenData.user) {
      validatedData.user_id = tokenData.user;
      console.log('Campo user_id añadido automáticamente desde el token');
    } else {
      throw new Error('Campo obligatorio faltante: user_id');
    }
  }
  
  // Verificar y completar device_id si falta
  if (!validatedData.device_id) {
    if (tokenData && tokenData.device) {
      validatedData.device_id = tokenData.device;
      console.log('Campo device_id añadido automáticamente desde el token');
    } else {
      throw new Error('Campo obligatorio faltante: device_id');
    }
  }
  
  // Verificar y completar model_id si falta
  if (!validatedData.model_id) {
    if (tokenData && tokenData.model) {
      validatedData.model_id = tokenData.model;
      console.log('Campo model_id añadido automáticamente desde el token');
    } else {
      throw new Error('Campo obligatorio faltante: model_id');
    }
  }
  
  return validatedData;
};

/**
 * Emite un evento de datos a todos los canales relevantes
 * @param {Object} data - Datos a emitir
 * @param {string} data.token - Token JWT para autenticación
 * @param {*} data.payload - Datos adicionales del evento (opcional)
 * @param {string} data.device_id - ID del dispositivo (opcional si está en el token)
 * @param {string} data.model_id - ID del modelo (opcional si está en el token)
 * @param {string} data.user_id - ID del usuario (opcional si está en el token)
 */
const emitDataEvent = async (data) => {
  try {
    if (!data) {
      console.error('No se proporcionaron datos para el evento');
      return false;
    }
    
    // Extraer token y verificarlo
    const { token } = data;
    if (!token) {
      console.error('No se proporcionó token para autenticar el evento de datos');
      return false;
    }
    
    // Verificar token
    const tokenData = verifyToken(token);
    if (!tokenData) {
      console.error('Token inválido o expirado al emitir evento');
      return false;
    }
    
    // Preparamos los datos a procesar, manejando diferentes estructuras posibles
    let processData = { ...data };
    
    // Si los datos vienen dentro de un campo payload, los extraemos
    if (data.payload) {
      // Si payload es un objeto, extraemos sus propiedades
      if (typeof data.payload === 'object' && data.payload !== null) {
        processData = { ...data, ...data.payload };
        // Eliminamos el payload para evitar duplicación
        delete processData.payload;
      }
    }
    
    // Convertir IDs a tipos correctos para comparación
    const deviceIdToken = String(tokenData.device);
    const modelIdToken = Number(tokenData.model);
    const userIdToken = String(tokenData.user);
    
    // Validar y preparar los campos obligatorios
    let deviceId = processData.device_id;
    let modelId = processData.model_id;
    let userId = processData.user_id;
    
    // Completar campos faltantes desde el token si es necesario
    if (!deviceId && tokenData.device) {
      deviceId = tokenData.device;
      console.log('Campo device_id añadido automáticamente desde el token');
    }
    
    if (!modelId && tokenData.model) {
      modelId = tokenData.model;
      console.log('Campo model_id añadido automáticamente desde el token');
    }
    
    if (!userId && tokenData.user) {
      userId = tokenData.user;
      console.log('Campo user_id añadido automáticamente desde el token');
    }
    
    // Convertir a tipos consistentes para comparación
    deviceId = String(deviceId);
    modelId = Number(modelId);
    userId = String(userId);
    
    // Verificar que los IDs coincidan con los del token o sean compatibles
    console.log(`Comparando IDs - Token: ${deviceIdToken}(${typeof deviceIdToken}), Enviado: ${deviceId}(${typeof deviceId})`);
    
    if (deviceIdToken !== deviceId) {
      console.error(`Error de validación: device_id enviado (${deviceId}) no coincide con el token (${deviceIdToken})`);
      return false;
    }
    
    if (modelIdToken !== modelId && modelIdToken !== '*') {
      console.error(`Error de validación: model_id enviado (${modelId}) no coincide con el token (${modelIdToken})`);
      return false;
    }
    
    if (userIdToken !== userId && userIdToken !== '*') {
      console.error(`Error de validación: user_id enviado (${userId}) no coincide con el token (${userIdToken})`);
      return false;
    }
    
    // Quitar los campos de control y autenticación para el evento
    const { token: _, ...restData } = processData;
    
    // Crear objeto de datos para la emisión y almacenamiento
    const eventData = {
      device_id: deviceId,
      model_id: modelId,
      user_id: userId,
      timestamp: restData.timestamp || new Date().toISOString(),
      ...restData
    };

    // Preparar datos para la base de datos
    // Excluir campos que no deben ir a la base de datos y que podrían causar problemas
    const { timestamp, firmware_version, token: _, createdAt, updatedAt, ...cleanPayload } = payload;
    const deviceData = {
      ...cleanPayload,
      device_id: Number(device_id),
      model_id: Number(model_id),
      user_id: Number(user_id)
    };
    
    // Crear registro en la base de datos
    try {
      await dataService.createData(deviceData);
    } catch (error) {
      console.error('Error al crear registro en la base de datos:', error);
    }
    
    // Guardar los datos en la base de datos
    try {
      await createData(eventData);
      console.log('Datos guardados en la base de datos correctamente');
    } catch (dbError) {
      console.error('Error al guardar datos en la base de datos:', dbError);
      // No retornamos false aquí para permitir que el evento se emita aunque falle el guardado
    }
    
    // Emitir a todos los canales relevantes
    if (deviceId) {
      emitToRoom(`device_${deviceId}`, 'data_event', eventData);
    }
    
    if (modelId) {
      emitToRoom(`model_${modelId}`, 'data_event', eventData);
    }
    
    if (userId) {
      emitToRoom(`user_${userId}`, 'data_event', eventData);
    }
    
    if (deviceId && modelId) {
      emitToRoom(`device_${deviceId}_model_${modelId}`, 'data_event', eventData);
    }
    
    console.log(`Evento de datos emitido para dispositivo ${deviceId}, modelo ${modelId}, usuario ${userId}`);
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
const processSubscriptionMessage = async (ws, message) => {
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
        // Verificar si tenemos un objeto de datos válido
        if (!data) {
          ws.send(JSON.stringify({
            event: 'error',
            data: { message: 'No se proporcionaron datos para el evento' }
          }));
          return;
        }
        
        // Si el mensaje no tiene token pero el WebSocket está autenticado, usar ese token
        if (!data.token && ws.originalToken) {
          data.token = ws.originalToken;
          console.log('Token añadido automáticamente desde la conexión WebSocket');
        }
        
        // Intentar completar campos obligatorios desde el WebSocket si están faltantes
        if (ws.tokenData) {
          if (!data.device_id && ws.tokenData.device) {
            data.device_id = ws.tokenData.device;
            console.log('Campo device_id añadido automáticamente desde la conexión WebSocket');
          }
          
          if (!data.model_id && ws.tokenData.model) {
            data.model_id = ws.tokenData.model;
            console.log('Campo model_id añadido automáticamente desde la conexión WebSocket');
          }
          
          if (!data.user_id && ws.tokenData.user) {
            data.user_id = ws.tokenData.user;
            console.log('Campo user_id añadido automáticamente desde la conexión WebSocket');
          }
        }
        
        // Procesar datos recibidos y emitirlos a los suscriptores
        const success = await emitDataEvent(data);
        
        // Confirmar recepción
        ws.send(JSON.stringify({
          event: success ? 'data_received' : 'data_error',
          data: { 
            success, 
            timestamp: new Date().toISOString(),
            message: success ? 'Datos procesados correctamente' : 'Error al procesar los datos, verifique los campos obligatorios y el token'
          }
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
  verifyToken,
  validateAndCompleteData
};