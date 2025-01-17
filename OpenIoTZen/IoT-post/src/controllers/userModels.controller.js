import User from "../models/users.model.js";
import Model from "../models/models.model.js";

const createUserModel = async (req, res) => {
    const { user_id, model_id } = req.body;
    try {
        const user = await User.findByPk(user_id);
        const model = await Model.findByPk(model_id);
        if (!user || !model) {
            return res.status(404).json({ error: "User or model not found" });
        }
        const existingRelation = await UserModels.findOne({ where: { user_id, model_id } });
        if (existingRelation) {
            return res.status(400).json({ error: "User-Model relation already exists" });
        }
        await user.addModel(model);
        return res.status(201).json({ message: "User model created" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


const deleteUserModel = async (req, res) => {
    const { user_id, model_id } = req.body;
    try {
        const user = await User.findByPk(user_id);
        const model = await Model.findByPk(model_id);
        if (!user || !model) {
            return res.status(404).json({ error: "User or model not found" });
        }
        await user.removeModel(model);
        return res.status(200).json({ message: "User model deleted" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getUserModelsfromUser = async (req, res) => {
    const { user_id } = req.params;
    try {
        const user = await User.findByPk(user_id, {
            include: Model
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(200).json(user.models);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getUserModelsfromModel = async (req, res) => {
    const { model_id } = req.params;
    try {
        const model = await Model.findByPk(model_id, {
            include: User
        });
        if (!model) {
            return res.status(404).json({ error: "Model not found" });
        }
        return res.status(200).json(model.users);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export default { createUserModel, deleteUserModel, getUserModelsfromUser, getUserModelsfromModel };