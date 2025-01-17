import { DataTypes } from "sequelize";
import { sequelize } from "../db/database.js";
import Device from "./devices.model.js";
import User from "./users.model.js";

const UserDevice = sequelize.define("userDevices", {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    device_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
},
{
    tableName: 'userDevices',
    timestamps: false
});

User.belongsToMany(Device, { through: UserDevice, foreignKey: "user_id" });
Device.belongsToMany(User, { through: UserDevice, foreignKey: "device_id" });

export default UserDevice;