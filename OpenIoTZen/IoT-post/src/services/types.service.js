import Type from "../models/types.model.js";

const getTypes = async () => {
    try {
        const types = await Type.findAll();
        return types;
    } catch (error) {
        throw new Error(error.message);
    }
}

const getTypeById = async (id) => {
    try {
        const type = await Type.findByPk(id);
        if (!type) {
            throw new Error("Type not found");
        }
        return type;
    } catch (error) {
        throw new Error(error.message);
    }
}

const createType = async (data) => {
    try {
        console.log(data);
    const existingType = await Type.findOne({ where: { name: data.name } });
    if (existingType) {
        throw new Error("Type with this name already exists");
    }
    if (data.name.length > 30) {
        throw new Error("Type name cannot exceed 30 characters");
    }
    const type = await Type.create(data);
    return type;
    } catch (error) {
        throw new Error(error.message);
    }
}

const updateType = async (id, updateData) => {
    try {
        const type = await Type.findByPk(id);
        if (!type) {
            throw new Error("Type not found");
        }
        await type.update(updateData);
        return type;
    } catch (error) {
        throw new Error(error.message);
    }
}

const deleteType = async (id) => {
    try {
        const type = await Type.findByPk(id);
        if (!type) {
            throw new Error("Type not found");
        }
        await type.destroy();
    } catch (error) {
        throw new Error(error.message);
    }
}

const patchType = async (id, updateData) => {
    try {
        const type = await Type.findByPk(id);
        if (!type) {
            throw new Error("Type not found");
        }
        await type.update(updateData);
        return type;
    } catch (error) {
        throw new Error(error.message);
    }
}

const getDevicesByType = async (id) => {
    try {
        const type = await Type.findByPk(id, { include: 'devices' });
        if (!type) {
            throw new Error("Type not found");
        }
        return type.devices;
    } catch (error) {
        throw new Error(error.message);
    }
}

export default { getTypes, getTypeById, createType, updateType, deleteType, patchType, getDevicesByType };