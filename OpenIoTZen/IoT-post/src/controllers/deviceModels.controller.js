import deviceModelsService from '../services/deviceModels.service.js';

const getDeviceModels = async (req, res) => {
    try {
        const deviceModels = await deviceModelsService.getDeviceModels();
        res.status(200).json(deviceModels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const createDeviceModel = async (req, res) => {
    try {
        const { model_id, device_id } = req.body;
        const newDeviceModel = await deviceModelsService.createDeviceModel(model_id, device_id);
        res.status(201).json(newDeviceModel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateDeviceModel = async (req, res) => {
    try {
        const { model_id, device_id } = req.body;
        const updatedDeviceModel = await deviceModelsService.updateDeviceModel(req.params.id, model_id, device_id);
        res.status(200).json(updatedDeviceModel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteDeviceModel = async (req, res) => {
    try {
        await deviceModelsService.deleteDeviceModel(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const patchDeviceModel = async (req, res) => {
    try {
        const patchedDeviceModel = await deviceModelsService.patchDeviceModel(req.params.id, req.body);
        res.status(200).json(patchedDeviceModel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getDeviceModelById = async (req, res) => {
    try {
        const deviceModel = await deviceModelsService.getDeviceModelById(req.params.id);
        res.status(200).json(deviceModel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getDeviceModelsByModel = async (req, res) => {
    try {
        const deviceModels = await deviceModelsService.getDeviceModelsByModel(req.params.model_id);
        res.status(200).json(deviceModels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getDeviceModelsByDevice = async (req, res) => {
    try {
        const deviceModels = await deviceModelsService.getDeviceModelsByDevice(req.params.device_id);
        res.status(200).json(deviceModels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getDeviceModelsByModelAndDevice = async (req, res) => {
    try {
        const deviceModels = await deviceModelsService.getDeviceModelsByModelAndDevice(req.params.model_id, req.params.device_id);
        res.status(200).json(deviceModels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export default {
    getDeviceModels,
    createDeviceModel,
    updateDeviceModel,
    deleteDeviceModel,
    patchDeviceModel,
    getDeviceModelById,
    getDeviceModelsByModel,
    getDeviceModelsByDevice,
    getDeviceModelsByModelAndDevice
};
