import graphService from '../services/graph.service.js';

/**
 * Obtiene los campos graficables para un modelo específico
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getGraphableFields = async (req, res) => {
  try {
    const model_id = req.params.id;
    const data = await graphService.getGraphableFields(model_id);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error al obtener campos graficables:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Obtiene datos procesados para gráficos
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getGraphData = async (req, res) => {
  try {
    const { model_id, start_date, end_date, group_by, fields, device_id } = req.body;
    
    // Validar parámetros requeridos
    if (!model_id || !start_date || !end_date || !group_by || !fields || !Array.isArray(fields)) {
      return res.status(400).json({ 
        message: 'Parámetros incompletos o inválidos',
        required: ['model_id', 'start_date', 'end_date', 'group_by', 'fields (array)']
      });
    }
    
    const data = await graphService.getGraphData({
      model_id,
      start_date,
      end_date,
      group_by,
      fields,
      device_id
    });
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error al obtener datos para gráficos:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Obtiene datos optimizados para un tipo específico de gráfico
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getOptimizedChartData = async (req, res) => {
  try {
    const { model_id, start_date, end_date, group_by, fields, device_id, chart_type } = req.body;
    
    // Validar parámetros requeridos
    if (!model_id || !start_date || !end_date || !group_by || !fields || !Array.isArray(fields) || !chart_type) {
      return res.status(400).json({ 
        message: 'Parámetros incompletos o inválidos',
        required: ['model_id', 'start_date', 'end_date', 'group_by', 'fields (array)', 'chart_type']
      });
    }
    
    const data = await graphService.getOptimizedChartData({
      model_id,
      start_date,
      end_date,
      group_by,
      fields,
      device_id,
      chartType: chart_type
    });
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error al obtener datos optimizados para gráficos:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Limpia el caché de datos de gráficos
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const clearCache = async (req, res) => {
  try {
    const { type } = req.query;
    graphService.clearCache(type || 'all');
    res.status(200).json({ message: `Caché de ${type || 'all'} limpiado correctamente` });
  } catch (error) {
    console.error('Error al limpiar caché:', error);
    res.status(500).json({ message: error.message });
  }
};

export default {
  getGraphableFields,
  getGraphData,
  getOptimizedChartData,
  clearCache
};