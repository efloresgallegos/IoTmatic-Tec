import { DataTypes } from "sequelize";
import { sequelize } from "../db/database.js";
import Device from "./devices.model.js";
import Model from "./models.model.js";

const DeviceModel = sequelize.define("device_models", {
    device_model_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    device_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'devices',
            key: 'device_id'
        }
    },
    model_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'models',
            key: 'model_id'
        }
    }
},
{
    tableName: 'device_models',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['device_id', 'model_id']
        }
    ]
});

// Definir las relaciones
DeviceModel.belongsTo(Device, { 
    foreignKey: 'device_id',
    onDelete: 'CASCADE'
});

DeviceModel.belongsTo(Model, { 
    foreignKey: 'model_id',
    onDelete: 'CASCADE'
});

Device.hasMany(DeviceModel, { 
    foreignKey: 'device_id',
    onDelete: 'CASCADE'
});

Model.hasMany(DeviceModel, { 
    foreignKey: 'model_id',
    onDelete: 'CASCADE'
});

// Relación many-to-many a través de deviceModels
Device.belongsToMany(Model, { through: DeviceModel, foreignKey: 'device_id' });
Model.belongsToMany(Device, { through: DeviceModel, foreignKey: 'model_id' });

export default DeviceModel;