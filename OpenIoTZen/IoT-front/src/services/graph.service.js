/**
 * Servicio para gestionar las operaciones relacionadas con gráficos
 * Este servicio se comunica con los endpoints del backend para obtener y procesar datos para visualizaciones
 */

import apiService from '../boot/ApiServices/api.service';

const graphService = {
  /**
   * Obtiene los campos graficables para un modelo específico
   * @param {number|string} modelId - ID del modelo
   * @returns {Promise<Array>} - Lista de campos graficables
   */
  async getGraphableFields(modelId) {
    try {
      const response = await apiService.get(`/graph/fields/${modelId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener campos graficables:', error);
      throw error;
    }
  },

  /**
   * Obtiene datos procesados para gráficos
   * @param {Object} params - Parámetros para la consulta
   * @param {number|string} params.model_id - ID del modelo
   * @param {string} params.start_date - Fecha de inicio (formato ISO)
   * @param {string} params.end_date - Fecha de fin (formato ISO)
   * @param {string} params.group_by - Agrupación temporal (hour, day, week, month, year)
   * @param {Array} params.fields - Campos a incluir en el resultado
   * @param {number|string} [params.device_id] - ID del dispositivo (opcional)
   * @returns {Promise<Object>} - Datos procesados para gráficos
   */
  async getGraphData(params) {
    try {
      const response = await apiService.post('/graph/data', params);
      return response.data;
    } catch (error) {
      console.error('Error al obtener datos para gráficos:', error);
      throw error;
    }
  },

  /**
   * Obtiene datos optimizados para un tipo específico de gráfico
   * @param {Object} params - Parámetros para la consulta
   * @param {number|string} params.model_id - ID del modelo
   * @param {string} params.start_date - Fecha de inicio (formato ISO)
   * @param {string} params.end_date - Fecha de fin (formato ISO)
   * @param {string} params.group_by - Agrupación temporal (hour, day, week, month, year)
   * @param {Array} params.fields - Campos a incluir en el resultado
   * @param {number|string} [params.device_id] - ID del dispositivo (opcional)
   * @param {string} params.chart_type - Tipo de gráfico (barras, lineas, pastel, etc.)
   * @returns {Promise<Object>} - Datos optimizados para el tipo de gráfico
   */
  async getOptimizedChartData(params) {
    try {
      const response = await apiService.post('/graph/optimized', params);
      return response.data;
    } catch (error) {
      console.error('Error al obtener datos optimizados para gráficos:', error);
      throw error;
    }
  },

  /**
   * Limpia el caché de datos de gráficos en el servidor
   * @param {string} [type='all'] - Tipo de caché a limpiar ('all', 'graphableFields', 'graphData')
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async clearCache(type = 'all') {
    try {
      const response = await apiService.get(`/graph/clear-cache?type=${type}`);
      return response.data;
    } catch (error) {
      console.error('Error al limpiar caché de gráficos:', error);
      throw error;
    }
  }
};

export default graphService;
