import Device from '../models/devices.model.js';
import Type from '../models/types.model.js';

const getDevices = async () => {
    try {
        const devices = await Device.findAll({
            include: Type
        });
        return devices;
    } catch (error) {
        throw new Error(error.message);
    }
}

const getDevicebyId = async (id) => {
    try {
        const device = await Device.findByPk(id, {
            include: Type
        });
        return device;
    } catch (error) {
        throw new Error(error.message);
    }
}

const createDevice = async (deviceData) => {
    try {
        const device = await Device.create(deviceData);
        const type = await Type.findByPk(device.type_id);
        if (!type) {
            throw new Error('Type not found');
        }
        return device;
    } catch (error) {
        throw new Error(error.message);
    }
}

const updateDevice = async (id, deviceData) => {
    try {
        const device = await Device.findByPk(id);
        if (device) {
            await device.update(deviceData);
            return device;
        } else {
            throw new Error('Device not found');
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

const patchDevice = async (id, deviceData) => {
    try {
        const device = await Device.findByPk(id);
        if (device) {
            await device.update(deviceData);
            return device;
        } else {
            throw new Error('Device not found');
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

const deleteDevice = async (id) => {
    try {
        const device = await Device.findByPk(id);
        if (device) {
            await device.destroy();
            return;
        } else {
            throw new Error('Device not found');
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

export default { getDevices, getDevicebyId, createDevice, updateDevice, patchDevice, deleteDevice };