import userDevice from '../models/userDevices.model.js';
import User from '../models/users.model.js';
import Device from '../models/devices.model.js';

const getUserDevices = async (req, res) => {
    try {
        const devices = await userDevice.findAll();
        return res.status(200).json(devices);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const createUserDevice = async (req, res) => {
    try {
        const user = await User.findByPk(device.user_id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const device = await Device.findByPk(device.device_id);
        if (!device) {
            return res.status(404).json({ error: "Device not found" });
        }
        const userDevice = await userDevice.create(req.body);
        return res.status(201).json(device);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const updateUserDevice = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const device = await userDevice.findByPk(id);
        if (!device) {
            return res.status(404).json({ error: "Device not found" });
        }
        await device.update(updateData);
        return res.status(200).json(device);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const deleteUserDevice = async (req, res) => {
    const { id } = req.params;
    try {
        const device = await userDevice.findByPk(id);
        if (!device) {
            return res.status(404).json({ error: "Device not found" });
        }
        await device.destroy();
        return res.status(204).json();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const patchUserDevice = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const device = await userDevice.findByPk(id);
        if (!device) {
            return res.status(404).json({ error: "Device not found" });
        }
        await device.update(updateData);
        return res.status(200).json(device);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getUserDevicesfromUser = async (req, res) => {
    const { user_id } = req.params;
    try {
        const devices = await userDevice.findAll({ where: { user_id: user_id } });
        return res.status(200).json(devices);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getUserDevicesfromDevice = async (req, res) => {
    const { device_id } = req.params;
    try {
        const devices = await userDevice.findAll({ where: { device_id: device_id } });
        return res.status(200).json(devices);
    } catch (error) {
        return res.status(500).json({ error: error.message });
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

