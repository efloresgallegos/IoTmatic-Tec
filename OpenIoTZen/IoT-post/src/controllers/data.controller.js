import {models} from '../models/data/index.js';
import modelsModel from '../models/models.model.js';
import filters from '../controllers/filters.controller.js';
import { emitNewData, emitNewAlert } from '../WebSockets/webSocket.server.js';

const createData = async (req, res) => {
    try {
      const data = req.body.data;
      const model_id = data.model_id;
      const device_id = data.device_id;
      const modelName = await getModelName(model_id);
  
      if (!modelName) {
        return res.status(404).json({ message: 'Model not found' });
      }
  
      const dataModel = models[modelName];
      if (!dataModel) {
        return res.status(404).json({ message: 'Model not found' });
      }
  
      const device = await devices.findByPk(device_id);
      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }
  
      const alerts = await filters.checkFilter(model_id, device_id, data);
      if (alerts.length > 0) {
        // Emitir alerta a los clientes WebSocket
        emitNewAlert({ device_id, alerts });
        return res.status(200).json({ message: 'Alerts created', alerts });
      }
  
      const newData = await dataModel.create(data);
      
      emitNewData({ device_id, data: newData });
  
      return res.status(201).json(newData);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error creating data' });
    }
  };

const getDatabyModelandDevice = async (req, res) => {
    try {
        const model_id = req.body.model_id;
        const device_id = req.body.device_id;
        const modelName = await getModelName(model_id);
        if (!modelName) {
            return res.status(404).json({ message: 'Model not found' });
        }
        const dataModel = models[modelName];
        if (!dataModel) {
            return res.status(404).json({ message: 'Model not found' });
        }
        const device = await devices.findByPk(device_id);
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }
        const data = await dataModel.findAll({ where: { device_id } });
        return res.status(200).json(data);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const getDatabyModel = async (req, res) => {
    try {
        const model_id = req.body.model_id;
        const modelName = await getModelName(model_id);
        if (!modelName) {
            return res.status(404).json({ message: 'Model not found' });
        }
        const dataModel = models[modelName];
        if (!dataModel) {
            return res.status(404).json({ message: 'Model not found' });
        }
        const data = await dataModel.findAll();
        return res.status(200).json(data);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const getDatabyDevice = async (req, res) => {
    try {
        const device_id = req.body.device_id;
        const device = await devices.findByPk(device_id);
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
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
            return res.status(404).json({ message: 'Data not found' });
        }
        return res.status(200).json(fullData);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const getDatabyDateRange = async (req, res) => {
    try {
        const model_id = req.body.model_id;
        const device_id = req.body.device_id;
        const modelName = await getModelName(model_id);
        if (!modelName) {
            return res.status(404).json({ message: 'Model not found' });
        }
        const dataModel = models[modelName];
        if (!dataModel) {
            return res.status(404).json({ message: 'Model not found' });
        }
        const device = await devices.findByPk(device_id);
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }
        const start = req.body.start;
        const end = req.body.end;
        const data = await dataModel.findAll({ where: { device_id, createdAt: { [Op.between]: [start, end] } } });
        return res.status(200).json(data);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const getGraphableData = async (req, res) => {
    try {
        const model_id = req.body.model_id;
        const device_id = req.body.device_id;
        const modelName = await getModelName(model_id);
        if (!modelName) {
            return res.status(404).json({ message: 'Model not found' });
        }
        const dataModel = models[modelName];
        if (!dataModel) {
            return res.status(404).json({ message: 'Model not found' });
        }
        const device = await devices.findByPk(device_id);
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }
        const data = await dataModel.findAll({ where: { device_id } });
        const graphableData = [];
        const uniqueKeys = new Set();
        const getAllKeys = (obj, parentKey = '') => {
            let keys = new Set();
            for (const key in obj) {
                if (key !== 'id' && key !== 'device_id' && key !== 'createdAt' && key !== 'updatedAt') {
                    if (typeof obj[key] === 'object' && obj[key] !== null) {
                        // For nested objects, recursively get keys with parent key prefix
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
        return res.status(200).json(graphableData);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const getModelName = async (model_id) => {
    const model = await modelsModel.findByPk(model_id);
    if (!model) {
        return null;
    }
    return model.name;
}

export default { createData, getDatabyModelandDevice, getDatabyModel, getDatabyDevice, getDatabyDateRange, getGraphableData };