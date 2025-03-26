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
            case 'Integer':
                fieldType = 'Sequelize.INTEGER';
                break;
            case 'Number':
                fieldType = 'Sequelize.FLOAT';
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
                fieldType = 'Sequelize.JSON'; // Usar JSON por defecto si es un objeto
        }

        // Manejo de campos anidados u objetos
        if (field.type === 'Object') {
            fieldType = 'Sequelize.JSON';
        }

        return `${field.name}: { 
            type: ${fieldType}${field.required ? ', allowNull: false' : ''}${field.ref ? `, references: { model: '${field.ref}', key: '${field.refColumn || `${field.ref}_id`}' }` : ''}
        }`;
    });

    return `
import User from '../users.model.js';
import Device from '../devices.model.js';
import Model from '../models.model.js';
import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../../db/database.js'; // Ajusta la ruta a tu configuración de Sequelize

const ${name} = sequelize.define('${name}', {
    ${jsFields.join(',\n    ')}
}, {
    timestamps: true,
    tableName: '${name}',
    hooks: {
        beforeSave: (instance) => {
            for (const key of Object.keys(instance.dataValues)) {
                if (typeof instance[key] === 'object' && !Array.isArray(instance[key])) {
                    instance[key] = JSON.stringify(instance[key]);
                }
            }
        },
        afterFind: (results) => {
            if (Array.isArray(results)) {
                results.forEach(instance => {
                    for (const key of Object.keys(instance.dataValues)) {
                        if (typeof instance[key] === 'string' && instance[key].startsWith('{')) {
                            try {
                                instance[key] = JSON.parse(instance[key]);
                            } catch (err) {
                                console.error('Error deserializando JSON:', key, err);
                            }
                        }
                    }
                });
            }
        },
    },
});

${name}.belongsTo(Device, { foreignKey: 'device_id' });
${name}.belongsTo(Model, { foreignKey: 'model_id' });
${name}.belongsTo(User, { foreignKey: 'user_id' });

export default ${name};
`;
};

const createDataModel = async (name, fields) => {
    try {
        // Agregar campos base incluyendo el ID primario
        const baseFields = [
            { 
                name: `${name}_id`, 
                type: 'Number', 
                required: true, 
                primaryKey: true, 
                autoIncrement: true 
            },
            { 
                name: 'device_id', 
                type: 'Number', 
                required: true, 
                ref: 'devices', 
                refColumn: 'device_id' 
            },
            { 
                name: 'model_id', 
                type: 'Number', 
                required: true, 
                ref: 'models', 
                refColumn: 'model_id' 
            },
            { 
                name: 'user_id', 
                type: 'Number', 
                required: true, 
                ref: 'users', 
                refColumn: 'user_id' 
            }
        ];

        // Combinar los campos personalizados con los campos base
        const allFields = [...fields, ...baseFields];

        // Generación dinámica del modelo
        const jsModel = genJSModel(name, allFields);

        // Definir el modelo con Sequelize
        const modelFields = allFields.reduce((acc, field) => {
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
                ...(field.ref ? { references: { model: field.ref, key: field.refColumn || `${field.ref}_id` } } : {}),
                ...(field.primaryKey ? { primaryKey: field.primaryKey } : {}),
                ...(field.autoIncrement ? { autoIncrement: field.autoIncrement } : {}),
                ...(field.type === 'Number' ? { validate: { isInt: true } } : {})
            };

            return acc;
        }, {});

        const model = sequelize.define(name, modelFields, {
            timestamps: true,
            tableName: name
        });

        await model.sync({ alter: true });
        console.log(`Tabla ${name} creada exitosamente`);

        const dirPath = path.join(__dirname, '../models/data');
        const filePath = path.join(dirPath, `${name}.js`);

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        fs.writeFileSync(filePath, jsModel, 'utf8');
        console.log(`Modelo ${name} generado exitosamente`);
    } catch (error) {
        console.error('Error al crear la tabla:', error);
    }
};

const generateJson = (name, fields) => {
    const jsonFields = fields.map(field => {
        return {
            name: field.name,
            type: field.type,
            required: field.required,
            ref: field.ref,
            refColumn: field.refColumn
        };
    });

    return {
        name,
        fields: jsonFields
    };
};

const createJson = async (name, fields) => {
    const jsonModel = generateJson(name, fields);

    const dirPath = path.join(__dirname, '../Jsons');
    const filePath = path.join(dirPath, `${name}.json`);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(jsonModel, null, 2), 'utf8');
    console.log(`JSON del modelo ${name} generado exitosamente`);
};

// Controlador final
const finalController = async (req, res) => {
    const { name, fields } = req.body;
    try {
        // Verificar si ya existe un modelo con el mismo nombre
        if (!name || !fields) {
            return res.status(400).json({ message: 'Faltan datos para crear el modelo' });
        }
        if(name === 'index' || name === 'models' || name === 'users' || name === 'devices') {
            return res.status(400).json({ message: 'No puedes usar ese nombre para crear un modelo' });
        }
        if (fields.length === 0) {
            return res.status(400).json({ message: 'El modelo debe tener al menos un campo' });
        }
        if (fields.some(field => field.name === '')) {
            return res.status(400).json({ message: 'Todos los campos deben tener un nombre' });
        }
        if (fields.some(field => field.type === '')) {
            return res.status(400).json({ message: 'Todos los campos deben tener un tipo' });
        }
        const existingModel = await Model.findOne({ where: { name } });
        if (existingModel) {
            return res.status(400).json({ message: 'Ya existe un modelo con ese nombre' });
        }

        await createDataModel(name, fields);
        await createJson(name, fields);
        await Model.create({ name: name }); // Asegúrate de pasar 'modelName' en lugar de 'name'
        res.json({ message: 'Modelo y tabla creados exitosamente' });
    } catch (error) {
        console.error('Error al crear el modelo y la tabla:', error);
        res.status(500).json({ message: 'Error al crear el modelo y la tabla' });
    }
};

export default { finalController };
