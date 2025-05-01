/**
 * Configuración del servicio de tiempo real para OpenIoTZen
 * NOTA: El servicio ha sido deshabilitado permanentemente.
 */

// Obtener la URL del servidor WebSocket desde las variables de entorno


// Configuración para la conexión WebSocket - DESHABILITADA
const realtimeConfig = {
  // URL del servidor WebSocket

  // Opciones de conexión
  options: {
    // Transportes permitidos (WebSocket primero, polling como fallback)
    transports: ['websocket', 'polling'],

    // Reconexión automática
    reconnection: false,
    reconnectionAttempts: 0,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,

    // Tiempo de espera para conexión
    timeout: 5000,

    // Conexión automática al inicializar
    autoConnect: false
  },

  // Servicio deshabilitado permanentemente
  enabled: false
};

export default realtimeConfig;
