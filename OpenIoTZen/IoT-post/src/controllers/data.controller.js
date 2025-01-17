import {models} from '../models/data';
import modelsModel from '../models/models.model';
import filters from '../controllers/filters.controller';

const createData = async (req, res) => {
    try {
        const data = req.body.data;
        const model_id = data.model_id;
        const device_id = data.device_id;
        const model = await modelsModel.findByPk(model_id);
        if (!model) {
            return res.status(404).json({ message: 'Model not found' });
        }
        const modelName = model.name;
        const dataModel = models[modelName];
        if (!dataModel) {
            return res.status(404).json({ message: 'Model not found' });
        }
        const device = await devices.findByPk(device_id);
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }
        const alerts = filters.checkFilter(model_id, device_id, data);
        if (alerts.length > 0) {
            return res.status(200).json({ message: 'Alerts created', alerts });
        }
        const newData = await dataModel.create(data);
        return res.status(201).json(newData);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const getDatabyModelandDevice = async (req, res) => {
    try {
        const model_id = req.body.model_id;
        const device_id = req.body.device_id;
        const model = await modelsModel.findByPk(model_id);
        if (!model) {
            return res.status(404).json({ message: 'Model not found' });
        }
        const modelName = model.name;
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
        const model = await modelsModel.findByPk(model_id);
        if (!model) {
            return res.status(404).json({ message: 'Model not found' });
        }
        const modelName = model.name;
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
