import { DataTypes } from "sequelize";
import { sequelize } from "../db/database.js";
import Alert from "./alerts.model.js";
import User from "./users.model.js";

const UserAlert = sequelize.define("userAlerts", {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    alert_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
},
{
    tableName: 'userAlerts',
    timestamps: false
});

User.belongsToMany(Alert, { through: UserAlert, foreignKey: "user_id" });
Alert.belongsToMany(User, { through: UserAlert, foreignKey: "alert_id" });

export default UserAlert;