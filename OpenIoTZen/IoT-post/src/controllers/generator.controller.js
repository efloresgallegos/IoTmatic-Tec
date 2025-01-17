import fs from 'fs';
import path from 'path';
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/database.js'; // Ajusta la ruta a tu configuración de Sequelize
import { fileURLToPath } from 'url'; // Importa fileURLToPath para obtener __dirname correctamente
import Model from '../models/models.model.js'; // Importa el modelo de Model

// Obtener __dirname correctamente para ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const genJSModel = (name, fields) => {
    const jsFields = fields.map(field => {
        let fieldType;

        switch (field.type) {
            case 'String':
                fieldType = 'Sequelize.STRING';
                break;
            case 'Number':
                fieldType = 'Sequelize.INTEGER';
                break;
            case 'Float':
                fieldType = 'Sequelize.FLOAT';
                break;
            case 'Boolean':
                fieldType = 'Sequelize.BOOLEAN';
                break;
            case 'Date':
                fieldType = 'Sequelize.DATE';
                break;
            case 'Text':
                fieldType = 'Sequelize.TEXT';
                break;
            case 'UUID':
                fieldType = 'Sequelize.UUID';
                break;
            case 'JSON':
                fieldType = 'Sequelize.JSON';
                break;
            case 'Array':
                fieldType = 'Sequelize.ARRAY(Sequelize.TEXT)';
                break;
            default:
                fieldType = 'Sequelize.TEXT';
        }

        return `${field.name}: { type: ${fieldType}${field.required ? ', allowNull: false' : ''}${field.ref ? `, references: { model: '${field.ref}', key: '${field.refColumn || `${field.ref}_id`}' }` : ''} }`;
    });

    return `

import User from './users.model.js';
import Device from './devices.model.js';
import Model from './models.model.js';
import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../db/database.js'; // Ajusta la ruta a tu configuración de Sequelize

const ${name} = sequelize.define('${name}', {
    ${jsFields.join(',\n    ')}
}, {
    timestamps: true,
    tableName: '${name}',
});


${name}.belongsTo(Device, { foreignKey: 'device_id' });
${name}.belongsTo(Model, { foreignKey: 'model_id' });
${name}.belongsTo(User, { foreignKey: 'user_id' });

export default {${name}};
`;
};

// Crear la tabla y el modelo
const createDataModel = async (name, fields) => {
    // Agregar campos por defecto
    fields.push(
        { name: 'device_id', type: 'Number', required: true, ref: 'devices', refColumn: 'device_id' },
        { name: 'model_id', type: 'Number', required: true, ref: 'models', refColumn: 'model_id' },
        { name: 'user_id', type: 'Number', required: true, ref: 'users', refColumn: 'user_id' }
    );

    const jsModel = genJSModel(name, fields);

    // Crear la tabla en la base de datos usando Sequelize
    try {
        const model = sequelize.define(name, fields.reduce((acc, field) => {
            let fieldType;

            switch (field.type) {
                case 'String':
                    fieldType = DataTypes.STRING;
                    break;
                case 'Number':
                    fieldType = DataTypes.INTEGER;
                    break;
                case 'Float':
                    fieldType = DataTypes.FLOAT;
                    break;
                case 'Boolean':
                    fieldType = DataTypes.BOOLEAN;
                    break;
                case 'Date':
                    fieldType = DataTypes.DATE;
                    break;
                case 'Text':
                    fieldType = DataTypes.TEXT;
                    break;
                case 'UUID':
                    fieldType = DataTypes.UUID;
                    break;
                case 'JSON':
                    fieldType = DataTypes.JSON;
                    break;
                case 'Array':
                    fieldType = DataTypes.ARRAY(DataTypes.TEXT);
                    break;
                default:
                    fieldType = DataTypes.TEXT;
            }

            acc[field.name] = {
                type: fieldType,
                allowNull: !field.required,
                ...(field.ref ? { references: { model: field.ref, key: field.refColumn || `${field.ref}_id` } } : {})
            };

            return acc;
        }, {}), {
            timestamps: true,
            tableName: name,
        });

        // Intentar sincronizar la base de datos sin eliminar datos existentes
        await model.sync({ alter: true });
        console.log(`Tabla ${name} creada exitosamente`);
    } catch (error) {
        console.error('Error al crear la tabla:', error);
    }

    // Guardar el modelo en un archivo JavaScript
    const dirPath = path.join(__dirname, '../models/data'); // Usando __dirname
    const filePath = path.join(dirPath, `${name}.js`);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, jsModel, 'utf8');
    console.log(`Modelo ${name} generado exitosamente`);
};

// Controlador final
const finalController = async (req, res) => {
    const { name, fields } = req.body;
    try {
        await createDataModel(name, fields);
        await Model.create({ name });
        res.json({ message: 'Modelo y tabla creados exitosamente' });
    } catch (error) {
        console.error('Error al crear el modelo y la tabla:', error);
        res.status(500).json({ message: 'Error al crear el modelo y la tabla' });
    }
};

export default { finalController };
