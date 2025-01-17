import { DataTypes } from "sequelize";
import { sequelize } from "../db/database.js";
import Device from "./devices.model.js";
import Model from "./models.model.js";

const Alert = sequelize.define('alert', {
    device_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'devices',
            key: 'device_id'
        }
    },
    model_id:{
        type: DataTypes.INTEGER,
        references: {
            model: 'models',
            key: 'model_id'
        }
    }, 
    description: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    seen: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    resolved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'alerts',
    timestamps: true
});

Alert.belongsTo(Device, { foreignKey: 'device_id' });
Alert.belongsTo(Model, { foreignKey: 'model_id' });

export default Alert;