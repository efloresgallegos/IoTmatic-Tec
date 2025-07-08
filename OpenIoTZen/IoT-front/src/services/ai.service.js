/**
 * Servicio para gestionar las operaciones relacionadas con la IA
 * Este servicio se comunica con los endpoints del backend para procesar solicitudes de IA
 */

import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000';

const aiService = {
  /**
   * Envía un prompt a DeepSeek y obtiene una respuesta
   * @param {Object} params - Parámetros para la solicitud
   * @param {string} params.prompt - El prompt del usuario
   * @param {Object} [params.currentModel={}] - El modelo actual (si existe)
   * @param {Object} [params.userData={}] - Datos del usuario (si están disponibles)
   * @returns {Promise<Object>} - Respuesta procesada de la IA
   */
  async sendToAI(data) {
    try {
      console.log('Enviando datos a DeepSeek:', data); // Debug

      const response = await axios.post(`${API_URL}/api/ai/deepseek`, {
        prompt: data.prompt,
        currentModel: data.currentModel || null,
        userData: data.userData || null
      });

      console.log('Respuesta de DeepSeek:', response.data); // Debug

      if (!response.data) {
        throw new Error('No se recibió respuesta del servidor');
      }

      return response;
    } catch (error) {
      console.error('Error al enviar prompt a DeepSeek:', error);
      if (error.response) {
        console.error('Detalles del error:', error.response.data);
        throw new Error(error.response.data.message || 'Error al procesar la solicitud');
      }
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
  async sendFeedback(data) {
    try {
      await axios.post(`${API_URL}/api/ai/feedback`, data);
    } catch (error) {
      console.error('Error al enviar retroalimentación:', error);
    }
  },

  /**
   * Obtiene sugerencias de prompts basadas en el contexto actual
   * @param {Object} params - Parámetros para obtener sugerencias
   * @param {string} [params.context] - Contexto actual (opcional)
   * @returns {Promise<Array<string>>} - Lista de sugerencias de prompts
   */
  async getSuggestions(data = {}) {
    try {
      const response = await axios.post(`${API_URL}/api/ai/suggestions`, {
        context: data.context || '',
        currentModel: data.currentModel || null
      });

      return response.data.suggestions || [];
    } catch (error) {
      console.error('Error al obtener sugerencias:', error);
      return [];
    }
  },

  /**
   * Obtiene las plantillas disponibles para prompts
   * @returns {Promise<Array<Object>>} - Lista de plantillas disponibles
   */
  async getTemplates() {
    try {
      const response = await axios.get(`${API_URL}/api/ai/templates`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener plantillas:', error);
      return [];
    }
  }
};

export default aiService;