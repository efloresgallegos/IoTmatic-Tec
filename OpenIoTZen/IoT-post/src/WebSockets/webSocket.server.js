import { WebSocketServer } from 'ws';
import { subscribeToGraphUpdates } from './graph.socket.js';
import { subscribeToDeviceStatus, emitDeviceStatusUpdate } from './device.socket.js';
import { processSubscriptionMessage, unsubscribeFromAllEvents } from './subscription.socket.js';
import { verifyToken } from './subscription.socket.js';
import connectionsService from '../services/connections.service.js';
import url from 'url';
import querystring from 'querystring';

const rooms = new Map();

function setupWebSocketServer(wss) {
  wss.on('connection', (ws, req) => {
    console.log('Nueva conexión WebSocket');
    
    // Extraer token de múltiples fuentes (encabezados, query params, protocolo)
    let token = null;
    
    // Inicialmente asumimos que no es un dispositivo IoT
    ws.isIoTDevice = false;
    
    // Analizar la URL para parámetros de consulta
    const parsedUrl = url.parse(req.url || '');
    const queryParams = querystring.parse(parsedUrl.query || '');
    
    // 1. Verificar en la URL como parámetro query
    if (queryParams.token) {
      token = queryParams.token;
      console.log('Token extraído de parámetros de URL');
    }
    
    // 2. Verificar en los headers de autorización
    if (!token && req.headers['authorization']) {
      const authHeader = req.headers['authorization'];
      
      // Detectar si es un dispositivo IoT o frontend basado en el formato del header
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
        ws.isIoTDevice = false; // Es frontend porque usa "Bearer "
        console.log('Token extraído de header Authorization con prefijo Bearer (frontend)');
      } else {
        // Si no tiene prefijo Bearer, es un dispositivo IoT
        token = authHeader;
        ws.isIoTDevice = true; // Es IoT porque no usa "Bearer "
        console.log('Token extraído de header Authorization sin prefijo Bearer (dispositivo IoT)');
      }
    }
    
    // 3. Verificar en el protocolo WebSocket (para compatibilidad con clientes existentes)
    if (!token && req.headers['sec-websocket-protocol']) {
      const protocols = req.headers['sec-websocket-protocol'].split(', ');
      // El primer elemento puede ser el nombre del protocolo, intentamos con los demás
      for (const protocol of protocols) {
        if (protocol !== 'jwt' && protocol.length > 10) {
          token = protocol;
          // Asumimos que es un dispositivo IoT si usa el protocolo WebSocket para autenticación
          ws.isIoTDevice = true;
          console.log('Token extraído de sec-websocket-protocol (posible dispositivo IoT)');
          break;
        }
      }
    }
    
    // 4. Verificar en el mensaje inicial (se procesará luego cuando el cliente envíe un mensaje auth)
    ws.pendingAuthentication = !token;
    
    if (!token) {
      // Para dispositivos IoT, rechazamos la conexión si no hay token inmediato
      if (ws.isIoTDevice) {
        console.log('Conexión IoT rechazada: No se proporcionó token de autenticación');
        ws.send(JSON.stringify({
          event: 'auth_error',
          data: { message: 'Dispositivo IoT requiere token de autenticación inmediato' }
        }));
        ws.close(1008, 'Dispositivo IoT requiere token de autenticación inmediato');
        return;
      }
      
      // Para clientes normales, permitimos autenticación posterior
      console.log('Advertencia: No se proporcionó token de autenticación inmediato');
      ws.send(JSON.stringify({
        event: 'auth_required',
        data: { message: 'Se requiere autenticación. Envíe un mensaje con event: "auth" y data: {token: "su-token"}' }
      }));
      ws.pendingAuthentication = true;
    } else {
      // Procesar autenticación con el token disponible
      authenticateClient(ws, token, req);
    }
    
    ws.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        console.log(`Mensaje recibido: ${message}`);
        
        // Verificar que el mensaje tenga un evento
        if (!parsedMessage.event) {
          ws.send(JSON.stringify({
            event: 'error',
            data: { message: 'Formato de mensaje inválido: se requiere un evento' }
          }));
          return;
        }
        
        // Manejar autenticación pendiente
        if (ws.pendingAuthentication) {
          if (parsedMessage.event === 'auth') {
            if (parsedMessage.data && parsedMessage.data.token) {
              // Si el mensaje incluye un campo iot_device explícito
              if (parsedMessage.data.iot_device) {
                ws.isIoTDevice = true;
              }
              
              // Si el token incluye "Bearer ", es del frontend y no es un dispositivo IoT
              if (parsedMessage.data.token.startsWith('Bearer ')) {
                ws.isIoTDevice = false;
                // Procesar la autenticación con el token recibido
                authenticateClient(ws, parsedMessage.data.token.slice(7), req);
              } else {
                // Sin "Bearer", asumimos que es un dispositivo IoT
                ws.isIoTDevice = true;
                // Procesar la autenticación con el token recibido
                authenticateClient(ws, parsedMessage.data.token, req);
              }
              return;
            } else {
              ws.send(JSON.stringify({
                event: 'auth_error',
                data: { message: 'Token no proporcionado en el mensaje de autenticación' }
              }));
              return;
            }
          } else {
            // Rechazar otros mensajes sin autenticación previa
            ws.send(JSON.stringify({
              event: 'auth_required',
              data: { message: 'Se requiere autenticación. Envíe un mensaje con event: "auth" y data: {token: "su-token"}' }
            }));
            return;
          }
        }
        
        // Para dispositivos IoT, permitir suscripciones explícitas pero informar que ya están suscritos
        if (parsedMessage.event === 'subscribe') {
          if (ws.isIoTDevice) {
            console.log('Dispositivo IoT ya suscrito automáticamente, reforzando suscripción');
            // Reforzar la suscripción automática para dispositivos IoT
            if (ws.tokenData) {
              const subscriptionData = {
                device_id: ws.tokenData.device,
                model_id: ws.tokenData.model,
                user_id: ws.tokenData.user,
                token: parsedMessage.data?.token || ws.originalToken
              };
              
              processSubscriptionMessage(ws, {
                event: 'subscribe',
                data: subscriptionData
              });
            }
          } else {
            // Para clientes normales, procesamos la suscripción normalmente
            processSubscriptionMessage(ws, parsedMessage);
          }
          return;
        }
        
        // Para otros mensajes, verificar que el cliente esté suscrito (debería estarlo siempre)
        if (!ws.isSubscribed) {
          ws.send(JSON.stringify({
            event: 'error',
            data: { message: 'No estás suscrito. Por favor, suscríbete primero.' }
          }));
          return;
        }
        
        // Manejar diferentes tipos de mensajes
        switch (parsedMessage.event) {
          case 'subscribe_to_device_status':
            subscribeToDeviceStatus(ws, parsedMessage.data);
            break;
          case 'unsubscribe':
            unsubscribeFromAllEvents(ws);
            break;
          case 'data':
            // Usar el nuevo sistema de suscripciones
            processSubscriptionMessage(ws, parsedMessage);
            break;
          case 'request_device_status':
            // Enviar lista de dispositivos conectados bajo demanda
            const activeConnections = connectionsService.getConnections({ status: 'online' });
            if (activeConnections && activeConnections.length > 0) {
              ws.send(JSON.stringify({
                event: 'device_status_update',
                data: {
                  devices: activeConnections.map(conn => ({
                    device_id: conn.device_id,
                    status: 'connected',
                    name: conn.name || `Dispositivo ${conn.device_id}`,
                    model: {
                      id: conn.model_id,
                      name: conn.model_name || `Modelo ${conn.model_id}`
                    },
                    connected_since: conn.connected_at
                  }))
                }
              }));
            }
            break;
          default:
            console.log(`Tipo de mensaje no manejado: ${parsedMessage.event}`);
        }
      } catch (error) {
        console.error('Error al procesar mensaje:', error);
      }
    });

    ws.on('close', () => {
      console.log('Conexión WebSocket cerrada');
      // Limpiar la sala cuando el usuario se desconecta
      for (const [roomId, clients] of rooms.entries()) {
        if (clients.has(ws)) {
          clients.delete(ws);
          if (clients.size === 0) {
            rooms.delete(roomId);
          }
        }
      }
      
      // Registrar la desconexión en el servicio de conexiones si hay datos de token
      if (ws.tokenData) {
        const deviceId = ws.tokenData.device;
        connectionsService.registerDisconnection(deviceId);
        
        // Emitir evento de estado de dispositivo (desconectado) para notificar a otros clientes
        setTimeout(() => {
          emitDeviceStatusUpdate({
            device_id: deviceId,
            status: 'disconnected'
          });
        }, 500);
      }
      
      // Limpiar suscripciones
      unsubscribeFromAllEvents(ws);
    });
  });
}

/**
 * Función para autenticar un cliente WebSocket con un token
 * @param {Object} ws - WebSocket del cliente
 * @param {string} token - Token JWT
 * @param {Object} req - Objeto de solicitud HTTP original
 */
function authenticateClient(ws, token, req) {
  // Guardar el token original para uso futuro
  ws.originalToken = token;
  
  // Verificar token
  const tokenData = verifyToken(token);
  if (tokenData) {
    console.log(`Cliente autenticado: usuario ${tokenData.user}, dispositivo ${tokenData.device}, modelo ${tokenData.model}`);
    ws.tokenData = tokenData; // Almacenar datos del token en el objeto WebSocket
    
    // Eliminar estado de autenticación pendiente
    ws.pendingAuthentication = false;
    
    // Verificar si es un token de tipo IoT basado en su contenido si aún no está determinado
    if (!ws.isIoTDevice && tokenData.device && tokenData.role === 'device') {
      console.log('Detectado token de dispositivo IoT por su contenido');
      ws.isIoTDevice = true;
    }
    
    // Determinar el tipo de cliente basado en flags
    const clientType = ws.isIoTDevice ? 'IoT Device' : 'Frontend User';
    console.log(`Tipo de cliente: ${clientType}`);
    
    // Para dispositivos IoT, realizamos suscripción automática siempre
    if (ws.isIoTDevice) {
      const subscriptionData = {
        device_id: tokenData.device,
        model_id: tokenData.model,
        user_id: tokenData.user,
        token: token
      };
      
      // Llamar a la función de suscripción directamente
      processSubscriptionMessage(ws, {
        event: 'subscribe',
        data: subscriptionData
      });
      
      // Marcar como suscrito
      ws.isSubscribed = true;
      console.log(`Suscripción automática realizada para dispositivo IoT ${tokenData.device}, modelo ${tokenData.model}`);
    } else {
      // Para usuarios frontend, solo informamos que están autenticados
      console.log(`Usuario frontend autenticado: ${tokenData.user}`);
      // No marcamos como suscrito, el frontend debe enviar un mensaje explícito de suscripción
    }
    
    // Enviar confirmación de autenticación exitosa
    ws.send(JSON.stringify({
      event: 'auth_success',
      data: { 
        message: 'Autenticación exitosa',
        user_id: tokenData.user,
        client_type: clientType,
        auto_subscribed: ws.isIoTDevice
      }
    }));
    
    // Registrar la conexión en el servicio solo para dispositivos IoT
    if (ws.isIoTDevice) {
      const connection = connectionsService.registerConnection({
        device_id: tokenData.device,
        user_id: tokenData.user,
        model_id: tokenData.model,
        ip: req.socket.remoteAddress,
        connected_since: new Date().toISOString()
      });
      
      // Emitir evento de estado de dispositivo para notificar a otros clientes
      if (connection) {
        // Usar timeout para asegurar que otros clientes ya estén suscritos
        setTimeout(() => {
          emitDeviceStatusUpdate({
            device_id: tokenData.device,
            status: 'connected',
            name: connection.name || `Dispositivo ${tokenData.device}`,
            model: {
              id: tokenData.model,
              name: connection.model_name || `Modelo ${tokenData.model}`
            },
            connected_since: connection.connected_at
          });
        }, 500);
      }
    }
    
    // Enviar lista de dispositivos conectados al nuevo cliente (solo para frontend)
    if (!ws.isIoTDevice) {
      const connectedDevices = connectionsService.getConnections({ status: 'online' });
      if (connectedDevices && connectedDevices.length > 0) {
        ws.send(JSON.stringify({
          event: 'device_status_initial',
          data: {
            devices: connectedDevices.map(conn => ({
              device_id: conn.device_id,
              status: 'connected',
              name: conn.name || `Dispositivo ${conn.device_id}`,
              model: {
                id: conn.model_id,
                name: conn.model_name || `Modelo ${conn.model_id}`
              },
              connected_since: conn.connected_at
            }))
          }
        }));
      }
    }
  } else {
    // Rechazar conexión con token inválido
    console.log('Conexión rechazada: Token inválido o expirado');
    ws.send(JSON.stringify({
      event: 'auth_error',
      data: { message: 'Token inválido o expirado' }
    }));
    ws.close(1008, 'Token inválido o expirado');
  }
}

function emitToRoom(roomId, event, data) {
  const clients = rooms.get(roomId);
  if (clients) {
    clients.forEach(client => {
      if (client.readyState === 1) { // 1 es el valor de WebSocket.OPEN
        client.send(JSON.stringify({ event, data }));
      }
    });
  }
}

function addToRoom(roomId, ws) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  rooms.get(roomId).add(ws);
}

function emitNewAlert(roomId, alertData) {
  const clients = rooms.get(roomId);
  if (clients) {
    clients.forEach(client => {
      if (client.readyState === 1) { // 1 es el valor de WebSocket.OPEN
        client.send(JSON.stringify({ event: 'new_alert', data: alertData }));
      }
    });
  }
}

function emitNewData(roomId, data) {
  const clients = rooms.get(roomId);
  if (clients) {
    clients.forEach(client => {
      if (client.readyState === 1) { // 1 es el valor de WebSocket.OPEN
        client.send(JSON.stringify({ event: 'new_data', data }));
      }
    });
  }
}

export { setupWebSocketServer, emitToRoom, addToRoom, emitNewAlert, emitNewData };