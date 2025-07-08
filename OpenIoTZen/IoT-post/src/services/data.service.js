import { models } from '../models/data/index.js';
import modelsModel from '../models/models.model.js';
import { emitNewData, emitNewAlert } from '../WebSockets/webSocket.server.js';
import { jsons } from '../jsons/index.js';
import DeviceModel from '../models/devices.model.js';
import Filter from '../services/filters.service.js';
import { Op } from 'sequelize';
import { sequelize } from '../db/database.js';

let loadModels;

// Función para recargar los modelos
const reloadModels = async () => {
    try {
        loadModels = await models;
        console.log('Models reloaded:', Object.keys(loadModels));
    } catch (error) {
        console.error('Error reloading models:', error.message);
        throw error;
    }
};

// Cargar modelos inicialmente
(async () => {
    try {
        await reloadModels();
    } catch (error) {
        console.error('Error in initial model loading:', error.message);
    }
})();

const createData = async (data) => {
    try {
        // Ensure models are loaded
        if (!loadModels) {
            throw new Error('Models are not yet loaded');
        }
        console.log(data); 
        const { model_id, device_id } = data;

        // Obtener el nombre del modelo
        const modelName = await getModelName(model_id);
        console.log('Modelos disponibles:', Object.keys(loadModels));
        console.log('Buscando modelo:', modelName);
        
        if (!modelName) {
            throw new Error('Model not found');
        }

        // Acceder correctamente al modelo en loadModels
        const dataModel = loadModels[modelName]?.default; // Access the default export
        if (!dataModel) {
            throw new Error(`Model "${modelName}" not found in loaded models`);
        }

        console.log('Using model:', modelName);

        // Validar existencia del dispositivo
        const device = await DeviceModel.findByPk(device_id);
        if (!device) {
            throw new Error('Device not found');
        }

        // Verificar alertas con el sistema de filtros mejorado
        try {
            const alerts = await Filter.checkFilter(data);
            if (alerts && alerts.length > 0) {
                console.log('Alerts triggered:', alerts);
                emitNewAlert({ device_id, alerts });
                // No retornamos aquí para permitir que los datos se guarden también
            }
        } catch (alertError) {
            console.error('Error checking filters:', alertError);
            // Continuamos con la creación de datos aunque falle la verificación de alertas
        }

        // Crear nuevo dato
        const newData = await dataModel.create(data); // Use the model to create data
        emitNewData({ device_id, data: newData });

        return newData;
    } catch (error) {
        console.error('Error creating data:', error.message);
        console.log(error); 
        throw new Error('Error creating data');
    }
};

const getDatabyModelandDevice = async (model_id, device_id) => {
    try {
        const modelName = await getModelName(model_id);
        if (!modelName) {
            throw new Error('Model not found');
        }

        // Acceder correctamente al modelo en loadModels
        const dataModel = loadModels[modelName]?.default;
        if (!dataModel) {
            throw new Error(`Model "${modelName}" not found in loaded models`);
        }

        const device = await DeviceModel.findByPk(device_id);
        if (!device) {
            throw new Error('Device not found');
        }

        // Obtener solo los atributos definidos en el modelo
        const attributes = Object.keys(dataModel.rawAttributes);
        const data = await dataModel.findAll({ 
            attributes: attributes,
            where: { device_id } 
        });
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

const getDatabyModel = async (model_id) => {
    try {
        const modelName = await getModelName(model_id);
        if (!modelName) {
            throw new Error('Model not found');
        }

        // Acceder correctamente al modelo en loadModels
        const dataModel = loadModels[modelName]?.default;
        if (!dataModel) {
            throw new Error(`Model "${modelName}" not found in loaded models`);
        }

        // Obtener solo los atributos definidos en el modelo
        const attributes = Object.keys(dataModel.rawAttributes);
        const data = await dataModel.findAll({ attributes: attributes });
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

const getDatabyDevice = async (device_id) => {
    try {
        // Verificar que los modelos estén cargados
        if (!loadModels) {
            await reloadModels();
        }

        // Verificar que el dispositivo exista
        const device = await DeviceModel.findByPk(device_id);
        if (!device) {
            throw new Error('Device not found');
        }

        // Obtener el modelo asociado al dispositivo a través de la tabla de unión
        const deviceModelRelation = await sequelize.models.deviceModels.findOne({
            where: { device_id },
            include: [{
                model: sequelize.models.models,
                attributes: ['name']
            }]
        });

        if (!deviceModelRelation || !deviceModelRelation.model) {
            throw new Error('Device has no associated model');
        }

        const modelName = deviceModelRelation.model.name;
        const dataModel = loadModels[modelName]?.default;

        if (!dataModel) {
            throw new Error(`Model "${modelName}" not found in loaded models`);
        }

        // Obtener los atributos definidos en el modelo
        const attributes = Object.keys(dataModel.rawAttributes);
        
        // Realizar la consulta con límite y ordenamiento
        const data = await dataModel.findAll({ 
            attributes: attributes,
            where: { device_id },
            order: [['createdAt', 'DESC']],
            limit: 100 // Limitar a los últimos 100 registros
        });

        return data;
    } catch (error) {
        console.error('Error en getDatabyDevice:', error);
        throw error;
    }
};

const getDatabyDateRange = async (model_id, device_id, start, end) => {
    try {
        const modelName = await getModelName(model_id);
        if (!modelName) {
            throw new Error('Model not found');
        }

        // Acceder correctamente al modelo en loadModels
        const dataModel = loadModels[modelName]?.default;
        if (!dataModel) {
            throw new Error(`Model "${modelName}" not found in loaded models`);
        }

        const device = await DeviceModel.findByPk(device_id);
        if (!device) {
            throw new Error('Device not found');
        }

        // Obtener solo los atributos definidos en el modelo
        const attributes = Object.keys(dataModel.rawAttributes);
        const data = await dataModel.findAll({ 
            attributes: attributes,
            where: { 
                device_id, 
                createdAt: { [Op.between]: [start, end] } 
            } 
        });
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

const getGraphableData = async (model_id) => {
    try {
        const modelName = await getModelName(model_id);
        if (!modelName) {
            throw new Error('Model not found');
        }
        console.log(modelName);
        const jsonModel = jsons.find(json => json.name === modelName);
        if (!jsonModel) {
            throw new Error('Model JSON not found');
        }

        const graphableData = [];

        // Función para obtener las claves de valores numéricos
        const getNumericKeys = (fields) => {
            const numericTypes = ['Float', 'Number']; // Tipos de datos numéricos
            return fields
                .filter(field => numericTypes.includes(field.type) && !excludeKeys.includes(field.name)) // Filtramos solo los campos numéricos y excluimos las claves
                .map(field => field.name); // Extraemos los nombres de los campos
        };

        // Extraemos las claves numéricas del JSON
        const numericKeys = getNumericKeys(jsonModel.fields);
        graphableData.push(...numericKeys);

        return graphableData;
    } catch (error) {
        throw new Error(error.message);
    }
};

const excludeKeys = ['model_id', 'device_id', 'user_id'];   

const getBooleanFields = async (model_id) => {
    try {
        const modelName = await getModelName(model_id);
        if (!modelName) {
            throw new Error('Model not found');
        }
        const jsonModel = jsons.find(json => json.name === modelName);
        if (!jsonModel) {
            throw new Error('Model JSON not found');
        }

        const booleanFields = jsonModel.fields
            .filter(field => field.type === 'Boolean' && !excludeKeys.includes(field.name))
            .map(field => field.name);

        return booleanFields;
    } catch (error) {
        throw new Error(error.message);
    }
};

const getJsonForPost = async (model_id, device_id, user_id) => {
    try {
        // Obtiene el nombre del modelo
        const model = await modelsModel.findByPk(Number(model_id));
        const modelName = model ? model.name : null;
        if (!modelName) {
            throw new Error('Model not found');
        }

        // Obtiene el JSON correspondiente al modelo
        const jsonModel = jsons.find(json => json.name === modelName);
        if (!jsonModel) {
            throw new Error('Model JSON not found');
        }

        // Valida que el JSON tenga una estructura válida
        if (!jsonModel || !jsonModel.fields || !Array.isArray(jsonModel.fields)) {
            throw new Error('Invalid JSON structure');
        }

        // Transforma el JSON en el formato requerido
        const transformedJson = {
            model_id: model_id,
            device_id: device_id,
            user_id: user_id,
        };

        jsonModel.fields.forEach(field => {
            // Agrega los campos que no sean module_id, device_id ni user_id
            if (!['model_id', 'device_id', 'user_id'].includes(field.name)) {
                transformedJson[field.name] = field.value || null;
            }
        });

        return transformedJson;
    } catch (error) {
        // Manejo de errores
        console.error('Error generating JSON for POST:', error.message);
        throw error;
    }
};

const getLatestData = async (model_id, device_id) => {
    try {
        const modelName = await getModelName(model_id);
        if (!modelName) {
            throw new Error('Model not found');
        }

        // Acceder correctamente al modelo en loadModels
        const dataModel = loadModels[modelName]?.default;
        if (!dataModel) {
            throw new Error(`Model "${modelName}" not found in loaded models`);
        }

        const device = await DeviceModel.findByPk(device_id);
        if (!device) {
            throw new Error('Device not found');
        }

        // Obtener solo los atributos definidos en el modelo
        const attributes = Object.keys(dataModel.rawAttributes);
        const data = await dataModel.findAll({ 
            attributes: attributes,
            where: { device_id }, 
            order: [['createdAt', 'DESC']], 
            limit: 1 
        });
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

const getModelName = async (model_id) => {
    const model = await modelsModel.findByPk(Number(model_id));
    if (!model) {
        return null;
    }
    // Buscar el modelo de forma case-insensitive
    const modelName = model.name;
    const availableModels = Object.keys(loadModels);
    const foundModel = availableModels.find(m => m.toLowerCase() === modelName.toLowerCase());
    return foundModel;
};

export default{
    createData,
    getDatabyModelandDevice,
    getDatabyModel,
    getDatabyDevice,
    getDatabyDateRange,
    getGraphableData,
    getBooleanFields,
    getJsonForPost,
    getLatestData,
    getModelName,
    reloadModels
};