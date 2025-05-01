/**
 * Servicio para manejar conexiones WebSocket
 * NOTA: Este servicio ha sido deshabilitado intencionalmente.
 */

// URL base del servidor WebSocket (no se usa, servicio deshabilitado)
// const getWebSocketUrl = () => {
//   const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
//   const host = process.env.NODE_ENV === 'development' ? 'localhost:3000' : window.location.host;
//   return `${protocol}//${host}`;
// };

class WebSocketService {
  constructor() {
    this.enabled = false;
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.eventListeners = new Map();

    console.warn('El servicio WebSocket está deshabilitado permanentemente');
  }

  /**
   * Activa o desactiva la funcionalidad WebSocket
   */
  setEnabled() {
    console.warn('El servicio WebSocket está deshabilitado permanentemente y no puede ser activado');
    return this;
  }

  /**
   * Conecta al servidor WebSocket
   */
  connect() {
    return Promise.reject(new Error('El servicio WebSocket está deshabilitado permanentemente'));
  }

  /**
   * Intenta reconectar al servidor WebSocket
   * @private
   */
  _attemptReconnect() {
    console.warn('El servicio WebSocket está deshabilitado permanentemente');
  }

  /**
   * Cierra la conexión WebSocket
   */
  disconnect() {
    console.warn('El servicio WebSocket está deshabilitado permanentemente');
  }

  /**
   * Envía un mensaje al servidor WebSocket
   */
  send() {
    console.warn('El servicio WebSocket está deshabilitado permanentemente');
    return false;
  }

  /**
   * Suscribe a actualizaciones de un dispositivo y/o modelo específico
   */
  subscribeToDeviceUpdates() {
    console.warn('El servicio WebSocket está deshabilitado permanentemente');
    return false;
  }

  /**
   * Registra un manejador de eventos
   */
  on() {
    console.warn('El servicio WebSocket está deshabilitado permanentemente');
  }

  /**
   * Elimina un manejador de eventos
   */
  off() {
    console.warn('El servicio WebSocket está deshabilitado permanentemente');
  }

  /**
   * Dispara un evento y llama a todos sus manejadores
   * @private
   */
  _triggerEvent() {
    // Deshabilitado
  }

  /**
   * Verifica si hay una conexión activa
   */
  isConnected() {
    return false;
  }
}

// Crear una instancia única del servicio
const websocketService = new WebSocketService();

export default websocketService;
