import { DataTypes } from "sequelize";
import { sequelize } from "../db/database.js";

const Model = sequelize.define('model', {
    model_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
}, {
    tableName: 'models',
    timestamps: false
});

export default Model;