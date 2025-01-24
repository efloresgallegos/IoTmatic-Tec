import User from "../models/users.model.js";
import Model from "../models/models.model.js";
import UserModels from "../models/userModels.model.js";


const createUserModel = async (user_id, model_id) => {
    try {
        const user = await User.findByPk(user_id);
        const model = await Model.findByPk(model_id);
        if (!user || !model) {
            throw new Error("User or model not found");
        }
        const existingRelation = await UserModels.findOne({ where: { user_id, model_id } });
        if (existingRelation) {
            throw new Error("User-Model relation already exists");
        }
        await user.addModel(model);
        return { message: "User model created" };
    } catch (error) {
        throw new Error(error.message);
    }
};

const deleteUserModel = async (user_id, model_id) => {
    try {
        const user = await User.findByPk(user_id);
        const model = await Model.findByPk(model_id);
        if (!user || !model) {
            throw new Error("User or model not found");
        }
        await user.removeModel(model);
        return { message: "User model deleted" };
    } catch (error) {
        throw new Error(error.message);
    }
};

const getUserModelsfromUser = async (user_id) => {
    try {
        const user = await User.findByPk(user_id, {
            include: Model
        });
        if (!user) {
            throw new Error("User not found");
        }
        return user.models;
    } catch (error) {
        throw new Error(error.message);
    }
};

const getUserModelsfromModel = async (model_id) => {
    try {
        const model = await Model.findByPk(model_id, {
            include: User
        });
        if (!model) {
            throw new Error("Model not found");
        }
        return model.users;
    } catch (error) {
        throw new Error(error.message);
    }
};

export default { createUserModel, deleteUserModel, getUserModelsfromUser, getUserModelsfromModel };