import { DataTypes } from "sequelize";
import { sequelize } from "../db/database.js";
import User from "./users.model.js";
import Model from "./models.model.js";

const UserModels = sequelize.define('userModels', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    model_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, {
    tableName: 'userModels',
    timestamps: false
});

User.belongsToMany(Model, { through: UserModels, foreignKey: "user_id" });
Model.belongsToMany(User, { through: UserModels, foreignKey: "model_id" });

export default UserModels;