/**
 * Servicio para gestionar las conexiones activas de dispositivos
 * Mantiene un registro de todos los dispositivos conectados con sus datos
 */

class ConnectionsService {
  constructor() {
    // Mapa para almacenar las conexiones activas
    // La clave es device_id y el valor es un objeto con los datos de la conexión
    this.activeConnections = new Map();
  }

  /**
   * Registra una nueva conexión de dispositivo
   * @param {Object} connectionData - Datos de la conexión
   * @param {string} connectionData.device_id - ID del dispositivo
   * @param {string} connectionData.model_id - ID del modelo
   * @param {string} connectionData.user_id - ID del usuario
   * @param {string} connectionData.token - Token de autenticación
   * @param {string} connectionData.ip - Dirección IP del cliente (opcional)
   * @param {string} connectionData.mac - Dirección MAC del dispositivo (opcional)
   * @param {string} connectionData.firmware - Versión del firmware del dispositivo (opcional)
   * @returns {Object} - Datos de la conexión registrada
   */
  registerConnection(connectionData) {
    const { device_id, model_id, user_id, token, ip, mac, firmware } = connectionData;
    
    if (!device_id || !model_id || !user_id) {
      throw new Error('Se requieren device_id, model_id y user_id para registrar una conexión');
    }
    
    const connectionInfo = {
      device_id,
      model_id,
      user_id,
      token,
      ip: ip || 'desconocida',
      mac: mac || 'desconocida',
      firmware: firmware || 'desconocida',
      status: 'online',
      connected_at: new Date().toISOString(),
      last_activity: new Date().toISOString()
    };
    
    this.activeConnections.set(device_id, connectionInfo);
    console.log(`Conexión registrada para dispositivo ${device_id}`);
    
    return connectionInfo;
  }

  /**
   * Actualiza el estado de una conexión existente
   * @param {string} device_id - ID del dispositivo
   * @param {Object} updateData - Datos a actualizar
   * @returns {Object|null} - Datos actualizados o null si no existe
   */
  updateConnection(device_id, updateData) {
    if (!this.activeConnections.has(device_id)) {
      return null;
    }
    
    const connectionInfo = this.activeConnections.get(device_id);
    const updatedInfo = { ...connectionInfo, ...updateData, last_activity: new Date().toISOString() };
    
    this.activeConnections.set(device_id, updatedInfo);
    console.log(`Conexión actualizada para dispositivo ${device_id}`);
    
    return updatedInfo;
  }

  /**
   * Registra la desconexión de un dispositivo
   * @param {string} device_id - ID del dispositivo
   * @returns {boolean} - true si se registró correctamente, false si no existía
   */
  registerDisconnection(device_id) {
    if (!this.activeConnections.has(device_id)) {
      return false;
    }
    
    const connectionInfo = this.activeConnections.get(device_id);
    connectionInfo.status = 'offline';
    connectionInfo.disconnected_at = new Date().toISOString();
    
    // Mantenemos el registro pero marcamos como desconectado
    this.activeConnections.set(device_id, connectionInfo);
    console.log(`Desconexión registrada para dispositivo ${device_id}`);
    
    return true;
  }

  /**
   * Elimina una conexión del registro
   * @param {string} device_id - ID del dispositivo
   * @returns {boolean} - true si se eliminó correctamente, false si no existía
   */
  removeConnection(device_id) {
    if (!this.activeConnections.has(device_id)) {
      return false;
    }
    
    this.activeConnections.delete(device_id);
    console.log(`Conexión eliminada para dispositivo ${device_id}`);
    
    return true;
  }

  /**
   * Obtiene todas las conexiones activas
   * @param {Object} filters - Filtros opcionales (status, user_id, model_id)
   * @returns {Array} - Lista de conexiones que cumplen con los filtros
   */
  getConnections(filters = {}) {
    let connections = Array.from(this.activeConnections.values());
    
    // Aplicar filtros si existen
    if (filters.status) {
      connections = connections.filter(conn => conn.status === filters.status);
    }
    
    if (filters.user_id) {
      connections = connections.filter(conn => conn.user_id === filters.user_id);
    }
    
    if (filters.model_id) {
      connections = connections.filter(conn => conn.model_id === filters.model_id);
    }
    
    return connections;
  }

  /**
   * Obtiene información de una conexión específica
   * @param {string} device_id - ID del dispositivo
   * @returns {Object|null} - Datos de la conexión o null si no existe
   */
  getConnectionInfo(device_id) {
    return this.activeConnections.has(device_id) 
      ? this.activeConnections.get(device_id) 
      : null;
  }

  /**
   * Verifica si un dispositivo está conectado
   * @param {string} device_id - ID del dispositivo
   * @returns {boolean} - true si está conectado, false si no
   */
  isConnected(device_id) {
    return this.activeConnections.has(device_id) && 
           this.activeConnections.get(device_id).status === 'online';
  }

  /**
   * Obtiene el número total de dispositivos conectados
   * @returns {number} - Número de dispositivos con estado 'online'
   */
  getActiveConnectionsCount() {
    let count = 0;
    this.activeConnections.forEach(conn => {
      if (conn.status === 'online') count++;
    });
    return count;
  }
}

// Singleton para usar en toda la aplicación
const connectionsService = new ConnectionsService();

export default connectionsService;