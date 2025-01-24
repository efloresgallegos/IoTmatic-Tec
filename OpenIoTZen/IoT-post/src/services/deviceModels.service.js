import DeviceModel from "../models/deviceModels.model.js";
import Device from "../models/devices.model.js";
import Model from "../models/models.model.js";

const getDeviceModels = async () => {
    try {
        return await DeviceModel.findAll();
    } catch (error) {
        throw new Error(error.message);
    }
}

const createDeviceModel = async (model_id, device_id) => {
    try {
        if (await Model.findByPk(model_id) === null) {
            throw new Error("Model not found");
        }
        if (await Device.findByPk(device_id) === null) {
            throw new Error("Device not found");
        }
        return await DeviceModel.create({ model_id, device_id });
    } catch (error) {
        throw new Error(error.message);
    }
}

const updateDeviceModel = async (id, model_id, device_id) => {
    try {
        const deviceModel = await DeviceModel.findByPk(id);
        if (!deviceModel) {
            throw new Error("Device Model not found");
        }
        deviceModel.model_id = model_id;
        deviceModel.device_id = device_id;
        await deviceModel.save();
        return deviceModel;
    } catch (error) {
        throw new Error(error.message);
    }
}

const deleteDeviceModel = async (id) => {
    try {
        const deviceModel = await DeviceModel.findByPk(id);
        if (!deviceModel) {
            throw new Error("Device Model not found");
        }
        await deviceModel.destroy();
    } catch (error) {
        throw new Error(error.message);
    }
}

const patchDeviceModel = async (id, updateData) => {
    try {
        const deviceModel = await DeviceModel.findByPk(id);
        if (!deviceModel) {
            throw new Error("Device Model not found");
        }
        await deviceModel.update(updateData);
        return deviceModel;
    } catch (error) {
        throw new Error(error.message);
    }
}

const getDeviceModelById = async (id) => {
    try {
        const deviceModel = await DeviceModel.findByPk(id);
        if (!deviceModel) {
            throw new Error("Device Model not found");
        }
        return deviceModel;
    } catch (error) {
        throw new Error(error.message);
    }
}

const getDeviceModelsByModel = async (model_id) => {
    try {
        return await DeviceModel.findAll({ where: { model_id } });
    } catch (error) {
        throw new Error(error.message);
    }
}

const getDeviceModelsByDevice = async (device_id) => {
    try {
        return await DeviceModel.findAll({ where: { device_id } });
    } catch (error) {
        throw new Error(error.message);
    }
}

const getDeviceModelsByModelAndDevice = async (model_id, device_id) => {
    try {
        return await DeviceModel.findAll({ where: { model_id, device_id } });
    } catch (error) {
        throw new Error(error.message);
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