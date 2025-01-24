import userDevice from '../models/userDevices.model.js';
import User from '../models/users.model.js';
import Device from '../models/devices.model.js';

const getUserDevices = async () => {
    try {
        const devices = await userDevice.findAll();
        return devices;
    } catch (error) {
        throw new Error(error.message);
    }
}

const createUserDevice = async (data) => {
    try {
        const user = await User.findByPk(data.user_id);
        if (!user) {
            throw new Error("User not found");
        }
        const device = await Device.findByPk(data.device_id);
        if (!device) {
            throw new Error("Device not found");
        }
        const newUserDevice = await userDevice.create(data);
        return newUserDevice;
    } catch (error) {
        throw new Error(error.message);
    }
}

const updateUserDevice = async (id, updateData) => {
    try {
        const device = await userDevice.findByPk(id);
        if (!device) {
            throw new Error("Device not found");
        }
        await device.update(updateData);
        return device;
    } catch (error) {
        throw new Error(error.message);
    }
}

const deleteUserDevice = async (id) => {
    try {
        const device = await userDevice.findByPk(id);
        if (!device) {
            throw new Error("Device not found");
        }
        await device.destroy();
        return;
    } catch (error) {
        throw new Error(error.message);
    }
}

const patchUserDevice = async (id, updateData) => {
    try {
        const device = await userDevice.findByPk(id);
        if (!device) {
            throw new Error("Device not found");
        }
        await device.update(updateData);
        return device;
    } catch (error) {
        throw new Error(error.message);
    }
}

const getUserDevicesfromUser = async (user_id) => {
    try {
        const devices = await userDevice.findAll({ where: { user_id: user_id } });
        return devices;
    } catch (error) {
        throw new Error(error.message);
    }
}

const getUserDevicesfromDevice = async (device_id) => {
    try {
        const devices = await userDevice.findAll({ where: { device_id: device_id } });
        return devices;
    } catch (error) {
        throw new Error(error.message);
    }
}

export default {
    getUserDevices,
    createUserDevice,
    updateUserDevice,
    deleteUserDevice,
    patchUserDevice,
    getUserDevicesfromUser,
    getUserDevicesfromDevice
};