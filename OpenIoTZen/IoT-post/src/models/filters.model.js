import { DataTypes } from "sequelize";
import { sequelize } from "../db/database.js";
import Model from "./models.model.js";
import Device from "./devices.model.js";

const Filter = sequelize.define("filter", {
    field: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    conditions: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        allowNull: false,
        validate: {
            isValidCondition(value) {
                if (!Array.isArray(value)) throw new Error('Conditions must be an array');
                value.forEach(condition => {
                    if (!condition.condition || !condition.threshold) {
                        throw new Error('Each condition must have condition and threshold');
                    }
                    if (!['<', '<=', '=', '>=', '>'].includes(condition.condition)) {
                        throw new Error('Invalid condition operator');
                    }
                    if (typeof condition.threshold !== 'number') {
                        throw new Error('Threshold must be a number');
                    }
                });
            }
        }
    },
    model_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    device_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'filters',
    timestamps: true,
    indexes: [
        {
            name: "filter_device_index",
            fields: ["device_id"]
        }
    ]
});

Model.hasMany(Filter, { foreignKey: "model_id" });
Filter.belongsTo(Model, { foreignKey: "model_id" });
Device.hasMany(Filter, { foreignKey: "device_id" });
Filter.belongsTo(Device, { foreignKey: "device_id" });

export default Filter;
