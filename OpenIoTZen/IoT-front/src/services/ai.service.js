/**
 * Servicio para gestionar las operaciones relacionadas con la IA
 * Este servicio se comunica con los endpoints del backend para procesar solicitudes de IA
 */

import apiService from '../boot/ApiServices/api.service';

const aiService = {
  /**
   * Envía un prompt a la IA y obtiene una respuesta
   * @param {Object} params - Parámetros para la solicitud
   * @param {string} params.prompt - El prompt del usuario
   * @param {string} [params.AI='GPT'] - El proveedor de IA a utilizar ("GPT" o "DeepSeek")
   * @param {Object} [params.currentModel={}] - El modelo actual (si existe)
   * @param {Object} [params.userData={}] - Datos del usuario (si están disponibles)
   * @param {string} [params.template='general'] - Plantilla de prompt a utilizar
   * @returns {Promise<Object>} - Respuesta procesada de la IA
   */
  async sendToAI(params) {
    try {
      const response = await apiService.post('/ai/sendToAI', params);
      return response.data;
    } catch (error) {
      console.error('Error al enviar prompt a la IA:', error);
      throw error;
    }
  },

  /**
   * Envía retroalimentación sobre una respuesta de IA
   * @param {Object} params - Parámetros para la retroalimentación
   * @param {string} params.prompt - El prompt original
   * @param {string} params.response - La respuesta de la IA
   * @param {boolean} params.helpful - Si la respuesta fue útil o no
   * @param {string} [params.comments] - Comentarios adicionales (opcional)
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async sendFeedback(params) {
    try {
      const response = await apiService.post('/ai/feedback', params);
      return response.data;
    } catch (error) {
      console.error('Error al enviar retroalimentación:', error);
      throw error;
    }
  },

  /**
   * Obtiene sugerencias de prompts basadas en el contexto actual
   * @param {Object} params - Parámetros para obtener sugerencias
   * @param {string} [params.context] - Contexto actual (opcional)
   * @param {string} [params.template='general'] - Plantilla de contexto (opcional)
   * @returns {Promise<Array<string>>} - Lista de sugerencias de prompts
   */
  async getSuggestions(params) {
    try {
      const response = await apiService.post('/ai/suggestions', params);
      return response.data;
    } catch (error) {
      console.error('Error al obtener sugerencias:', error);
      return []; // Devolver array vacío en caso de error
    }
  },

  /**
   * Obtiene las plantillas disponibles para prompts
   * @returns {Promise<Array<Object>>} - Lista de plantillas disponibles
   */
  async getTemplates() {
    try {
      const response = await apiService.get('/ai/templates');
      return response.data;
    } catch (error) {
      console.error('Error al obtener plantillas:', error);
      // Devolver plantillas predeterminadas en caso de error
      return [
        { id: 'general', name: 'General' },
        { id: 'modelCreation', name: 'Creación de Modelos' },
        { id: 'dataAnalysis', name: 'Análisis de Datos' },
        { id: 'deviceConfig', name: 'Configuración de Dispositivos' },
        { id: 'troubleshooting', name: 'Solución de Problemas' }
      ];
    }
  }
};

export default aiService;