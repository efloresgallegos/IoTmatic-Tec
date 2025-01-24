

import User from './users.model.js';
import Device from './devices.model.js';
import Model from './models.model.js';
import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../../db/database.js'; // Ajusta la ruta a tu configuración de Sequelize

const TestModel = sequelize.define('TestModel', {
    TestModel_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: { 
            type: Sequelize.STRING, allowNull: false
        },
    age: { 
            type: Sequelize.INTEGER
        },
    isActive: { 
            type: Sequelize.BOOLEAN, allowNull: false
        },
    createdAt: { 
            type: Sequelize.DATE, allowNull: false
        },
    data: { 
            type: Sequelize.JSON
        },
    device_id: { 
            type: Sequelize.INTEGER, allowNull: false, references: { model: 'devices', key: 'device_id' }
        },
    model_id: { 
            type: Sequelize.INTEGER, allowNull: false, references: { model: 'models', key: 'model_id' }
        },
    user_id: { 
            type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'user_id' }
        }
}, {
    timestamps: true,
    tableName: 'TestModel',
    hooks: {
        beforeSave: (instance) => {
            // Serializar campos tipo JSON si es necesario
            for (const key of Object.keys(instance.dataValues)) {
                if (typeof instance[key] === 'object' && !Array.isArray(instance[key])) {
                    instance[key] = JSON.stringify(instance[key]);
                }
            }
        },
        afterFind: (results) => {
            // Deserializar campos tipo JSON si es necesario
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


TestModel.belongsTo(Device, { foreignKey: 'device_id' });
TestModel.belongsTo(Model, { foreignKey: 'model_id' });
TestModel.belongsTo(User, { foreignKey: 'user_id' });

export default TestModel;
