import { DataTypes } from "sequelize";
import { sequelize } from "../db/database.js";
import Device from "./devices.model.js";
import Model from "./models.model.js";

const DeviceModel = sequelize.define("deviceModels", {
    deviceModel_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    device_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    model_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
},
{
    tableName: 'deviceModels',
    timestamps: false
});

Device.belongsToMany(Model, { through: DeviceModel, foreignKey: "device_id" });
Model.belongsToMany(Device, { through: DeviceModel, foreignKey: "model_id" });

export default DeviceModel;