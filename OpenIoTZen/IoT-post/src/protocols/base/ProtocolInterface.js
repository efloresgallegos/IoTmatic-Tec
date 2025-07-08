/**
 * Interfaz base para todos los protocolos IoT
 * Define los métodos que deben implementar todos los protocolos
 */
class ProtocolInterface {
  constructor(config = {}) {
    this.config = config;
    this.isRunning = false;
    this.connections = new Map();
    this.eventHandlers = new Map();
  }

  /**
   * Inicia el servidor del protocolo
   * @abstract
   */
  async start() {
    throw new Error('El método start() debe ser implementado por la subclase');
  }

  /**
   * Detiene el servidor del protocolo
   * @abstract
   */
  async stop() {
    throw new Error('El método stop() debe ser implementado por la subclase');
  }

  /**
   * Maneja datos recibidos de dispositivos
   * @abstract
   * @param {Object} data - Datos recibidos
   * @param {Object} client - Cliente que envió los datos
   */
  async handleData(data, client) {
    throw new Error('El método handleData() debe ser implementado por la subclase');
  }

  /**
   * Envía datos a un dispositivo específico
   * @abstract
   * @param {string} deviceId - ID del dispositivo
   * @param {Object} data - Datos a enviar
   */
  async sendToDevice(deviceId, data) {
    throw new Error('El método sendToDevice() debe ser implementado por la subclase');
  }

  /**
   * Registra un cliente/conexión
   * @param {string} deviceId - ID del dispositivo
   * @param {Object} client - Cliente/conexión
   */
  registerClient(deviceId, client) {
    this.connections.set(deviceId, client);
  }

  /**
   * Desregistra un cliente/conexión
   * @param {string} deviceId - ID del dispositivo
   */
  unregisterClient(deviceId) {
    this.connections.delete(deviceId);
  }

  /**
   * Obtiene un cliente por su ID
   * @param {string} deviceId - ID del dispositivo
   * @returns {Object|null} - Cliente o null si no existe
   */
  getClient(deviceId) {
    return this.connections.get(deviceId) || null;
  }

  /**
   * Registra un manejador de eventos
   * @param {string} event - Nombre del evento
   * @param {Function} handler - Función manejadora
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  /**
   * Emite un evento
   * @param {string} event - Nombre del evento
   * @param {*} data - Datos del evento
   */
  emit(event, data) {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error en manejador de evento ${event}:`, error);
      }
    });
  }

  /**
   * Obtiene el nombre del protocolo
   * @abstract
   * @returns {string} - Nombre del protocolo
   */
  getProtocolName() {
    throw new Error('El método getProtocolName() debe ser implementado por la subclase');
  }

  /**
   * Obtiene el puerto por defecto del protocolo
   * @abstract
   * @returns {number} - Puerto por defecto
   */
  getDefaultPort() {
    throw new Error('El método getDefaultPort() debe ser implementado por la subclase');
  }

  /**
   * Genera código cliente para el protocolo
   * @abstract
   * @param {Object} params - Parámetros para generar el código
   * @returns {Object} - Código generado para diferentes lenguajes
   */
  generateClientCode(params) {
    throw new Error('El método generateClientCode() debe ser implementado por la subclase');
  }
}

export default ProtocolInterface;