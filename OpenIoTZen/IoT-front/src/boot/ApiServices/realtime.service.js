

class RealtimeService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.subscriptions = {};
    this.eventHandlers = {};
    this.connectedDevices = [];

    console.warn('El servicio de tiempo real (RealtimeService) ha sido deshabilitado permanentemente');
  }

  /**
   * Inicializa la conexión WebSocket - DESHABILITADA
   */
  connect() {
    console.warn('El servicio de tiempo real está deshabilitado permanentemente');
    return Promise.reject(new Error('El servicio de tiempo real está deshabilitado permanentemente'));
  }

  /**
   * Configura manejadores de eventos - DESHABILITADA
   */
  setupDefaultEventHandlers() {
    console.warn('El servicio de tiempo real está deshabilitado permanentemente');
  }

  /**
   * Cierra la conexión WebSocket - DESHABILITADA
   */
  disconnect() {
    console.warn('El servicio de tiempo real está deshabilitado permanentemente');
  }

  /**
   * Suscribe a actualizaciones de gráficos - DESHABILITADA
   */
  subscribeToGraphUpdates() {
    console.warn('El servicio de tiempo real está deshabilitado permanentemente');
    return false;
  }

  /**
   * Suscribe a actualizaciones de estado de dispositivos - DESHABILITADA
   */
  subscribeToDeviceStatus() {
    console.warn('El servicio de tiempo real está deshabilitado permanentemente');
    return false;
  }

  /**
   * Obtiene la lista de dispositivos conectados - DESHABILITADA
   */
  getConnectedDevices() {
    console.warn('El servicio de tiempo real está deshabilitado permanentemente');
    return [];
  }

  /**
   * Restaura las suscripciones previas - DESHABILITADA
   */
  restoreSubscriptions() {
    console.warn('El servicio de tiempo real está deshabilitado permanentemente');
  }

  /**
   * Actualiza la lista interna de dispositivos conectados - DESHABILITADA
   */
  updateConnectedDevicesList() {
    console.warn('El servicio de tiempo real está deshabilitado permanentemente');
  }

  /**
   * Registra un manejador para un evento específico - DESHABILITADA
   */
  on() {
    console.warn('El servicio de tiempo real está deshabilitado permanentemente');
    return () => {}; // Devuelve una función vacía para cancelar el registro
  }
}

// Crear instancia singleton
const realtimeService = new RealtimeService();

// Función para inicializar el servicio en la aplicación
const initRealtimeService = async ({ app }) => {
  try {
    // El servicio está deshabilitado, pero registramos la instancia para mantener compatibilidad
    app.config.globalProperties.$realtime = realtimeService;
    console.warn('El servicio de tiempo real ha sido registrado pero está deshabilitado permanentemente');
  } catch (error) {
    console.error('Error al inicializar el servicio de tiempo real:', error);
  }
};

export { realtimeService, initRealtimeService };
export default realtimeService;
