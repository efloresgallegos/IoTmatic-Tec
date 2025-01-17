
// Modelo generado dinámicamente para Sequelize

import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../db/database.js';

const Datos = sequelize.define('Datos', {
    name: { type: Sequelize.STRING, allowNull: false },
    status: { type: Sequelize.STRING, allowNull: false },
    last_active: { type: Sequelize.DATE, allowNull: false },
    location: { type: Sequelize.STRING },
    temperature: { type: Sequelize.FLOAT },
    humidity: { type: Sequelize.FLOAT },
    battery_status: { type: Sequelize.STRING },
    alerts: { type: Sequelize.JSON },
    device_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'devices', key: 'device_id' } },
    model_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'models', key: 'model_id' } },
    user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'user_id' } }
}, {
    timestamps: true,
    tableName: 'Datos',
});



module.exports = Datos;
