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
                fieldType = 'DataTypes.STRING';
                break;
            case 'Integer':
                fieldType = 'DataTypes.INTEGER';
                break;
            case 'Number':
                fieldType = 'DataTypes.INTEGER';
                break;
            case 'Float':
                fieldType = 'DataTypes.FLOAT';
                break;
            case 'Boolean':
                fieldType = 'DataTypes.BOOLEAN';
                break;
            case 'Date':
                fieldType = 'DataTypes.DATE';
                break;
            case 'Text':
                fieldType = 'DataTypes.TEXT';
                break;
            case 'UUID':
                fieldType = 'DataTypes.UUID';
                break;
            case 'JSON':
                fieldType = 'DataTypes.JSON';
                break;
            case 'Array':
                fieldType = 'DataTypes.ARRAY(DataTypes.TEXT)';
                break;
            default:
                fieldType = 'DataTypes.JSON';
        }

        // Construir las propiedades básicas del campo
        let fieldDefinition = `${field.name}: { 
            type: ${fieldType}${field.required ? ', allowNull: false' : ''}`;
        
        // Agregar configuración de clave primaria y autoincrement si corresponde
        if (field.primaryKey) {
            fieldDefinition += `,
            primaryKey: true`;
            if (field.autoIncrement) {
                fieldDefinition += `,
            autoIncrement: true`;
            }
        }

        // Agregar referencias si existen
        if (field.ref) {
            fieldDefinition += `,
            references: { model: '${field.ref}', key: '${field.refColumn || `${field.ref}_id`}' }`;
        }

        // Cerrar la definición del campo
        fieldDefinition += `
        }`;
        
        return fieldDefinition;
    });

    return `import { DataTypes } from 'sequelize';
import { sequelize } from '../../db/database.js';
import Device from '../devices.model.js';
import Model from '../models.model.js';
import User from '../users.model.js';

const ${name} = sequelize.define('${name}', {
    ${jsFields.join(',\n    ')},
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    timestamps: false,
    tableName: '${name}',
    hooks: {
        beforeCreate: (instance) => {
            // Excluir cualquier campo que termine en _id del payload
            Object.keys(instance.dataValues).forEach(key => {
                if (key.endsWith('_id') && key !== 'device_id' && key !== 'model_id' && key !== 'user_id') {
                    delete instance.dataValues[key];
                }
            });
            
            // Establecer timestamps manualmente
            const now = new Date();
            instance.setDataValue('createdAt', now);
            instance.setDataValue('updatedAt', now);
        },
        beforeUpdate: (instance) => {
            // Actualizar el timestamp de actualización
            instance.setDataValue('updatedAt', new Date());
        },
        beforeSave: (instance) => {
            // Convertir objetos a JSON string
            for (const key of Object.keys(instance.dataValues)) {
                if (typeof instance[key] === 'object' && !Array.isArray(instance[key]) && key !== 'createdAt' && key !== 'updatedAt') {
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
        }
    }
});

${name}.belongsTo(Device, { foreignKey: 'device_id' });
${name}.belongsTo(Model, { foreignKey: 'model_id' });
${name}.belongsTo(User, { foreignKey: 'user_id' });

export default ${name};`;
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
                autoIncrement: true,
                excludeFromPayload: true // Marcar para excluir del payload
            },
            { 
                name: 'device_id', 
                type: 'Number', 
                required: true, 
                ref: 'devices', 
                refColumn: 'device_id',
                excludeFromPayload: false // No excluir ya que viene del cliente
            },
            { 
                name: 'model_id', 
                type: 'Number', 
                required: true, 
                ref: 'models', 
                refColumn: 'model_id',
                excludeFromPayload: false
            },
            { 
                name: 'user_id', 
                type: 'Number', 
                required: true, 
                ref: 'users', 
                refColumn: 'user_id',
                excludeFromPayload: false
            }
        ];

        // Combinar campos base con campos personalizados
        const allFields = [...baseFields, ...fields];

        // Generar el código del modelo
        const jsModel = genJSModel(name, allFields);

        // Crear el modelo en Sequelize
        const modelFields = allFields.reduce((acc, field) => {
            let fieldType;

            switch (field.type) {
                case 'String':
                    fieldType = DataTypes.STRING;
                    break;
                case 'Integer':
                    fieldType = DataTypes.INTEGER;
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

            // Configuración base del campo
            const fieldConfig = {
                type: fieldType,
                allowNull: !field.required
            };

            // Agregar configuración de clave primaria y autoincrement si corresponde
            if (field.primaryKey) {
                fieldConfig.primaryKey = true;
                if (field.autoIncrement) {
                    fieldConfig.autoIncrement = true;
                }
            }

            // Agregar referencias si existen
            if (field.ref) {
                fieldConfig.references = { 
                    model: field.ref, 
                    key: field.refColumn || `${field.ref}_id` 
                };
            }

            // Agregar validaciones específicas por tipo
            if (field.type === 'Number' || field.type === 'Integer') {
                fieldConfig.validate = { isInt: true };
            }

            acc[field.name] = fieldConfig;
            return acc;
        }, {});

        // Agregar campos de timestamp sin valores por defecto
        modelFields.createdAt = {
            type: DataTypes.DATE,
            allowNull: false
        };
        modelFields.updatedAt = {
            type: DataTypes.DATE,
            allowNull: false
        };

        const model = sequelize.define(name, modelFields, {
            timestamps: false,
            tableName: name,
            hooks: {
                beforeCreate: (instance) => {
                    // Excluir cualquier campo que termine en _id del payload
                    Object.keys(instance.dataValues).forEach(key => {
                        if (key.endsWith('_id') && key !== 'device_id' && key !== 'model_id' && key !== 'user_id') {
                            delete instance.dataValues[key];
                        }
                    });
                    
                    // Establecer timestamps manualmente
                    const now = new Date();
                    instance.setDataValue('createdAt', now);
                    instance.setDataValue('updatedAt', now);
                },
                beforeUpdate: (instance) => {
                    // Actualizar el timestamp de actualización
                    instance.setDataValue('updatedAt', new Date());
                },
                beforeSave: (instance) => {
                    // Convertir objetos a JSON string
                    for (const key of Object.keys(instance.dataValues)) {
                        if (typeof instance[key] === 'object' && !Array.isArray(instance[key]) && key !== 'createdAt' && key !== 'updatedAt') {
                            instance[key] = JSON.stringify(instance[key]);
                        }
                    }
                }
            }
        });

        // Forzar la sincronización de la tabla para asegurar que se cree correctamente
        await model.sync({ force: true });
        console.log(`Tabla ${name} creada exitosamente con autoIncrement y timestamps`);

        const dirPath = path.join(__dirname, '../models/data');
        const filePath = path.join(dirPath, `${name}.js`);

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        fs.writeFileSync(filePath, jsModel, 'utf8');
        console.log(`Modelo ${name} generado exitosamente`);
    } catch (error) {
        console.error('Error al crear la tabla:', error);
        throw error;
    }
};

// Función auxiliar para obtener la etiqueta en español del tipo de dato
const getTypeLabel = (type) => {
    switch(type) {
        case 'String': return 'Texto';
        case 'Number': return 'Número';
        case 'Integer': return 'Entero';
        case 'Float': return 'Decimal';
        case 'Boolean': return 'Booleano';
        case 'Date': return 'Fecha';
        case 'Text': return 'Texto largo';
        case 'UUID': return 'UUID';
        case 'JSON': return 'JSON';
        case 'Array': return 'Arreglo';
        case 'Object': return 'Objeto';
        default: return type;
    }
};

const generateJson = (name, fields) => {
    // No incluimos los campos base en el JSON para mantener compatibilidad con la estructura existente
    // Solo incluimos los campos personalizados que el usuario ha definido
    
    const jsonFields = fields.map(field => {
        // Convertir el tipo a formato de objeto con value y label para mantener compatibilidad
        const typeObj = {
            value: field.type,
            label: getTypeLabel(field.type)
        };
        
        // Objeto base con propiedades comunes
        const fieldObj = {
            name: field.name,
            type: typeObj,
            required: field.required || false,
            ref: field.ref || null,
            refColumn: field.refColumn || null
        };
        
        // Agregar propiedades específicas para campos de tipo Date
        if (field.type === 'Date') {
            fieldObj.includeTime = field.includeTime || false;
            fieldObj.dateFormat = field.dateFormat || 'ISO';
            fieldObj.minDate = field.minDate || null;
            fieldObj.maxDate = field.maxDate || null;
            fieldObj.defaultValue = field.defaultValue !== undefined ? field.defaultValue : null;
        }
        
        // Agregar propiedades específicas para campos numéricos
        if (field.type === 'Number' || field.type === 'Integer' || field.type === 'Float') {
            fieldObj.min = field.min !== undefined ? field.min : null;
            fieldObj.max = field.max !== undefined ? field.max : null;
            fieldObj.defaultValue = field.defaultValue !== undefined ? field.defaultValue : null;
        }
        
        // Agregar propiedades específicas para campos de tipo String o Text
        if (field.type === 'String' || field.type === 'Text') {
            fieldObj.pattern = field.pattern || null;
            fieldObj.minLength = field.minLength !== undefined ? field.minLength : null;
            fieldObj.maxLength = field.maxLength !== undefined ? field.maxLength : null;
            fieldObj.defaultValue = field.defaultValue !== undefined ? field.defaultValue : null;
        }
        
        // Manejar campos de tipo Object con subcampos
        if (field.type === 'Object' && Array.isArray(field.fields)) {
            fieldObj.fields = field.fields.map(subField => {
                const subTypeObj = {
                    value: subField.type,
                    label: getTypeLabel(subField.type)
                };
                
                const subFieldObj = {
                    name: subField.name,
                    type: subTypeObj,
                    required: subField.required || false
                };
                
                // Agregar propiedades específicas para subcampos de tipo Date
                if (subField.type === 'Date') {
                    subFieldObj.includeTime = subField.includeTime || false;
                    subFieldObj.dateFormat = subField.dateFormat || 'ISO';
                    subFieldObj.minDate = subField.minDate || null;
                    subFieldObj.maxDate = subField.maxDate || null;
                    subFieldObj.defaultValue = subField.defaultValue || null;
                }
                
                // Agregar propiedades específicas para subcampos numéricos
                if (subField.type === 'Number' || subField.type === 'Integer' || subField.type === 'Float') {
                    subFieldObj.min = subField.min !== undefined ? subField.min : null;
                    subFieldObj.max = subField.max !== undefined ? subField.max : null;
                    subFieldObj.defaultValue = subField.defaultValue !== undefined ? subField.defaultValue : null;
                }
                
                // Agregar propiedades específicas para subcampos de tipo String o Text
                if (subField.type === 'String' || subField.type === 'Text') {
                    subFieldObj.pattern = subField.pattern || null;
                    subFieldObj.minLength = subField.minLength !== undefined ? subField.minLength : null;
                    subFieldObj.maxLength = subField.maxLength !== undefined ? subField.maxLength : null;
                    subFieldObj.defaultValue = subField.defaultValue !== undefined ? subField.defaultValue : null;
                }
                
                return subFieldObj;
            });
        }
        
        return fieldObj;
    });
    
    return {
        name,
        fields: jsonFields
    };
};

const createJson = async (name, fields) => {
    try {
        const jsonModel = generateJson(name, fields);

        const dirPath = path.join(__dirname, '../jsons');
        const filePath = path.join(dirPath, `${name}.json`);

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        fs.writeFileSync(filePath, JSON.stringify(jsonModel, null, 2), 'utf8');
        console.log(`JSON del modelo ${name} generado exitosamente`);
    } catch (error) {
        console.error('Error al crear el archivo JSON:', error);
        throw new Error(`Error al crear el archivo JSON: ${error.message}`);
    }
};

// Controlador final
const finalController = async (req, res) => {
    let { name, fields } = req.body;
    // Eliminar espacios en blanco y convertir a minúsculas
    name = name.replace(/\s/g, '_').toLowerCase();

    try {
        // Validaciones comunes para ambos modelos (JS y JSON)
        if (!name || !fields) {
            return res.status(400).json({ message: 'Faltan datos para crear el modelo' });
        }
        
        // Validar nombre reservado
        if(name === 'index' || name === 'models' || name === 'users' || name === 'devices') {
            return res.status(400).json({ message: 'No puedes usar ese nombre para crear un modelo' });
        }
        
        // Validar que haya campos
        if (fields.length === 0) {
            return res.status(400).json({ message: 'El modelo debe tener al menos un campo' });
        }
        
        // Validar nombres de campos
        if (fields.some(field => field.name === '')) {
            return res.status(400).json({ message: 'Todos los campos deben tener un nombre' });
        }
        
        // Validar tipos de campos
        if (fields.some(field => {
            // Manejar el caso donde field.type puede ser un objeto o un string
            const fieldType = typeof field.type === 'object' ? field.type.value : field.type;
            return !fieldType;
        })) {
            return res.status(400).json({ message: 'Todos los campos deben tener un tipo' });
        }
        
        // Normalizar los campos para asegurar que todos tengan el formato correcto
        fields = fields.map(field => {
            // Convertir field.type a string si es un objeto
            const fieldType = typeof field.type === 'object' ? field.type.value : field.type;
            
            // Crear un objeto base para el campo
            const normalizedField = {
                name: field.name,
                type: fieldType,
                required: field.required || false
            };
            
            // Agregar propiedades de referencia si existen
            if (field.ref) {
                normalizedField.ref = field.ref;
                normalizedField.refColumn = field.refColumn || null;
            }
            
            // Agregar propiedades específicas para campos de tipo Date
            if (fieldType === 'Date') {
                normalizedField.includeTime = field.includeTime || false;
                normalizedField.dateFormat = field.dateFormat || 'ISO';
                normalizedField.minDate = field.minDate || null;
                normalizedField.maxDate = field.maxDate || null;
                normalizedField.defaultValue = field.defaultValue !== undefined ? field.defaultValue : null;
            }
            
            // Agregar propiedades específicas para campos numéricos
            if (fieldType === 'Number' || fieldType === 'Integer' || fieldType === 'Float') {
                normalizedField.min = field.min !== undefined ? field.min : null;
                normalizedField.max = field.max !== undefined ? field.max : null;
                normalizedField.defaultValue = field.defaultValue !== undefined ? field.defaultValue : null;
            }
            
            // Agregar propiedades específicas para campos de tipo String o Text
            if (fieldType === 'String' || fieldType === 'Text') {
                normalizedField.pattern = field.pattern || null;
                normalizedField.minLength = field.minLength !== undefined ? field.minLength : null;
                normalizedField.maxLength = field.maxLength !== undefined ? field.maxLength : null;
                normalizedField.defaultValue = field.defaultValue !== undefined ? field.defaultValue : null;
            }
            
            // Manejar campos de tipo Object con subcampos
            if (fieldType === 'Object' && Array.isArray(field.fields)) {
                normalizedField.fields = field.fields.map(subField => {
                    const subFieldType = typeof subField.type === 'object' ? subField.type.value : subField.type;
                    
                    const normalizedSubField = {
                        name: subField.name,
                        type: subFieldType,
                        required: subField.required || false
                    };
                    
                    // Agregar propiedades específicas para subcampos de tipo Date
                    if (subFieldType === 'Date') {
                        normalizedSubField.includeTime = subField.includeTime || false;
                        normalizedSubField.dateFormat = subField.dateFormat || 'ISO';
                        normalizedSubField.minDate = subField.minDate || null;
                        normalizedSubField.maxDate = subField.maxDate || null;
                        normalizedSubField.defaultValue = subField.defaultValue || null;
                    }
                    
                    // Agregar propiedades específicas para subcampos numéricos
                    if (subFieldType === 'Number' || subFieldType === 'Integer' || subFieldType === 'Float') {
                        normalizedSubField.min = subField.min !== undefined ? subField.min : null;
                        normalizedSubField.max = subField.max !== undefined ? subField.max : null;
                        normalizedSubField.defaultValue = subField.defaultValue !== undefined ? subField.defaultValue : null;
                    }
                    
                    // Agregar propiedades específicas para subcampos de tipo String o Text
                    if (subFieldType === 'String' || subFieldType === 'Text') {
                        normalizedSubField.pattern = subField.pattern || null;
                        normalizedSubField.minLength = subField.minLength !== undefined ? subField.minLength : null;
                        normalizedSubField.maxLength = subField.maxLength !== undefined ? subField.maxLength : null;
                        normalizedSubField.defaultValue = subField.defaultValue !== undefined ? subField.defaultValue : null;
                    }
                    
                    return normalizedSubField;
                });
            }
            
            return normalizedField;
        });
        
        // Validar nombres de campos duplicados
        const fieldNames = fields.map(field => field.name);
        if (new Set(fieldNames).size !== fieldNames.length) {
            return res.status(400).json({ message: 'No puede haber campos con nombres duplicados' });
        }
        
        // Verificar si ya existe un modelo con el mismo nombre
        const existingModel = await Model.findOne({ where: { name } });
        if (existingModel) {
            return res.status(400).json({ message: 'Ya existe un modelo con ese nombre' });
        }

        // Crear el modelo en la base de datos primero para evitar inconsistencias
        const modelRecord = await Model.create({ name: name });
        
        try {
            // Crear el modelo JS
            await createDataModel(name, fields);
            
            // Crear el archivo JSON
            await createJson(name, fields);
            
            return res.json({ 
                message: 'Modelo y tabla creados exitosamente',
                model: {
                    name: name,
                    id: modelRecord.model_id
                }
            });
        } catch (error) {
            // Si hay un error después de crear el registro del modelo, intentar eliminarlo
            try {
                await modelRecord.destroy();
                return res.status(500).json({ message: `Error al crear el modelo: ${error.message}` });
            } catch (cleanupError) {
                console.error('Error al limpiar el modelo después de un fallo:', cleanupError);
                return res.status(500).json({ message: 'Error al crear el modelo y al limpiar los recursos' });
            }
        }
    } catch (error) {
        console.error('Error al crear el modelo y la tabla:', error);
        return res.status(500).json({ message: `Error al crear el modelo y la tabla: ${error.message}` });
    }
};

const generateModelCode = (name, fields) => {
    const imports = `import { DataTypes } from 'sequelize';
import { sequelize } from '../../db/database.js';

`;

    const modelDefinition = `const ${name} = sequelize.define('${name}', {
    ${fields.map(field => {
        let fieldDefinition = `${field.name}: {
        type: DataTypes.${field.type === 'Number' ? 'INTEGER' : field.type.toUpperCase()},
        allowNull: ${!field.required}`;

        if (field.primaryKey) {
            fieldDefinition += `,
        primaryKey: true`;
        }

        if (field.autoIncrement) {
            fieldDefinition += `,
        autoIncrement: true`;
        }

        if (field.ref) {
            fieldDefinition += `,
        references: {
            model: '${field.ref}',
            key: '${field.refColumn || `${field.ref}_id`}'
        }`;
        }

        fieldDefinition += `
    }`;
        return fieldDefinition;
    }).join(',\n    ')}
}, {
    tableName: '${name}',
    timestamps: true
});

export default ${name};`;

    return imports + modelDefinition;
};

export default { finalController };
