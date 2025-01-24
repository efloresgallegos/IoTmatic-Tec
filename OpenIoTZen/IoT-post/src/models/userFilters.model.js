import { DataTypes } from "sequelize";
import { sequelize } from "../db/database.js";
import Filter from "./filters.model.js";
import User from "./users.model.js";

const UserFilter = sequelize.define("userFilters", {
    userFilter_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    filter_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
},
{
    tableName: 'userFilters',
    timestamps: false
});

User.belongsToMany(Filter, { through: UserFilter, foreignKey: "user_id" });
Filter.belongsToMany(User, { through: UserFilter, foreignKey: "filter_id" });

export default UserFilter;