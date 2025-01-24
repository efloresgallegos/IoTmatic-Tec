import { DataTypes } from 'sequelize';
import { sequelize } from '../db/database.js';

// En tu modelo de Sequelize
const Model = sequelize.define('models', {
    model_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    modelname: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'models',
    timestamps: false
});

export default Model;