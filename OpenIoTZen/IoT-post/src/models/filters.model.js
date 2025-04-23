import { DataTypes } from "sequelize";
import { sequelize } from "../db/database.js";
import Model from "./models.model.js";
import Device from "./devices.model.js";

const Filter = sequelize.define("filter", {
    filter_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    field: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    filter_type: {
        type: DataTypes.ENUM('numeric', 'boolean', 'string'),
        allowNull: false,
        defaultValue: 'numeric'
    },
    conditions: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        allowNull: false,
        validate: {
            isValidCondition(value) {
                if (!Array.isArray(value)) throw new Error('Conditions must be an array');
                
                // Obtener el tipo de filtro del objeto actual
                const filterType = this.filter_type;
                
                value.forEach(condition => {
                    // Validación común para todos los tipos
                    if (!condition.condition) {
                        throw new Error('Each condition must have a condition operator');
                    }
                    
                    // Validaciones específicas por tipo
                    switch (filterType) {
                        case 'numeric':
                            if (!condition.threshold && condition.threshold !== 0) {
                                throw new Error('Numeric conditions must have a threshold value');
                            }
                            if (!['<', '<=', '=', '>=', '>', '!='].includes(condition.condition)) {
                                throw new Error('Invalid numeric condition operator');
                            }
                            if (typeof condition.threshold !== 'number') {
                                throw new Error('Threshold must be a number for numeric filters');
                            }
                            break;
                            
                        case 'boolean':
                            if (condition.threshold === undefined) {
                                throw new Error('Boolean conditions must have a threshold value');
                            }
                            if (!['=', '!='].includes(condition.condition)) {
                                throw new Error('Invalid boolean condition operator');
                            }
                            if (typeof condition.threshold !== 'boolean') {
                                throw new Error('Threshold must be a boolean for boolean filters');
                            }
                            break;
                            
                        case 'string':
                            if (!condition.threshold && condition.threshold !== '') {
                                throw new Error('String conditions must have a threshold value');
                            }
                            if (!['=', '!=', 'contains', 'starts_with', 'ends_with'].includes(condition.condition)) {
                                throw new Error('Invalid string condition operator');
                            }
                            if (typeof condition.threshold !== 'string') {
                                throw new Error('Threshold must be a string for string filters');
                            }
                            break;
                            
                        default:
                            throw new Error('Invalid filter type');
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
