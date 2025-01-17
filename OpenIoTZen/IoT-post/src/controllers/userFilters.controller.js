import userFilters from "../models/userFilters.model.js";
import Model from "../models/models.model.js";
import Device from "../models/devices.model.js";


const getUserFilters = async (req, res) => {
    try {
        const filters = await userFilters.findAll();
        return res.status(200).json(filters);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const createUserFilter = async (req, res) => {
    const { name, description, conditions, model_id, device_id } = req.body;
    try {
        if(await Model.findByPk(model_id) === null){
            return res.status(404).json({ error: "Model not found" });
        }
        if(await Device.findByPk(device_id) === null){
            return res.status(404).json({ error: "Device not found" });
        }
        const newFilter = await userFilters.create({ name, description, conditions, model_id, device_id });
        return res.status(201).json(newFilter);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const updateUserFilter = async (req, res) => {
    const { id } = req.params;
    const { name, description, conditions, model_id, device_id } = req.body;
    try {
        const filter = await userFilters.findByPk(id);
        if (!filter) {
            return res.status(404).json({ error: "Filter not found" });
        }
        filter.name = name;
        filter.description = description;
        filter.conditions = conditions;
        filter.model_id = model_id;
        filter.device_id = device_id;
        await filter.save();
        return res.status(200).json(filter);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const deleteUserFilter = async (req, res) => {
    const { id } = req.params;
    try {
        const filter = await userFilters.findByPk(id);
        if (!filter) {
            return res.status(404).json({ error: "Filter not found" });
        }
        await filter.destroy();
        return res.status(204).json();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const patchUserFilter = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const filter = await userFilters.findByPk(id);
        if (!filter) {
            return res.status(404).json({ error: "Filter not found" });
        }
        await filter.update(updateData);
        return res.status(200).json(filter);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getUserFiltersfromUser = async (req, res) => {
    const { user_id } = req.params;
    try {
        const filters = await userFilters.findAll({
            where: {
                user_id: user_id
            }
        });
        return res.status(200).json(filters);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getUserFiltersfromFilter = async (req, res) => {
    const { filter_id } = req.params;
    try {
        const filters = await userFilters.findAll({
            where: {
                filter_id: filter_id
            }
        });
        return res.status(200).json(filters);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export default {
    getUserFilters,
    createUserFilter,
    updateUserFilter,
    deleteUserFilter,
    patchUserFilter,
    getUserFiltersfromUser,
    getUserFiltersfromFilter
};