import devicesService from '../services/devices.service.js';

const getDevices = async (req, res) => {
    try {
        const devices = await devicesService.getAllDevices();
        res.status(200).json(devices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getDevicebyId = async (req, res) => {
    try {
        const device = await devicesService.getDeviceById(req.params.id);
        if (device) {
            res.status(200).json(device);
        } else {
            res.status(404).json({ message: 'Device not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const createDevice = async (req, res) => {
    try {
        const newDevice = await devicesService.createDevice(req.body);
        res.status(201).json(newDevice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateDevice = async (req, res) => {
    try {
        const updatedDevice = await devicesService.updateDevice(req.params.id, req.body);
        if (updatedDevice) {
            res.status(200).json(updatedDevice);
        } else {
            res.status(404).json({ message: 'Device not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const patchDevice = async (req, res) => {
    try {
        const patchedDevice = await devicesService.patchDevice(req.params.id, req.body);
        if (patchedDevice) {
            res.status(200).json(patchedDevice);
        } else {
            res.status(404).json({ message: 'Device not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteDevice = async (req, res) => {
    try {
        const deletedDevice = await devicesService.deleteDevice(req.params.id);
        if (deletedDevice) {
            res.status(200).json({ message: 'Device deleted successfully' });
        } else {
            res.status(404).json({ message: 'Device not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export default { getDevices, getDevicebyId, createDevice, updateDevice, patchDevice, deleteDevice };