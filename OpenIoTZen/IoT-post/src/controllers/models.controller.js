import modelsService from "../services/models.service.js";

const createModel = async (req, res) => {
    const { name } = req.body;

    try {
        const model = await modelsService.createModel({ name });
        res.status(201).json(model);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const getModels = async (req, res) => {
    try {
        const models = await modelsService.getModels();
        res.json(models);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const getModelById = async (req, res) => {
    const { id } = req.params;

    try {
        const model = await modelsService.getModelById(id);
        res.json(model);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const updateModel = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const model = await modelsService.updateModel(id, { name });
        res.json(model);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const deleteModel = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await modelsService.deleteModel(id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const getFullJson = async (req, res) => {
    const { id } = req.params;

    try {
        const json = await modelsService.getFullJson(id);
        res.json(json);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export default { createModel, getModels, getModelById, updateModel, deleteModel, getFullJson };