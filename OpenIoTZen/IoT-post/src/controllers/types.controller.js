import typesService from "../services/types.service.js";

const getTypes = async (req, res) => {
    try {
        const types = await typesService.getAllTypes();
        res.status(200).json(types);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getTypeById = async (req, res) => {
    try {
        const type = await typesService.getTypeById(req.params.id);
        if (type) {
            res.status(200).json(type);
        } else {
            res.status(404).json({ message: "Type not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const createType = async (req, res) => {
    try {
        const newType = await typesService.createType(req.body);
        res.status(201).json(newType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateType = async (req, res) => {
    try {
        const updatedType = await typesService.updateType(req.params.id, req.body);
        if (updatedType) {
            res.status(200).json(updatedType);
        } else {
            res.status(404).json({ message: "Type not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteType = async (req, res) => {
    try {
        const deletedType = await typesService.deleteType(req.params.id);
        if (deletedType) {
            res.status(200).json({ message: "Type deleted successfully" });
        } else {
            res.status(404).json({ message: "Type not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const patchType = async (req, res) => {
    try {
        const patchedType = await typesService.patchType(req.params.id, req.body);
        if (patchedType) {
            res.status(200).json(patchedType);
        } else {
            res.status(404).json({ message: "Type not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getDevicesByType = async (req, res) => {
    try {
        const devices = await typesService.getDevicesByType(req.params.id);
        if (devices) {
            res.status(200).json(devices);
        } else {
            res.status(404).json({ message: "Devices not found for this type" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export default { getTypes, getTypeById, createType, updateType, deleteType, patchType, getDevicesByType };