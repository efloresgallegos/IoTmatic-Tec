/**
 * Middleware para autenticación de WebSockets mediante JWT
 * Este middleware verifica la validez de los tokens JWT en las conexiones WebSocket
 */

import jwt from 'jwt-simple';
import 'dotenv/config';

// Clave secreta para verificar tokens JWT
const secret = process.env.SECRET_JWT || '';

/**
 * Verifica la validez de un token JWT
 * @param {string} token - Token JWT a verificar
 * @returns {Object|null} - Datos decodificados del token o null si es inválido
 */
const verifyToken = (token) => {
  try {
    if (!token) return null;
    
    // Eliminar 'Bearer ' si está presente
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }
    
    const decoded = jwt.decode(token, secret);
    
    // Verificar si el token ha expirado
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      console.log('Token expirado');
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Error al verificar token:', error.message);
    return null;
  }
};

/**
 * Middleware para autenticar conexiones WebSocket
 * @param {Object} req - Objeto de solicitud HTTP
 * @param {Object} socket - Socket de conexión
 * @param {Buffer} head - Cabecera de la solicitud
 * @param {Function} next - Función para continuar con el siguiente middleware
 */
const authenticateWebSocket = (req, socket, head, next) => {
  try {
    // Extraer token de los headers
    const authHeader = req.headers['authorization'] || req.headers['sec-websocket-protocol'];
    
    if (!authHeader) {
      // Permitir conexiones sin autenticación, pero marcarlas como no autenticadas
      req.isAuthenticated = false;
      req.tokenData = null;
      return next();
    }
    
    // Extraer token del header de autorización
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    
    // Verificar token
    const tokenData = verifyToken(token);
    if (tokenData) {
      // Almacenar datos del token en el objeto de solicitud
      req.isAuthenticated = true;
      req.tokenData = tokenData;
      console.log(`WebSocket autenticado: usuario ${tokenData.user}, dispositivo ${tokenData.device}, modelo ${tokenData.model}`);
    } else {
      req.isAuthenticated = false;
      req.tokenData = null;
      console.log('Token WebSocket inválido o expirado');
    }
    
    next();
  } catch (error) {
    console.error('Error en autenticación WebSocket:', error);
    req.isAuthenticated = false;
    req.tokenData = null;
    next();
  }
};

/**
 * Middleware para verificar autenticación en mensajes WebSocket
 * @param {Object} ws - WebSocket del cliente
 * @param {Object} message - Mensaje recibido
 * @returns {boolean} - true si el mensaje está autenticado, false en caso contrario
 */
const verifyWebSocketMessage = (ws, message) => {
  try {
    // Si el WebSocket ya está autenticado con tokenData, no es necesario verificar cada mensaje
    if (ws.tokenData) {
      return true;
    }
    
    // Verificar si el mensaje contiene un token
    if (message && message.token) {
      const tokenData = verifyToken(message.token);
      if (tokenData) {
        // Almacenar datos del token en el objeto WebSocket para futuras verificaciones
        ws.tokenData = tokenData;
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error al verificar mensaje WebSocket:', error);
    return false;
  }
};

export {
  verifyToken,
  authenticateWebSocket,
  verifyWebSocketMessage
};