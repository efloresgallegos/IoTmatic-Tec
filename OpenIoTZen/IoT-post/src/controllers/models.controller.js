import Model from "../models/models.model.js";


const createModel = async (req, res) => {
    const { name } = req.body;

    try {
        const model = await Model.create({ name });
        res.status(201).json(model);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const getModels = async (req, res) => {
    try {
        const models = await Model.findAll();
        res.json(models);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const getModelById = async (req, res) => {
    const { id } = req.params;

    try {
        const model = await Model.findByPk(id);
        res.json(model);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const updateModel = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const model = await Model.findByPk(id);
        model.name = name;
        await model.save();
        res.json(model);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const deleteModel = async (req, res) => {
    const { id } = req.params;

    try {
        const model = await Model.findByPk(id);
        await model.destroy();
        res.json({ message: 'Model deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export default { createModel, getModels, getModelById, updateModel, deleteModel };