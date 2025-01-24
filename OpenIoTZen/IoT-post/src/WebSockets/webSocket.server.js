// webSocket.server.js
export const setupWebSocketServer = (wss) => {
    wss.on('connection', (ws) => {
      console.log('Cliente conectado');
  
      // Escuchar eventos desde el cliente
      ws.on('message', (message) => {
        console.log('Mensaje recibido:', message);
  
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === 'subscribe') {
          console.log(`Cliente se ha suscrito al evento: ${parsedMessage.eventName}`);
        }
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
  