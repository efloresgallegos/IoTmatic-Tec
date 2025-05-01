import connectionsService from '../services/connections.service.js';

/**
 * Controlador para gestionar las conexiones de dispositivos
 */
const ConnectionsController = {
  /**
   * Obtiene todas las conexiones activas
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  getConnections: async (req, res) => {
    try {
      // Extraer filtros de la consulta
      const { status, user_id, model_id } = req.query;
      const filters = {};
      
      if (status) filters.status = status;
      if (user_id) filters.user_id = user_id;
      if (model_id) filters.model_id = model_id;
      
      // Obtener conexiones con los filtros aplicados
      const connections = connectionsService.getConnections(filters);
      
      // Formatear la respuesta para el frontend
      const formattedConnections = connections.map(conn => ({
        id: conn.device_id,
        name: `Dispositivo ${conn.device_id}`, // Se podría mejorar obteniendo el nombre real del dispositivo
        type: 'IoT Device',
        model_id: conn.model_id,
        user_id: conn.user_id,
        ip: conn.ip,
        mac: conn.mac || 'N/A',
        firmware: conn.firmware || 'N/A',
        lastConnection: conn.connected_at,
        status: conn.status,
        uptime: conn.status === 'online' ? getUptime(conn.connected_at) : '0',
        protocol: 'WebSocket',
        connectionType: 'Wireless'
      }));
      
      res.status(200).json(formattedConnections);
    } catch (error) {
      console.error('Error al obtener conexiones:', error);
      res.status(500).json({ message: error.message });
    }
  },
  
  /**
   * Obtiene información detallada de una conexión específica
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  getConnectionInfo: async (req, res) => {
    try {
      const { device_id } = req.params;
      
      if (!device_id) {
        return res.status(400).json({ message: 'Se requiere el ID del dispositivo' });
      }
      
      const connectionInfo = connectionsService.getConnectionInfo(device_id);
      
      if (!connectionInfo) {
        return res.status(404).json({ message: 'Conexión no encontrada' });
      }
      
      // Formatear la respuesta para el frontend
      const formattedInfo = {
        id: connectionInfo.device_id,
        name: `Dispositivo ${connectionInfo.device_id}`,
        type: 'IoT Device',
        model_id: connectionInfo.model_id,
        user_id: connectionInfo.user_id,
        ip: connectionInfo.ip,
        mac: connectionInfo.mac || 'N/A',
        model: connectionInfo.model_id,
        firmware: connectionInfo.firmware || 'N/A',
        lastConnection: connectionInfo.connected_at,
        status: connectionInfo.status,
        uptime: connectionInfo.status === 'online' ? getUptime(connectionInfo.connected_at) : '0',
        protocol: 'WebSocket',
        connectionType: 'Wireless'
      };
      
      res.status(200).json(formattedInfo);
    } catch (error) {
      console.error('Error al obtener información de conexión:', error);
      res.status(500).json({ message: error.message });
    }
  },
  
  /**
   * Obtiene estadísticas de conexiones
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  getConnectionStats: async (req, res) => {
    try {
      const connections = connectionsService.getConnections();
      const activeCount = connectionsService.getActiveConnectionsCount();
      
      const stats = {
        total: connections.length,
        active: activeCount,
        inactive: connections.length - activeCount,
        lastUpdated: new Date().toISOString()
      };
      
      res.status(200).json(stats);
    } catch (error) {
      console.error('Error al obtener estadísticas de conexiones:', error);
      res.status(500).json({ message: error.message });
    }
  }
};

/**
 * Calcula el tiempo de actividad basado en la fecha de conexión
 * @param {string} connectedAt - Fecha ISO de conexión
 * @returns {string} - Tiempo de actividad formateado
 */
function getUptime(connectedAt) {
  const now = new Date();
  const connected = new Date(connectedAt);
  const diffMs = now - connected;
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${days}d ${hours}h ${minutes}m`;
}

export default ConnectionsController;