import { DataTypes } from "sequelize";
import { sequelize } from "../db/database.js";
import bcrypt from "bcrypt";

const User = sequelize.define(
    "users",
    {
        user_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
    },
    {
        tableName: "users",
        timestamps: false,
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
            beforeUpdate: async (user) => {
                if (user.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
        },
    }
);

User.login = async function (username, password) {
    const user = await this.findOne({ where: { username } });
    if (user && (await bcrypt.compare(password, user.password))) {
        return user;
    }
    return null;
};

export default User;
