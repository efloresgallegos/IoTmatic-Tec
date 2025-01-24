import userFiltersService from "../services/userFilters.service.js"

const getUserFilters = async (req, res) => {
    try {
        const result = await userFiltersService.getUserFilters();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const createUserFilter = async (req, res) => {
    const { name, description, conditions, model_id, device_id } = req.body;
    const data = { name, description, conditions, model_id, device_id };
    try {
        const result = await userFiltersService.createUserFilter(data);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateUserFilter = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const result = await userFiltersService.updateUserFilter(id, data);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const deleteUserFilter = async (req, res) => {
    const { id } = req.params;
    try {
        await userFiltersService.deleteUserFilter(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const patchUserFilter = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const result = await userFiltersService.patchUserFilter(id, updateData);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getUserFiltersfromUser = async (req, res) => {
    const { user_id } = req.params;
    try {
        const result = await userFiltersService.getUserFiltersfromUser(user_id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getUserFiltersfromFilter = async (req, res) => {
    const { filter_id } = req.params;
    try {
        const result = await userFiltersService.getUserFiltersfromFilter(filter_id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
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