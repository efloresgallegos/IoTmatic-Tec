import DeviceModel from "../models/deviceModels.model.js";
import Device from "../models/devices.model.js";
import Model from "../models/models.model.js";

const getDeviceModels = async (req, res) => {
    try {
        const deviceModels = await DeviceModel.findAll();
        res.json(deviceModels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const createDeviceModel = async (req, res) => {
    const { model_id, device_id } = req.body;

    try {
        if (await Model.findByPk(model_id) === null) {
            return res.status(404).json({ error: "Model not found" });
        }
        if (await Device.findByPk(device_id) === null) {
            return res.status(404).json({ error: "Device not found" });
        }
        const newDeviceModel = await DeviceModel.create({ model_id, device_id });
        return res.status(201).json(newDeviceModel);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const updateDeviceModel = async (req, res) => {
    const { id } = req.params;
    const { model_id, device_id } = req.body;
    try {
        const deviceModel = await DeviceModel.findByPk(id);
        if (!deviceModel) {
            return res.status(404).json({ error: "Device Model not found" });
        }
        deviceModel.model_id = model_id;
        deviceModel.device_id = device_id;
        await deviceModel.save();
        return res.status(200).json(deviceModel);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const deleteDeviceModel = async (req, res) => {
    const { id } = req.params;
    try {
        const deviceModel = await DeviceModel.findByPk(id);
        if (!deviceModel) {
            return res.status(404).json({ error: "Device Model not found" });
        }
        await deviceModel.destroy();
        return res.status(204).json();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const patchDeviceModel = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const deviceModel = await DeviceModel.findByPk(id);
        if (!deviceModel) {
            return res.status(404).json({ error: "Device Model not found" });
        }
        await deviceModel.update(updateData);
        return res.status(200).json(deviceModel);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getDeviceModelById = async (req, res) => {
    try {
        const deviceModel = await DeviceModel.findByPk(req.params.id);
        if (!deviceModel) {
            return res.status(404).json({ error: "Device Model not found" });
        }
        return res.status(200).json(deviceModel);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getDeviceModelsByModel = async (req, res) => {
    const { model_id } = req.params;
    try {
        const deviceModels = await DeviceModel.findAll({ where: { model_id } });
        return res.status(200).json(deviceModels);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getDeviceModelsByDevice = async (req, res) => {
    const { device_id } = req.params;
    try {
        const deviceModels = await DeviceModel.findAll({ where: { device_id } });
        return res.status(200).json(deviceModels);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getDeviceModelsByModelAndDevice = async (req, res) => {
    const { model_id, device_id } = req.params;
    try {
        const deviceModels = await DeviceModel.findAll({ where: { model_id, device_id } });
        return res.status(200).json(deviceModels);
    } catch (error) {
        return res.status(500).json({ error: error.message });
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
