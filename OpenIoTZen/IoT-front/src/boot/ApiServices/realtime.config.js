/**
 * Configuración del servicio de tiempo real para OpenIoTZen
 * Este archivo contiene la configuración para la conexión WebSocket
 */

// Obtener la URL del servidor WebSocket desde las variables de entorno
const WS_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Configuración para la conexión WebSocket
const realtimeConfig = {
  // URL del servidor WebSocket
  url: WS_URL,
  
  // Opciones de conexión
  options: {
    // Transportes permitidos (WebSocket primero, polling como fallback)
    transports: ['websocket', 'polling'],
    
    // Reconexión automática
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    
    // Tiempo de espera para conexión
    timeout: 20000,
    
    // Conexión automática al inicializar
    autoConnect: true
  },
  
  // Habilitar/deshabilitar el servicio de tiempo real
  // Se puede controlar mediante la variable de entorno VITE_ENABLE_REALTIME
  enabled: import.meta.env.VITE_ENABLE_REALTIME === 'true' || true
};

export default realtimeConfig;