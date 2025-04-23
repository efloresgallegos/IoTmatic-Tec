import { models } from '../models/data/index.js';
import modelsModel from '../models/models.model.js';
import { jsons } from '../jsons/index.js';
import DeviceModel from '../models/devices.model.js';
import { Op } from 'sequelize';

// Cache para almacenar resultados de consultas frecuentes
const cache = {
  graphableFields: {},  // Almacena campos graficables por modelo
  graphData: {},       // Almacena datos de gráficos con TTL
  lastUpdated: {},     // Registro de última actualización
};

// Tiempo de vida del caché en milisegundos (5 minutos)
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Obtiene el nombre del modelo a partir de su ID
 * @param {number} model_id - ID del modelo
 * @returns {Promise<string>} - Nombre del modelo
 */
const getModelName = async (model_id) => {
  const model = await modelsModel.findByPk(Number(model_id));
  if (!model) {
    return null;
  }
  return model.name;
};

/**
 * Obtiene los campos que se pueden graficar para un modelo específico
 * @param {number} model_id - ID del modelo
 * @returns {Promise<Array>} - Array con los nombres de los campos graficables
 */
const getGraphableFields = async (model_id) => {
  // Verificar si está en caché y es válido
  const cacheKey = `model_${model_id}`;
  if (cache.graphableFields[cacheKey] && 
      (Date.now() - cache.lastUpdated[cacheKey] < CACHE_TTL)) {
    console.log('Usando campos graficables desde caché');
    return cache.graphableFields[cacheKey];
  }

  try {
    const modelName = await getModelName(model_id);
    if (!modelName) {
      throw new Error('Modelo no encontrado');
    }
    
    const jsonModel = jsons.find(json => json.name === modelName);
    if (!jsonModel) {
      throw new Error('JSON del modelo no encontrado');
    }

    const graphableData = [];
    const excludeKeys = ['model_id', 'device_id', 'user_id'];

    // Función para obtener las claves de valores numéricos
    const getNumericKeys = (fields) => {
      const numericTypes = ['Float', 'Number', 'Integer']; // Tipos de datos numéricos
      return fields
        .filter(field => numericTypes.includes(field.type) && !excludeKeys.includes(field.name))
        .map(field => field.name);
    };

    // Extraemos las claves numéricas del JSON
    const numericKeys = getNumericKeys(jsonModel.fields);
    graphableData.push(...numericKeys);

    // Guardar en caché
    cache.graphableFields[cacheKey] = graphableData;
    cache.lastUpdated[cacheKey] = Date.now();

    return graphableData;
  } catch (error) {
    console.error('Error al obtener campos graficables:', error);
    throw new Error(error.message);
  }
};

/**
 * Procesa datos para agruparlos por período de tiempo
 * @param {Array} data - Datos a procesar
 * @param {string} groupBy - Criterio de agrupación (day, month, year)
 * @param {Array} fields - Campos a incluir en el resultado
 * @returns {Array} - Datos procesados y agrupados
 */
const processDataByTimeGroup = (data, groupBy, fields) => {
  if (!data || !data.length) return [];

  const result = {};
  
  data.forEach(item => {
    // Convertir a objeto plano si es un modelo Sequelize
    const plainItem = item.toJSON ? item.toJSON() : item;
    
    // Obtener la fecha y formatearla según el criterio de agrupación
    const date = new Date(plainItem.createdAt);
    let groupKey;
    
    switch(groupBy) {
      case 'day':
        groupKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        break;
      case 'month':
        groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
        break;
      case 'year':
        groupKey = `${date.getFullYear()}`; // YYYY
        break;
      default:
        groupKey = date.toISOString().split('T')[0]; // Default to day
    }
    
    // Inicializar el grupo si no existe
    if (!result[groupKey]) {
      result[groupKey] = {
        date: groupKey,
      };
      
      // Inicializar los campos con 0
      fields.forEach(field => {
        result[groupKey][field] = 0;
      });
    }
    
    // Sumar los valores para cada campo
    fields.forEach(field => {
      if (plainItem[field] !== undefined && !isNaN(Number(plainItem[field]))) {
        result[groupKey][field] += Number(plainItem[field]);
      }
    });
  });
  
  // Convertir el objeto a un array ordenado por fecha
  return Object.values(result).sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Obtiene y procesa datos para gráficos
 * @param {Object} params - Parámetros para la consulta
 * @param {number} params.model_id - ID del modelo
 * @param {string} params.start_date - Fecha de inicio (YYYY-MM-DD)
 * @param {string} params.end_date - Fecha de fin (YYYY-MM-DD)
 * @param {string} params.group_by - Criterio de agrupación (day, month, year)
 * @param {Array} params.fields - Campos a incluir en el resultado
 * @param {number} params.device_id - ID del dispositivo (opcional)
 * @returns {Promise<Array>} - Datos procesados para gráficos
 */
const getGraphData = async (params) => {
  const { model_id, start_date, end_date, group_by, fields, device_id } = params;
  
  // Crear una clave única para el caché
  const cacheKey = `graph_${model_id}_${device_id || 'all'}_${start_date}_${end_date}_${group_by}_${fields.join('_')}`;
  
  // Verificar si está en caché y es válido
  if (cache.graphData[cacheKey] && 
      (Date.now() - cache.lastUpdated[cacheKey] < CACHE_TTL)) {
    console.log('Usando datos de gráfico desde caché');
    return cache.graphData[cacheKey];
  }
  
  try {
    const modelName = await getModelName(model_id);
    if (!modelName) {
      throw new Error('Modelo no encontrado');
    }
    
    // Obtener el modelo de datos
    const dataModel = models[modelName]?.default;
    if (!dataModel) {
      throw new Error(`Modelo "${modelName}" no encontrado en los modelos cargados`);
    }
    
    // Preparar las fechas
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    endDate.setHours(23, 59, 59, 999); // Incluir todo el día final
    
    // Construir la consulta
    const query = {
      where: {
        createdAt: { [Op.between]: [startDate, endDate] }
      }
    };
    
    // Añadir filtro por dispositivo si se proporciona
    if (device_id) {
      query.where.device_id = device_id;
    }
    
    // Ejecutar la consulta
    const data = await dataModel.findAll(query);
    
    // Procesar los datos según el criterio de agrupación
    const processedData = processDataByTimeGroup(data, group_by, fields);
    
    // Guardar en caché
    cache.graphData[cacheKey] = processedData;
    cache.lastUpdated[cacheKey] = Date.now();
    
    return processedData;
  } catch (error) {
    console.error('Error al obtener datos para gráficos:', error);
    throw new Error(error.message);
  }
};

/**
 * Transforma los datos para diferentes tipos de visualizaciones
 * @param {Array} data - Datos a transformar
 * @param {string} chartType - Tipo de gráfico (barras, lineas, pastel, etc.)
 * @param {Array} fields - Campos a incluir
 * @returns {Object} - Datos transformados según el tipo de gráfico
 */
const transformDataForChartType = (data, chartType, fields) => {
  if (!data || !data.length) return { data: [] };
  
  switch(chartType) {
    case 'barras':
      return {
        data: data.map(item => ({
          barra: item.date,
          ...fields.reduce((acc, field) => {
            acc[field] = item[field];
            return acc;
          }, {})
        }))
      };
      
    case 'lineas':
      return {
        data: data.map(item => ({
          x: item.date,
          ...fields.reduce((acc, field) => {
            acc[field] = item[field];
            return acc;
          }, {})
        }))
      };
      
    case 'pastel':
      // Para gráficos de pastel, sumamos los valores de cada campo
      const totals = fields.reduce((acc, field) => {
        acc[field] = data.reduce((sum, item) => sum + (item[field] || 0), 0);
        return acc;
      }, {});
      
      return {
        data: Object.entries(totals).map(([key, value]) => ({
          label: key,
          value: value
        }))
      };
      
    case 'areasApiladas':
      return {
        data: data.map(item => ({
          fecha: item.date,
          ...fields.reduce((acc, field) => {
            acc[field] = item[field];
            return acc;
          }, {})
        }))
      };
      
    case 'cajasBigotes':
      // Para gráficos de cajas y bigotes, necesitamos calcular estadísticas
      const boxPlotData = fields.map(field => {
        const values = data.map(item => item[field] || 0).sort((a, b) => a - b);
        const q1Index = Math.floor(values.length * 0.25);
        const q3Index = Math.floor(values.length * 0.75);
        
        return {
          field,
          min: values[0] || 0,
          q1: values[q1Index] || 0,
          median: values[Math.floor(values.length * 0.5)] || 0,
          q3: values[q3Index] || 0,
          max: values[values.length - 1] || 0,
          outliers: []
        };
      });
      
      return { data: boxPlotData };
      
    default:
      return { data };
  }
};

/**
 * Obtiene y procesa datos optimizados para un tipo específico de gráfico
 * @param {Object} params - Parámetros para la consulta
 * @returns {Promise<Object>} - Datos procesados y optimizados para el tipo de gráfico
 */
const getOptimizedChartData = async (params) => {
  const { chartType, ...queryParams } = params;
  
  try {
    // Obtener los datos base
    const data = await getGraphData(queryParams);
    
    // Transformar los datos según el tipo de gráfico
    return transformDataForChartType(data, chartType, queryParams.fields);
  } catch (error) {
    console.error('Error al obtener datos optimizados para gráficos:', error);
    throw new Error(error.message);
  }
};

/**
 * Limpia el caché de datos
 * @param {string} type - Tipo de caché a limpiar ('all', 'graphableFields', 'graphData')
 */
const clearCache = (type = 'all') => {
  if (type === 'all' || type === 'graphableFields') {
    cache.graphableFields = {};
  }
  
  if (type === 'all' || type === 'graphData') {
    cache.graphData = {};
  }
  
  console.log(`Caché de ${type} limpiado`);
};

export default {
  getGraphableFields,
  getGraphData,
  getOptimizedChartData,
  transformDataForChartType,
  clearCache
};