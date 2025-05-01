/**
 * Servicio para gestionar conexiones WebSocket con autenticación por token
 * NOTA: Este servicio ha sido deshabilitado intencionalmente.
 * La funcionalidad de WebSocket ha sido eliminada para evitar errores y comportamientos no deseados.
 */

class WebSocketService {
  constructor() {
    this.enabled = false;
    console.warn('El servicio WebSocket está deshabilitado permanentemente');
  }

  setEnabled() {
    console.warn('El servicio WebSocket está deshabilitado permanentemente y no puede ser activado');
    return false;
  }

  connect() {
    return Promise.reject(new Error('El servicio WebSocket está deshabilitado permanentemente'));
  }

  subscribe() {
    return Promise.reject(new Error('El servicio WebSocket está deshabilitado permanentemente'));
  }

  send() {
    console.warn('El servicio WebSocket está deshabilitado permanentemente');
    return false;
  }

  disconnect() {
    console.warn('El servicio WebSocket está deshabilitado permanentemente');
  }

  addMessageListener() {
    console.warn('El servicio WebSocket está deshabilitado permanentemente');
  }

  removeMessageListener() {
    console.warn('El servicio WebSocket está deshabilitado permanentemente');
  }

  addConnectionListener() {
    console.warn('El servicio WebSocket está deshabilitado permanentemente');
  }

  removeConnectionListener() {
    console.warn('El servicio WebSocket está deshabilitado permanentemente');
  }

  addSubscriptionListener() {
    console.warn('El servicio WebSocket está deshabilitado permanentemente');
  }

  removeSubscriptionListener() {
    console.warn('El servicio WebSocket está deshabilitado permanentemente');
  }
}

// Exportar una instancia única del servicio deshabilitado
const websocketService = new WebSocketService();
export default websocketService;
