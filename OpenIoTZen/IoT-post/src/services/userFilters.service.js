import userFilters from "../models/userFilters.model.js";
import Model from "../models/models.model.js";
import Device from "../models/devices.model.js";

const getUserFilters = async () => {
    try {
        return await userFilters.findAll();
    } catch (error) {
        throw new Error(error.message);
    }
}

const createUserFilter = async (data) => {
    const { name, description, conditions, model_id, device_id } = data;
    try {
        if(await Model.findByPk(model_id) === null){
            throw new Error("Model not found");
        }
        if(await Device.findByPk(device_id) === null){
            throw new Error("Device not found");
        }
        return await userFilters.create({ name, description, conditions, model_id, device_id });
    } catch (error) {
        throw new Error(error.message);
    }
}

const updateUserFilter = async (id, data) => {
    const { name, description, conditions, model_id, device_id } = data;
    try {
        const filter = await userFilters.findByPk(id);
        if (!filter) {
            throw new Error("Filter not found");
        }
        filter.name = name;
        filter.description = description;
        filter.conditions = conditions;
        filter.model_id = model_id;
        filter.device_id = device_id;
        await filter.save();
        return filter;
    } catch (error) {
        throw new Error(error.message);
    }
}

const deleteUserFilter = async (id) => {
    try {
        const filter = await userFilters.findByPk(id);
        if (!filter) {
            throw new Error("Filter not found");
        }
        await filter.destroy();
    } catch (error) {
        throw new Error(error.message);
    }
}

const patchUserFilter = async (id, updateData) => {
    try {
        const filter = await userFilters.findByPk(id);
        if (!filter) {
            throw new Error("Filter not found");
        }
        await filter.update(updateData);
        return filter;
    } catch (error) {
        throw new Error(error.message);
    }
}

const getUserFiltersfromUser = async (user_id) => {
    try {
        return await userFilters.findAll({
            where: {
                user_id: user_id
            }
        });
    } catch (error) {
        throw new Error(error.message);
    }
}

const getUserFiltersfromFilter = async (filter_id) => {
    try {
        return await userFilters.findAll({
            where: {
                filter_id: filter_id
            }
        });
    } catch (error) {
        throw new Error(error.message);
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