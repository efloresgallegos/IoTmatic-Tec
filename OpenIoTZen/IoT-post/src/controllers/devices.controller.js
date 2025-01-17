import Device from '../models/devices.model.js';
import Type from '../models/types.model.js';

const getDevices = async (req, res) => {
    try {
        const devices = await Device.findAll({
            include: Type
        });
        res.json(devices);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

const getDevicebyId = async (req, res) => {
    try {
        const device = await Device.findByPk(req.params.id, {
            include: Type
        });
        res.json(device);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

const createDevice = async (req, res) => {
    try {
        const device = await Device.create(req.body);
        const type = await Type.findByPk(device.type_id);
        if (!type) {
            return res.status(404).json({
                message: 'Type not found'
            });
        }
        res.json(device);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

const updateDevice = async (req, res) => {
    try {
        const device = await Device.findByPk(req.params.id);
        if (device) {
            await device.update(req.body);
            res.json(device);
        } else {
            res.status(404).json({
                message: 'Device not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

const patchDevice = async (req, res) => {
    try {
        const device = await Device.findByPk(req.params.id);
        if (device) {
            await device.update(req.body);
            res.json(device);
        } else {
            res.status(404).json({
                message: 'Device not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

const deleteDevice = async (req, res) => {
    try {
        const device = await Device.findByPk(req.params.id);
        if (device) {
            await device.destroy();
            res.json();
        } else {
            res.status(404).json({
                message: 'Device not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}


export default { getDevices, getDevicebyId, createDevice, updateDevice, patchDevice, deleteDevice };