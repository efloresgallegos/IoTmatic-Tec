import { models } from '../models/data/index.js';
import modelsModel from '../models/models.model.js';
import { emitNewData, emitNewAlert } from '../WebSockets/webSocket.server.js';
import { jsons } from '../jsons/index.js';
import DeviceModel from '../models/devices.model.js';
import Filter from '../services/filters.service.js';

let loadModels;

(async () => {
    try {
        loadModels = await models;
        console.log('Models loaded:', loadModels);
    } catch (error) {
        console.error('Error loading models:', error.message);
    }
})();

const createData = async (data) => {
    try {
        // Ensure models are loaded
        if (!loadModels) {
            throw new Error('Models are not yet loaded');
        }

        const { model_id, device_id } = data;

        // Obtener el nombre del modelo
        const modelName = await getModelName(model_id);
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

        // Verificar alertas
        // const alerts = await Filter.checkFilter(data);
        // if (alerts.length > 0) {
        //     emitNewAlert({ device_id, alerts });
        //     return { message: 'Alerts created', alerts };
        // }

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

        const dataModel = models[modelName];
        if (!dataModel) {
            throw new Error('Model not found');
        }

        const device = await DeviceModel.findByPk(device_id);
        if (!device) {
            throw new Error('Device not found');
        }

        const data = await dataModel.findAll({ where: { device_id } });
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

        const dataModel = models[modelName];
        if (!dataModel) {
            throw new Error('Model not found');
        }

        const data = await dataModel.findAll();
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

const getDatabyDevice = async (device_id) => {
    try {
        const device = await DeviceModel.findByPk(device_id);
        if (!device) {
            throw new Error('Device not found');
        }

        let fullData = [];
        for (const modelName in models) {
            const dataModel = models[modelName];
            const data = await dataModel.findAll({ where: { device_id } });
            if (data.length > 0) {
                fullData = fullData.concat(data);
            }
        }

        if (fullData.length === 0) {
            throw new Error('Data not found');
        }

        return fullData;
    } catch (error) {
        throw new Error(error.message);
    }
};

const getDatabyDateRange = async (model_id, device_id, start, end) => {
    try {
        const modelName = await getModelName(model_id);
        if (!modelName) {
            throw new Error('Model not found');
        }

        const dataModel = models[modelName];
        if (!dataModel) {
            throw new Error('Model not found');
        }

        const device = await DeviceModel.findByPk(device_id);
        if (!device) {
            throw new Error('Device not found');
        }

        const data = await dataModel.findAll({ where: { device_id, createdAt: { [Op.between]: [start, end] } } });
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

        const dataModel = models[modelName];
        if (!dataModel) {
            throw new Error('Model not found');
        }

        const device = await DeviceModel.findByPk(device_id);
        if (!device) {
            throw new Error('Device not found');
        }

        const data = await dataModel.findAll({ where: { device_id }, order: [['createdAt', 'DESC']], limit: 1 });
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
    return model.name;
};

export default { createData, getDatabyModelandDevice, getDatabyModel, getDatabyDevice, getDatabyDateRange, getGraphableData, getJsonForPost, getBooleanFields };