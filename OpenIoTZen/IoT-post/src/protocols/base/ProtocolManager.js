import dataService from '../../services/data.service.js';
import connectionsService from '../../services/connections.service.js';
import { verifyToken } from '../../middlewares/websocket.auth.middleware.js';

/**
 * Administrador central de todos los protocolos IoT
 * Coordina la comunicación entre diferentes protocolos y el sistema
 */
class ProtocolManager {
  constructor() {
    this.protocols = new Map();
    this.deviceProtocols = new Map(); // Mapea device_id -> protocol_name
    this.isInitialized = false;
  }

  /**
   * Inicializa el administrador de protocolos
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('ProtocolManager ya está inicializado');
      return;
    }

    // Cargar protocolos disponibles
    await this.loadProtocols();
    
    // Configurar manejadores de eventos comunes
    this.setupCommonEventHandlers();
    
    this.isInitialized = true;
    console.log('ProtocolManager inicializado correctamente');
  }

  /**
   * Carga todos los protocolos disponibles
   */
  async loadProtocols() {
    try {
      // Cargar WebSocket (existente)
      const { default: WebSocketProtocol } = await import('../websocket/WebSocketProtocol.js');
      await this.registerProtocol('websocket', WebSocketProtocol);

      // Cargar MQTT
      const { default: MQTTProtocol } = await import('../mqtt/MQTTProtocol.js');
      await this.registerProtocol('mqtt', MQTTProtocol);

      // Cargar CoAP
      const { default: CoAPProtocol } = await import('../coap/CoAPProtocol.js');
      await this.registerProtocol('coap', CoAPProtocol);

      console.log('Protocolos cargados:', Array.from(this.protocols.keys()));
    } catch (error) {
      console.error('Error cargando protocolos:', error);
    }
  }

  /**
   * Registra un nuevo protocolo
   * @param {string} name - Nombre del protocolo
   * @param {Class} ProtocolClass - Clase del protocolo
   */
  async registerProtocol(name, ProtocolClass) {
    try {
      const config = this.getProtocolConfig(name);
      const protocol = new ProtocolClass(config);
      
      // Configurar manejadores de eventos específicos del protocolo
      this.setupProtocolEventHandlers(protocol, name);
      
      this.protocols.set(name, protocol);
      console.log(`Protocolo ${name} registrado correctamente`);
    } catch (error) {
      console.error(`Error registrando protocolo ${name}:`, error);
    }
  }

  /**
   * Obtiene la configuración para un protocolo específico
   * @param {string} protocolName - Nombre del protocolo
   * @returns {Object} - Configuración del protocolo
   */
  getProtocolConfig(protocolName) {
    const baseConfig = {
      host: process.env.HOST || 'localhost',
      enabled: true
    };

    switch (protocolName) {
      case 'websocket':
        return {
          ...baseConfig,
          port: process.env.WS_PORT || 3000
        };
      case 'mqtt':
        return {
          ...baseConfig,
          port: process.env.MQTT_PORT || 1883,
          clientId: process.env.MQTT_CLIENT_ID || 'openiotzen-server'
        };
      case 'coap':
        return {
          ...baseConfig,
          port: process.env.COAP_PORT || 5683
        };
      default:
        return baseConfig;
    }
  }

  /**
   * Configura manejadores de eventos comunes para todos los protocolos
   */
  setupCommonEventHandlers() {
    // Los manejadores se configurarán para cada protocolo individualmente
  }

  /**
   * Configura manejadores de eventos específicos de un protocolo
   * @param {Object} protocol - Instancia del protocolo
   * @param {string} protocolName - Nombre del protocolo
   */
  setupProtocolEventHandlers(protocol, protocolName) {
    // Manejar datos recibidos
    protocol.on('data', async (data) => {
      await this.handleProtocolData(data, protocolName);
    });

    // Manejar conexiones de dispositivos
    protocol.on('device_connected', (deviceData) => {
      this.handleDeviceConnection(deviceData, protocolName);
    });

    // Manejar desconexiones de dispositivos
    protocol.on('device_disconnected', (deviceData) => {
      this.handleDeviceDisconnection(deviceData, protocolName);
    });

    // Manejar errores
    protocol.on('error', (error) => {
      console.error(`Error en protocolo ${protocolName}:`, error);
    });
  }

  /**
   * Maneja datos recibidos de cualquier protocolo
   * @param {Object} data - Datos recibidos
   * @param {string} protocolName - Protocolo de origen
   */
  async handleProtocolData(data, protocolName) {
    try {
      console.log(`Datos recibidos via ${protocolName}:`, data);

      // Validar token si está presente
      if (data.token) {
        const tokenData = verifyToken(data.token);
        if (!tokenData) {
          console.error('Token inválido en datos recibidos');
          return;
        }
        
        // Completar datos desde el token si es necesario
        if (!data.device_id && tokenData.device) data.device_id = tokenData.device;
        if (!data.model_id && tokenData.model) data.model_id = tokenData.model;
        if (!data.user_id && tokenData.user) data.user_id = tokenData.user;
      }

      // Validar datos requeridos
      if (!data.device_id || !data.model_id || !data.user_id) {
        console.error('Datos incompletos recibidos:', data);
        return;
      }

      // Registrar el protocolo usado por este dispositivo
      this.deviceProtocols.set(data.device_id, protocolName);

      // Guardar datos en la base de datos
      const processedData = {
        device_id: data.device_id,
        model_id: data.model_id,
        user_id: data.user_id,
        timestamp: data.timestamp || new Date().toISOString(),
        protocol: protocolName,
        ...data.payload || data
      };

      // Eliminar campos de control
      delete processedData.token;
      delete processedData.payload;

      await dataService.createData(processedData);
      console.log(`Datos guardados correctamente desde protocolo ${protocolName}`);

      // Emitir evento para notificar a otros sistemas (WebSocket, etc.)
      this.emit('data_received', {
        ...processedData,
        source_protocol: protocolName
      });

    } catch (error) {
      console.error('Error procesando datos de protocolo:', error);
    }
  }

  /**
   * Maneja la conexión de un dispositivo
   * @param {Object} deviceData - Datos del dispositivo conectado
   * @param {string} protocolName - Protocolo usado
   */
  handleDeviceConnection(deviceData, protocolName) {
    try {
      // Registrar conexión en el servicio de conexiones
      connectionsService.registerConnection({
        ...deviceData,
        protocol: protocolName,
        connected_at: new Date().toISOString()
      });

      console.log(`Dispositivo ${deviceData.device_id} conectado via ${protocolName}`);
      
      // Registrar el protocolo del dispositivo
      this.deviceProtocols.set(deviceData.device_id, protocolName);

      // Emitir evento de conexión
      this.emit('device_connected', {
        ...deviceData,
        protocol: protocolName
      });
    } catch (error) {
      console.error('Error manejando conexión de dispositivo:', error);
    }
  }

  /**
   * Maneja la desconexión de un dispositivo
   * @param {Object} deviceData - Datos del dispositivo desconectado
   * @param {string} protocolName - Protocolo usado
   */
  handleDeviceDisconnection(deviceData, protocolName) {
    try {
      // Registrar desconexión
      connectionsService.registerDisconnection(deviceData.device_id);

      console.log(`Dispositivo ${deviceData.device_id} desconectado de ${protocolName}`);
      
      // Remover el mapeo de protocolo
      this.deviceProtocols.delete(deviceData.device_id);

      // Emitir evento de desconexión
      this.emit('device_disconnected', {
        ...deviceData,
        protocol: protocolName
      });
    } catch (error) {
      console.error('Error manejando desconexión de dispositivo:', error);
    }
  }

  /**
   * Inicia todos los protocolos habilitados
   */
  async startAllProtocols() {
    const promises = [];
    
    for (const [name, protocol] of this.protocols) {
      if (protocol.config.enabled) {
        promises.push(
          protocol.start().then(() => {
            console.log(`Protocolo ${name} iniciado en puerto ${protocol.config.port}`);
          }).catch(error => {
            console.error(`Error iniciando protocolo ${name}:`, error);
          })
        );
      }
    }

    await Promise.allSettled(promises);
  }

  /**
   * Detiene todos los protocolos
   */
  async stopAllProtocols() {
    const promises = [];
    
    for (const [name, protocol] of this.protocols) {
      if (protocol.isRunning) {
        promises.push(
          protocol.stop().then(() => {
            console.log(`Protocolo ${name} detenido`);
          }).catch(error => {
            console.error(`Error deteniendo protocolo ${name}:`, error);
          })
        );
      }
    }

    await Promise.allSettled(promises);
  }

  /**
   * Envía datos a un dispositivo específico
   * @param {string} deviceId - ID del dispositivo
   * @param {Object} data - Datos a enviar
   */
  async sendToDevice(deviceId, data) {
    const protocolName = this.deviceProtocols.get(deviceId);
    
    if (!protocolName) {
      throw new Error(`No se encontró protocolo para el dispositivo ${deviceId}`);
    }

    const protocol = this.protocols.get(protocolName);
    if (!protocol) {
      throw new Error(`Protocolo ${protocolName} no está disponible`);
    }

    return await protocol.sendToDevice(deviceId, data);
  }

  /**
   * Obtiene información de todos los protocolos
   * @returns {Array} - Lista de protocolos con su información
   */
  getProtocolsInfo() {
    const info = [];
    
    for (const [name, protocol] of this.protocols) {
      info.push({
        name,
        running: protocol.isRunning,
        port: protocol.config.port,
        connections: protocol.connections.size,
        enabled: protocol.config.enabled
      });
    }

    return info;
  }

  /**
   * Obtiene un protocolo específico por nombre
   * @param {string} name - Nombre del protocolo
   * @returns {Object|null} - Protocolo o null si no existe
   */
  getProtocol(name) {
    return this.protocols.get(name) || null;
  }

  /**
   * Genera código cliente para un protocolo específico
   * @param {string} protocolName - Nombre del protocolo
   * @param {Object} params - Parámetros para generar el código
   * @returns {Object} - Código generado
   */
  generateClientCode(protocolName, params) {
    const protocol = this.protocols.get(protocolName);
    if (!protocol) {
      throw new Error(`Protocolo ${protocolName} no encontrado`);
    }

    return protocol.generateClientCode(params);
  }

  /**
   * Emite un evento global
   * @param {string} event - Nombre del evento
   * @param {*} data - Datos del evento
   */
  emit(event, data) {
    // Aquí se puede integrar con el sistema de eventos existente
    // Por ejemplo, emitir a WebSocket para notificar al frontend
    console.log(`Evento emitido: ${event}`, data);
  }
}

// Crear instancia única
const protocolManager = new ProtocolManager();

export default protocolManager;