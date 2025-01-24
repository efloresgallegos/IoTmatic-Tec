const connections = new Map();

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
        const messageString = message.toString();
        console.log('Mensaje recibido:', messageString);

        const parsedMessage = JSON.parse(messageString);
        if (parsedMessage.type === 'subscribe') {
          console.log(`Cliente se ha suscrito al evento: ${parsedMessage.eventName}`);
        }
      } catch (error) {
        console.error('Error al procesar el mensaje:', error);
      }
    });

    ws.on('close', () => {
      console.log('Cliente desconectado desde IP:', ip);
      connections.set(ip, connections.get(ip) - 1);
    });

    ws.send(JSON.stringify({ message: 'Bienvenido al servidor WebSocket!' }));
  });
};

// Función para emitir nuevos datos
export const emitNewData = (wss, data) => {
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify({ event: 'newData', data }));
    }
  });
};

// Función para emitir nuevas alertas
export const emitNewAlert = (wss, alert) => {
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify({ event: 'newAlert', alert }));
    }
  });
};