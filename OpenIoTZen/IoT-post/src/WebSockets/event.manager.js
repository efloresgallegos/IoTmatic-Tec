const events = {}; 

// Función para suscribirse a un evento
const subscribe = (eventName, ws) => {
  if (!events[eventName]) {
    events[eventName] = [];
  }
  events[eventName].push(ws);
  console.log(`Cliente suscrito a: ${eventName}`);
};

// Función para desuscribirse de un evento
const unsubscribe = (ws) => {
  for (let eventName in events) {
    events[eventName] = events[eventName].filter(client => client !== ws);
  }
  console.log('Cliente desuscrito de todos los eventos.');
};

// Función para emitir un evento
const emit = (eventName, data) => {
  if (events[eventName]) {
    events[eventName].forEach(client => {
      client.send(JSON.stringify({ event: eventName, data }));
    });
    console.log(`Evento ${eventName} emitido a los clientes.`);
  }
};

export default {
  subscribe,
  unsubscribe,
  emit
};
