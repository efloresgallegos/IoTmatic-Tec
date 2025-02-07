

import User from '../users.model.js';
import Device from '../devices.model.js';
import Model from '../models.model.js';
import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../../db/database.js'; // Ajusta la ruta a tu configuración de Sequelize

const ExampleModel = sequelize.define('ExampleModel', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    isAvailable: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    device_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // Asegúrate de que no permita null
        references: {
            model: 'devices',
            key: 'device_id'
        }
    },
    model_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // Asegúrate de que no permita null
        references: {
            model: 'models',
            key: 'model_id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // Asegúrate de que no permita null
        references: {
            model: 'users',
            key: 'user_id'
        }
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
    tableName: 'ExampleModel'
});


ExampleModel.belongsTo(Device, { foreignKey: 'device_id' });
ExampleModel.belongsTo(Model, { foreignKey: 'model_id' });
ExampleModel.belongsTo(User, { foreignKey: 'user_id' });

export default ExampleModel;
