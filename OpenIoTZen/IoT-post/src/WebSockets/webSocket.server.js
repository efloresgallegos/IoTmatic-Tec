const connections = new Map();
const subscriptions = new Map();

export const setupWebSocketServer = (wss) => {
  wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    const count = connections.get(ip) || 0;

    if (count >= 1) {
      ws.close(1008, 'Too many connections');
      return;
    }

    connections.set(ip, count + 1);

    console.log('Cliente conectado desde IP:', ip);

    ws.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        if (parsedMessage.type === 'subscribe') {
          const { eventName } = parsedMessage;
          if (!subscriptions.has(eventName)) {
            subscriptions.set(eventName, new Set());
          }
          subscriptions.get(eventName).add(ws);
          console.log(`Cliente se ha suscrito al evento: ${eventName}`);
        } else if (parsedMessage.type === 'unsubscribe') {
          const { eventName } = parsedMessage;
          if (subscriptions.has(eventName)) {
            subscriptions.get(eventName).delete(ws);
            console.log(`Cliente se ha desuscrito del evento: ${eventName}`);
          }
        }
      } catch (error) {
        console.error('Error al procesar el mensaje:', error);
      }
    });

    ws.on('close', () => {
      console.log('Cliente desconectado desde IP:', ip);
      const count = connections.get(ip) - 1;
      if (count === 0) {
        connections.delete(ip);
      } else {
        connections.set(ip, count);
      }

      // Limpiar suscripciones del cliente
      subscriptions.forEach((clients, eventName) => {
        clients.delete(ws);
        if (clients.size === 0) {
          subscriptions.delete(eventName);
        }
      });
    });

    ws.send(JSON.stringify({ message: 'Bienvenido al servidor WebSocket!' }));
  });
};

export const emitNewData = (wss, data) => {
  const eventName = 'newData';
  if (subscriptions.has(eventName)) {
    subscriptions.get(eventName).forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({ event: eventName, data }));
      }
    });
  }
};

export const emitNewAlert = (wss, alert) => {
  const eventName = 'newAlert';
  if (subscriptions.has(eventName)) {
    subscriptions.get(eventName).forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({ event: eventName, alert }));
      }
    });
  }
};