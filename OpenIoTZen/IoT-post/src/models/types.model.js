import { DataTypes } from "sequelize";
import { sequelize } from "../db/database.js";

const Type = sequelize.define("type", {
    type_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
},
{
    tableName: 'types',
    timestamps: false
});

export default Type;