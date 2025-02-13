

import User from '../users.model.js';
import Device from '../devices.model.js';
import Model from '../models.model.js';
import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../../db/database.js'; // Ajusta la ruta a tu configuración de Sequelize

const SolarLightMonitor = sequelize.define('SolarLightMonitor', {
    SolarLightMonitor_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    location: { 
            type: Sequelize.STRING, allowNull: false
        },
    lightIntensity: { 
            type: Sequelize.INTEGER, allowNull: false
        },
    SolarLightMonitor_id: { 
            type: Sequelize.INTEGER, allowNull: false
        },
    device_id: { 
            type: Sequelize.INTEGER, allowNull: false, references: { model: 'devices', key: 'device_id' }
        },
    model_id: { 
            type: Sequelize.INTEGER, allowNull: false, references: { model: 'models', key: 'model_id' }
        },
    user_id: { 
            type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'user_id' }
        },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }
}, {
    timestamps: true,
    tableName: 'SolarLightMonitor',
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


SolarLightMonitor.belongsTo(Device, { foreignKey: 'device_id' });
SolarLightMonitor.belongsTo(Model, { foreignKey: 'model_id' });
SolarLightMonitor.belongsTo(User, { foreignKey: 'user_id' });

export default SolarLightMonitor;
