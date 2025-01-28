import { models } from '../models/data/index.js';
import modelsModel from '../models/models.model.js';
import filters from '../controllers/filters.controller.js';
import { emitNewData, emitNewAlert } from '../WebSockets/webSocket.server.js';

const createData = async (data) => {
    try {
        const model_id = data.model_id;
        const device_id = data.device_id;
        const modelName = await getModelName(model_id);

        if (!modelName) {
            throw new Error('Model not found');
        }

        const dataModel = models[modelName];
        if (!dataModel) {
            throw new Error('Model not found');
        }

        const device = await devices.findByPk(device_id);
        if (!device) {
            throw new Error('Device not found');
        }

        const alerts = await filters.checkFilter(model_id, device_id, data);
        if (alerts.length > 0) {
            emitNewAlert({ device_id, alerts });
            return { message: 'Alerts created', alerts };
        }

        const newData = await dataModel.create(data);
        emitNewData({ device_id, data: newData });

        return newData;
    } catch (error) {
        console.error(error);
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

        const device = await devices.findByPk(device_id);
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
        const device = await devices.findByPk(device_id);
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

        const device = await devices.findByPk(device_id);
        if (!device) {
            throw new Error('Device not found');
        }

        const data = await dataModel.findAll({ where: { device_id, createdAt: { [Op.between]: [start, end] } } });
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

const getGraphableData = async (model_id, device_id) => {
    try {
        const modelName = await getModelName(model_id);
        if (!modelName) {
            throw new Error('Model not found');
        }

        const dataModel = models[modelName];
        if (!dataModel) {
            throw new Error('Model not found');
        }

        const device = await devices.findByPk(device_id);
        if (!device) {
            throw new Error('Device not found');
        }

        const data = await dataModel.findAll({ where: { device_id } });
        const graphableData = [];
        const getAllKeys = (obj, parentKey = '') => {
            let keys = new Set();
            for (const key in obj) {
                if (key !== 'id' && key !== 'device_id' && key !== 'createdAt' && key !== 'updatedAt') {
                    if (typeof obj[key] === 'object' && obj[key] !== null) {
                        const nestedKeys = getAllKeys(obj[key], `${parentKey}${key}.`);
                        nestedKeys.forEach(nestedKey => keys.add(nestedKey));
                    } else {
                        keys.add(`${parentKey}${key}`);
                    }
                }
            }
            return keys;
        };

        if (data.length > 0) {
            const keys = getAllKeys(data[0].dataValues);
            graphableData.push(...keys);
        }
        return graphableData;
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

        // Importa dinámicamente el archivo JSON correspondiente
        const jsonPath = `../jsons/${modelName}.json`;
        const jsonModel = await import(jsonPath, { assert: { type: "json" } });

        // Valida que el JSON tenga una estructura válida
        if (!jsonModel || !jsonModel.fields || !Array.isArray(jsonModel.fields)) {
            throw new Error('Invalid JSON structure');
        }

        // Transforma el JSON en el formato requerido
        const transformedJson = {
            module_id: model_id,
            device_id: device_id,
            user_id: user_id,
            sensores: {}
        };

        jsonModel.fields.forEach(field => {
            // Agrega los campos que no sean module_id, device_id ni user_id
            if (!['module_id', 'device_id', 'user_id'].includes(field.name)) {
                transformedJson.sensores[field.name] = field.type.toLowerCase();
            }
        });

        return transformedJson;
    } catch (error) {
        // Manejo de errores
        console.error('Error generating JSON for POST:', error.message);
        throw error;
    }
};


const getModelName = async (model_id) => {
    const model = await modelsModel.findByPk(Number(model_id));
    if (!model) {
        return null;
    }
    return model.name;
};

export default { createData, getDatabyModelandDevice, getDatabyModel, getDatabyDevice, getDatabyDateRange, getGraphableData, getJsonForPost };