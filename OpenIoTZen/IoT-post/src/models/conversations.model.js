import { DataTypes } from "sequelize";
import { sequelize } from "../db/database.js";
import User from "./users.model.js";

const Conversation = sequelize.define('conversations', {
    conversation_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'user_id'
        },
        onDelete: 'CASCADE'
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    messages: {
        type: DataTypes.JSON,
        allowNull: false
    },
    ai_model: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "GPT"
    }
}, {
    tableName: 'conversations',
    timestamps: true
});

// Relación con User
User.hasMany(Conversation, { foreignKey: 'user_id' });
Conversation.belongsTo(User, { foreignKey: 'user_id' });

export default Conversation;
