import { io } from 'socket.io-client';

class RealtimeService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.subscriptions = {};
    this.eventHandlers = {};
    this.connectedDevices = [];
  }

  /**
   * Inicializa la conexión WebSocket
   * @param {string} url - URL del servidor WebSocket
   * @returns {Promise} - Promesa que se resuelve cuando la conexión está lista
   */
  connect(url = import.meta.env.VITE_API_URL || 'http://localhost:3000') {
    return new Promise((resolve, reject) => {
      try {
        // Si ya hay una conexión, la cerramos
        if (this.socket) {
          this.socket.disconnect();
        }

        // Crear nueva conexión
        this.socket = io(url, {
          transports: ['websocket', 'polling'],
          autoConnect: true
        });

        // Manejar eventos de conexión
        this.socket.on('connect', () => {
          console.log('Conexión WebSocket establecida');
          this.connected = true;
          resolve(this.socket);

          // Restaurar suscripciones previas
          this.restoreSubscriptions();
        });

        this.socket.on('disconnect', () => {
          console.log('Conexión WebSocket cerrada');
          this.connected = false;
        });

        this.socket.on('connect_error', (error) => {
          console.error('Error de conexión WebSocket:', error);
          reject(error);
        });

        // Configurar manejadores de eventos predeterminados
        this.setupDefaultEventHandlers();
      } catch (error) {
        console.error('Error al inicializar WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Configura manejadores de eventos predeterminados
   */
  setupDefaultEventHandlers() {
    // Confirmación de suscripción a gráficos
    this.socket.on('graph_subscription_confirmed', (data) => {
      console.log('Suscripción a gráficos confirmada:', data);
    });

    // Actualización de datos de gráficos
    this.socket.on('graph_data_update', (data) => {
      console.log('Actualización de datos de gráficos recibida:', data);
      
      // Ejecutar manejadores registrados para este evento
      if (this.eventHandlers['graph_data_update']) {
        this.eventHandlers['graph_data_update'].forEach(handler => {
          handler(data);
        });
      }
    });
    
    // Confirmación de suscripción a estado de dispositivos
    this.socket.on('device_status_subscription_confirmed', (data) => {
      console.log('Suscripción a estado de dispositivos confirmada:', data);
    });
    
    // Actualización de estado de dispositivos
    this.socket.on('device_status_update', (data) => {
      console.log('Actualización de estado de dispositivo recibida:', data);
      
      // Actualizar lista interna de dispositivos conectados
      this.updateConnectedDevicesList(data);
      
      // Ejecutar manejadores registrados para este evento
      if (this.eventHandlers['device_status_update']) {
        this.eventHandlers['device_status_update'].forEach(handler => {
          handler(data);
        });
      }
    });
    
    // Actualización de modelo de datos conectado
    this.socket.on('model_connection_update', (data) => {
      console.log('Actualización de conexión de modelo recibida:', data);
      
      // Ejecutar manejadores registrados para este evento
      if (this.eventHandlers['model_connection_update']) {
        this.eventHandlers['model_connection_update'].forEach(handler => {
          handler(data);
        });
      }
    });
  }

  /**
   * Cierra la conexión WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.subscriptions = {};
    }
  }

  /**
   * Suscribe a actualizaciones de gráficos para un dispositivo o modelo
   * @param {Object} params - Parámetros de suscripción
   * @param {number} params.device_id - ID del dispositivo (opcional)
   * @param {number} params.model_id - ID del modelo (opcional)
   */
  subscribeToGraphUpdates(params) {
    if (!this.connected || !this.socket) {
      console.warn('No hay conexión WebSocket activa');
      return false;
    }

    const { device_id, model_id } = params;
    const subscriptionKey = `graph_${device_id || 'all'}_${model_id || 'all'}`;

    // Guardar suscripción
    this.subscriptions[subscriptionKey] = {
      ...params,
      subscription_type: 'graph'
    };

    // Enviar solicitud de suscripción
    this.socket.emit('subscribe_to_graph_updates', params);
    console.log('Solicitud de suscripción a gráficos enviada:', params);

    return true;
  }
  
  /**
   * Suscribe a actualizaciones de estado de dispositivos
   * @param {Object} params - Parámetros de suscripción (opcional)
   * @param {number} params.device_id - ID del dispositivo específico (opcional)
   */
  subscribeToDeviceStatus(params = {}) {
    if (!this.connected || !this.socket) {
      console.warn('No hay conexión WebSocket activa');
      return false;
    }

    const subscriptionKey = `device_status_${params.device_id || 'all'}`;

    // Guardar suscripción
    this.subscriptions[subscriptionKey] = {
      ...params,
      subscription_type: 'device_status'
    };

    // Enviar solicitud de suscripción
    this.socket.emit('subscribe_to_device_status', params);
    console.log('Solicitud de suscripción a estado de dispositivos enviada:', params);

    return true;
  }
  
  /**
   * Obtiene la lista de dispositivos conectados actualmente
   * @returns {Array} - Lista de dispositivos conectados
   */
  getConnectedDevices() {
    return [...this.connectedDevices];
  }

  /**
   * Restaura las suscripciones previas después de una reconexión
   */
  restoreSubscriptions() {
    Object.values(this.subscriptions).forEach(params => {
      if (params.subscription_type === 'graph') {
        this.socket.emit('subscribe_to_graph_updates', params);
        console.log('Restaurando suscripción a gráficos:', params);
      } else if (params.subscription_type === 'device_status') {
        this.socket.emit('subscribe_to_device_status', params);
        console.log('Restaurando suscripción a estado de dispositivos:', params);
      }
    });
  }
  
  /**
   * Actualiza la lista interna de dispositivos conectados
   * @param {Object} data - Datos de actualización de estado
   */
  updateConnectedDevicesList(data) {
    if (data.status === 'connected') {
      // Verificar si el dispositivo ya está en la lista
      const existingIndex = this.connectedDevices.findIndex(d => d.device_id === data.device_id);
      
      if (existingIndex >= 0) {
        // Actualizar dispositivo existente
        this.connectedDevices[existingIndex] = {
          ...this.connectedDevices[existingIndex],
          ...data,
          connected_since: data.connected_since || new Date().toISOString()
        };
      } else {
        // Añadir nuevo dispositivo
        this.connectedDevices.push({
          ...data,
          connected_since: data.connected_since || new Date().toISOString()
        });
      }
    } else if (data.status === 'disconnected') {
      // Eliminar dispositivo de la lista
      this.connectedDevices = this.connectedDevices.filter(d => d.device_id !== data.device_id);
    }
  }

  /**
   * Registra un manejador para un evento específico
   * @param {string} event - Nombre del evento
   * @param {Function} handler - Función manejadora
   * @returns {Function} - Función para cancelar el registro
   */
  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }

    this.eventHandlers[event].push(handler);

    // Devolver función para cancelar el registro
    return () => {
      this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
    };
  }
}

// Crear instancia singleton
const realtimeService = new RealtimeService();

// Función para inicializar el servicio en la aplicación
const initRealtimeService = async ({ app }) => {
  try {
    // Inicializar conexión
    await realtimeService.connect();

    // Registrar el servicio en la aplicación
    app.config.globalProperties.$realtime = realtimeService;
  } catch (error) {
    console.error('Error al inicializar el servicio de tiempo real:', error);
  }
};

export { realtimeService, initRealtimeService };
export default realtimeService;