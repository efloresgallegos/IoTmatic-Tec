import Model from "../models/models.model.js";

const createModel = async (data) => {
    const { name } = data;

    try {
        const model = await Model.create({ name });
        return model;
    } catch (error) {
        throw new Error(error.message);
    }
}

const getModels = async () => {
    try {
        const models = await Model.findAll();
        return models;
    } catch (error) {
        throw new Error(error.message);
    }
}

const getModelById = async (id) => {
    try {
        const model = await Model.findByPk(id);
        return model;
    } catch (error) {
        throw new Error(error.message);
    }
}

const updateModel = async (id, data) => {
    const { name } = data;

    try {
        const model = await Model.findByPk(id);
        model.name = name;
        await model.save();
        return model;
    } catch (error) {
        throw new Error(error.message);
    }
}

const deleteModel = async (id) => {
    try {
        const model = await Model.findByPk(id);
        await model.destroy();
        return { message: 'Model deleted' };
    } catch (error) {
        throw new Error(error.message);
    }
}

export default { createModel, getModels, getModelById, updateModel, deleteModel };