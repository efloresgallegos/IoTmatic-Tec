import { WebSocketServer } from 'ws';
import { subscribeToGraphUpdates } from './graph.socket.js';
import { subscribeToDeviceStatus } from './device.socket.js';
import { processSubscriptionMessage, unsubscribeFromAllEvents } from './subscription.socket.js';
import { verifyToken } from './subscription.socket.js';

const rooms = new Map();

function setupWebSocketServer(wss) {
  wss.on('connection', (ws, req) => {
    console.log('Nueva conexión WebSocket');
    
    // Extraer token de los headers si existe
    const authHeader = req.headers['authorization'] || req.headers['sec-websocket-protocol'];
    let token = null;
    
    if (authHeader) {
      // Extraer token del header de autorización
      token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
      
      // Verificar token
      const tokenData = verifyToken(token);
      if (tokenData) {
        console.log(`Cliente autenticado: usuario ${tokenData.user}, dispositivo ${tokenData.device}, modelo ${tokenData.model}`);
        ws.tokenData = tokenData; // Almacenar datos del token en el objeto WebSocket
      } else {
        console.log('Token inválido o expirado');
      }
    }

    ws.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        console.log(`Mensaje recibido: ${message}`);
        
        // Manejar diferentes tipos de mensajes
        switch (parsedMessage.event) {
          case 'subscribe_to_graph_updates':
            subscribeToGraphUpdates(ws, parsedMessage.data);
            break;
          case 'subscribe_to_device_status':
            subscribeToDeviceStatus(ws, parsedMessage.data);
            break;
          case 'subscribe':
          case 'unsubscribe':
          case 'data':
            // Usar el nuevo sistema de suscripciones
            processSubscriptionMessage(ws, parsedMessage);
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
      // Limpiar suscripciones
      unsubscribeFromAllEvents(ws);
    });
  });
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

export { setupWebSocketServer, emitToRoom, emitNewAlert, emitNewData };