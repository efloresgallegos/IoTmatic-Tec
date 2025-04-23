/**
 * Servicio para manejar conexiones WebSocket
 * Este servicio proporciona métodos para conectar, suscribir y recibir datos en tiempo real
 */

// URL base del servidor WebSocket (se ajusta automáticamente según el entorno)
const getWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = process.env.NODE_ENV === 'development' ? 'localhost:3000' : window.location.host;
  return `${protocol}//${host}`;
};

class WebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000; // 3 segundos
    this.eventListeners = new Map();
    this.deviceId = null;
    this.modelId = null;
  }

  /**
   * Conecta al servidor WebSocket
   * @returns {Promise} Promesa que se resuelve cuando la conexión es exitosa
   */
  connect() {
    return new Promise((resolve, reject) => {
      if (this.socket && this.connected) {
        resolve(this.socket);
        return;
      }

      try {
        this.socket = new WebSocket(getWebSocketUrl());

        this.socket.onopen = () => {
          console.log('Conexión WebSocket establecida');
          this.connected = true;
          this.reconnectAttempts = 0;
          resolve(this.socket);
        };

        this.socket.onclose = (event) => {
          console.log(`Conexión WebSocket cerrada: ${event.code} ${event.reason}`);
          this.connected = false;
          this._attemptReconnect();
          // Disparar evento de desconexión
          this._triggerEvent('connection_closed', { code: event.code, reason: event.reason });
        };

        this.socket.onerror = (error) => {
          console.error('Error en la conexión WebSocket:', error);
          // Disparar evento de error
          this._triggerEvent('connection_error', { error });
          reject(error);
        };

        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            // Disparar evento específico basado en el tipo de mensaje
            if (message.event) {
              this._triggerEvent(message.event, message.data);
            }
            // También disparar un evento genérico para todos los mensajes
            this._triggerEvent('message', message);
          } catch (error) {
            console.error('Error al procesar mensaje WebSocket:', error);
          }
        };
      } catch (error) {
        console.error('Error al crear conexión WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Intenta reconectar al servidor WebSocket
   * @private
   */
  _attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Número máximo de intentos de reconexión alcanzado');
      this._triggerEvent('reconnect_failed', { attempts: this.reconnectAttempts });
      return;
    }

    this.reconnectAttempts++;
    console.log(`Intentando reconectar (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      this.connect()
        .then(() => {
          console.log('Reconexión exitosa');
          this._triggerEvent('reconnected', {});
          // Si había una suscripción activa, volver a suscribirse
          if (this.deviceId || this.modelId) {
            this.subscribeToDeviceUpdates(this.deviceId, this.modelId);
          }
        })
        .catch(() => {
          console.log('Falló el intento de reconexión');
        });
    }, this.reconnectInterval);
  }

  /**
   * Cierra la conexión WebSocket
   */
  disconnect() {
    if (this.socket && this.connected) {
      this.socket.close();
      this.connected = false;
      this.deviceId = null;
      this.modelId = null;
      console.log('Conexión WebSocket cerrada manualmente');
    }
  }

  /**
   * Envía un mensaje al servidor WebSocket
   * @param {string} event - Tipo de evento
   * @param {Object} data - Datos a enviar
   * @returns {boolean} - true si el mensaje fue enviado, false en caso contrario
   */
  send(event, data) {
    if (!this.socket || !this.connected) {
      console.error('No hay conexión WebSocket activa');
      return false;
    }

    try {
      const message = JSON.stringify({ event, data });
      this.socket.send(message);
      return true;
    } catch (error) {
      console.error('Error al enviar mensaje WebSocket:', error);
      return false;
    }
  }

  /**
   * Suscribe a actualizaciones de un dispositivo y/o modelo específico
   * @param {number} deviceId - ID del dispositivo
   * @param {number} [modelId] - ID del modelo (opcional)
   */
  subscribeToDeviceUpdates(deviceId, modelId = null) {
    if (!this.connected) {
      console.error('No hay conexión WebSocket activa');
      return false;
    }

    // Guardar IDs para posibles reconexiones
    this.deviceId = deviceId;
    this.modelId = modelId;

    // Suscribirse a actualizaciones de estado del dispositivo
    this.send('subscribe_to_device_status', { device_id: deviceId });

    // Si se proporciona un modelo, suscribirse a actualizaciones de gráficos
    if (modelId) {
      this.send('subscribe_to_graph_updates', { device_id: deviceId, model_id: modelId });
    }

    return true;
  }

  /**
   * Registra un manejador de eventos
   * @param {string} event - Nombre del evento
   * @param {Function} callback - Función a llamar cuando ocurra el evento
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Elimina un manejador de eventos
   * @param {string} event - Nombre del evento
   * @param {Function} callback - Función a eliminar
   */
  off(event, callback) {
    if (!this.eventListeners.has(event)) return;
    
    const callbacks = this.eventListeners.get(event);
    const index = callbacks.indexOf(callback);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Dispara un evento y llama a todos sus manejadores
   * @param {string} event - Nombre del evento
   * @param {Object} data - Datos del evento
   * @private
   */
  _triggerEvent(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error en manejador de evento ${event}:`, error);
        }
      });
    }
  }

  /**
   * Verifica si hay una conexión activa
   * @returns {boolean} - true si hay conexión, false en caso contrario
   */
  isConnected() {
    return this.connected;
  }
}

// Crear una instancia única del servicio
const websocketService = new WebSocketService();

export default websocketService;