import protocolManager from '../protocols/base/ProtocolManager.js';

/**
 * Controlador para generar código de múltiples protocolos IoT
 */
const protocolCodeController = {
  /**
   * Genera código para múltiples protocolos IoT basado en el modelo y tipo de conexión
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} req.body - Cuerpo de la solicitud
   * @param {string} req.body.deviceId - ID del dispositivo
   * @param {string} req.body.modelId - ID del modelo
   * @param {string} req.body.userId - ID del usuario
   * @param {string} req.body.protocol - Protocolo específico (opcional, por defecto todos)
   * @param {string} req.body.connectionType - Tipo de conexión (periodic, event, batch)
   * @param {Object} res - Objeto de respuesta Express
   */
  generateProtocolCode: async (req, res) => {
    try {
      const { deviceId, modelId, userId, protocol, connectionType = 'periodic' } = req.body;

      // Validar parámetros requeridos
      if (!deviceId || !modelId || !userId) {
        return res.status(400).json({
          success: false,
          message: 'deviceId, modelId y userId son requeridos'
        });
      }

      // Importar modelo y obtener JSON
      const Model = (await import('../models/models.model.js')).default;
      const modelData = await Model.findByPk(modelId);
      
      if (!modelData) {
        return res.status(404).json({
          success: false,
          message: 'Modelo no encontrado'
        });
      }

      const modelJson = JSON.parse(modelData.json);

      // Generar token JWT para autenticación
      const jwt = (await import('jwt-simple')).default;
      const secret = process.env.SECRET_JWT || 'default-secret';
      
      const tokenPayload = {
        user: userId,
        device: deviceId,
        model: parseInt(modelId),
        role: 'device',
        exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 año
      };
      
      const token = jwt.encode(tokenPayload, secret);

      // Preparar parámetros para generación de código
      const codeParams = {
        modelJson,
        deviceId,
        modelId: parseInt(modelId),
        userId,
        token,
        connectionType
      };

      // Generar código para protocolos específicos o todos
      const codeResults = {};

      if (protocol) {
        // Generar para protocolo específico
        try {
          const code = protocolManager.generateClientCode(protocol, codeParams);
          codeResults[protocol] = code;
        } catch (error) {
          console.error(`Error generando código para protocolo ${protocol}:`, error);
          return res.status(400).json({
            success: false,
            message: `Protocolo ${protocol} no soportado o error en generación`
          });
        }
      } else {
        // Generar para todos los protocolos disponibles
        const availableProtocols = ['websocket', 'mqtt', 'coap'];
        
        for (const protocolName of availableProtocols) {
          try {
            const code = protocolManager.generateClientCode(protocolName, codeParams);
            codeResults[protocolName] = code;
          } catch (error) {
            console.error(`Error generando código para protocolo ${protocolName}:`, error);
            // Continúa con otros protocolos
          }
        }
      }

      // Verificar que se generó al menos un código
      if (Object.keys(codeResults).length === 0) {
        return res.status(500).json({
          success: false,
          message: 'No se pudo generar código para ningún protocolo'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          device_id: deviceId,
          model_id: modelId,
          user_id: userId,
          model_name: modelJson.name,
          connection_type: connectionType,
          token,
          protocols: codeResults,
          generated_at: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error al generar código de protocolos:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al generar código de protocolos',
        error: error.message
      });
    }
  },

  /**
   * Obtiene información de protocolos disponibles
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  getAvailableProtocols: async (req, res) => {
    try {
      const protocolsInfo = protocolManager.getProtocolsInfo();
      
      res.status(200).json({
        success: true,
        data: {
          protocols: protocolsInfo,
          total_protocols: protocolsInfo.length,
          active_protocols: protocolsInfo.filter(p => p.running).length
        }
      });

    } catch (error) {
      console.error('Error obteniendo información de protocolos:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo información de protocolos',
        error: error.message
      });
    }
  },

  /**
   * Obtiene información específica de un protocolo
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  getProtocolInfo: async (req, res) => {
    try {
      const { protocol } = req.params;
      const protocolInstance = protocolManager.getProtocol(protocol);
      
      if (!protocolInstance) {
        return res.status(404).json({
          success: false,
          message: `Protocolo ${protocol} no encontrado`
        });
      }

      const info = {
        name: protocolInstance.getProtocolName(),
        default_port: protocolInstance.getDefaultPort(),
        running: protocolInstance.isRunning,
        connections: protocolInstance.connections.size,
        config: protocolInstance.config
      };

      res.status(200).json({
        success: true,
        data: info
      });

    } catch (error) {
      console.error('Error obteniendo información del protocolo:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo información del protocolo',
        error: error.message
      });
    }
  },

  /**
   * Envía datos a un dispositivo específico usando cualquier protocolo
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  sendToDevice: async (req, res) => {
    try {
      const { deviceId, data } = req.body;

      if (!deviceId || !data) {
        return res.status(400).json({
          success: false,
          message: 'deviceId y data son requeridos'
        });
      }

      // Intentar enviar datos al dispositivo
      await protocolManager.sendToDevice(deviceId, data);

      res.status(200).json({
        success: true,
        message: `Datos enviados al dispositivo ${deviceId}`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error enviando datos al dispositivo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error enviando datos al dispositivo'
      });
    }
  },

  /**
   * Obtiene estadísticas de conexiones por protocolo
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  getConnectionStats: async (req, res) => {
    try {
      const protocolsInfo = protocolManager.getProtocolsInfo();
      const stats = {
        total_connections: 0,
        protocols: {},
        summary: {
          active_protocols: 0,
          total_protocols: protocolsInfo.length
        }
      };

      protocolsInfo.forEach(protocol => {
        stats.protocols[protocol.name] = {
          running: protocol.running,
          connections: protocol.connections,
          port: protocol.port,
          enabled: protocol.enabled
        };
        
        if (protocol.running) {
          stats.summary.active_protocols++;
          stats.total_connections += protocol.connections;
        }
      });

      res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas de conexiones:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas de conexiones',
        error: error.message
      });
    }
  }
};

export default protocolCodeController;