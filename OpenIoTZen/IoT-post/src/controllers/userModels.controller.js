import userModelsService from "../services/userModels.service.js";


const createUserModel = async (req, res) => {
    try {
        const { user_id, model_id } = req.body;
        const result = await userModelsService.createUserModel(user_id, model_id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const deleteUserModel = async (req, res) => {
    try {
        const { user_id, model_id } = req.body;
        const result = await userModelsService.deleteUserModel(user_id, model_id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const getUserModelsfromUser = async (req, res) => {
    const { user_id } = req.params;
    try {
        const result = await userModelsService.getUserModelsfromUser(user_id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const getUserModelsfromModel = async (req, res) => {
    const { model_id } = req.params;
    try {
        const result = await userModelsService.getUserModelsfromModel(model_id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export default { createUserModel, deleteUserModel, getUserModelsfromUser, getUserModelsfromModel };