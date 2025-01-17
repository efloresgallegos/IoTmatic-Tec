import Type from "../models/types.model.js";

const getTypes = async (req, res) => {
    try {
        const types = await Type.findAll();
        return res.status(200).json(types);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getTypeById = async (req, res) => {
    try {
        const type = await Type.findByPk(req.params.id);
        if (!type) {
            return res.status(404).json({ error: "Type not found" });
        }
        return res.status(200).json(type);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const createType = async (req, res) => {
    try {
        const type = await Type.create(req.body);
        return res.status(201).json(type);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const updateType = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const type = await Type.findByPk(id);
        if (!type) {
            return res.status(404).json({ error: "Type not found" });
        }
        await type.update(updateData);
        return res.status(200).json(type);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const deleteType = async (req, res) => {
    const { id } = req.params;
    try {
        const type = await Type.findByPk(id);
        if (!type) {
            return res.status(404).json({ error: "Type not found" });
        }
        await type.destroy();
        return res.status(204).json();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const patchType = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const type = await Type.findByPk(id);
        if (!type) {
            return res.status(404).json({ error: "Type not found" });
        }
        await type.update(updateData);
        return res.status(200).json(type);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getDevicesByType = async (req, res) => {
    try {
        const type = await Type.findByPk(req.params.id, { include: 'devices' });
        if (!type) {
            return res.status(404).json({ error: "Type not found" });
        }
        return res.status(200).json(type.devices);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}



export default { getTypes, getTypeById, createType, updateType, deleteType, patchType, getDevicesByType };