import Model from "../models/models.model.js";
import { jsons } from "../jsons/index.js";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Ruta al directorio jsons
const jsonsDir = path.join(__dirname, '..', 'jsons');
const modelsDir = path.join(__dirname, '..', 'models', 'data');

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
        
        if (!model) {
            throw new Error("Model not found");
        }

        // Eliminar el archivo JSON correspondiente al modelo
        try {
            const jsonPath = path.join(jsonsDir, `${model.name}.json`);
            const modelPath = path.join(modelsDir, `${model.name}.js`);
            await fs.access(jsonPath); // Verifica si el archivo existe
            await fs.unlink(jsonPath); // Elimina el archivo
            await fs.access(modelPath); // Verifica si el archivo existe
            await fs.unlink(modelPath); // Elimina el archivo
            console.log(`Modelo ${model.name}.js eliminado exitosamente`);
            console.log(`JSON file ${model.name}.json deleted successfully`);
        } catch (fileError) {
            console.warn(`No se encontró archivo JSON para ${model.name} o error al eliminarlo:`, fileError.message);
            // Continuamos con la eliminación del modelo aunque haya fallado la eliminación del archivo
        }

        // Eliminar el modelo de la base de datos
        await model.destroy();
        return { message: 'Model and associated JSON file deleted' };
    } catch (error) {
        throw new Error(error.message);
    }
}

const getFullJson = async (id) => {
    try {
        const model = await Model.findByPk(id);
        const json = jsons.find(json => json.name === model.name);
        if (!json) throw new Error("Model not found");
        return json;
    } catch (error) {
        throw new Error(error.message);
    }
}

export default { createModel, getModels, getModelById, updateModel, deleteModel, getFullJson };