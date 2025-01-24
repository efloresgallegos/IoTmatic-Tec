import Filter from '../models/filters.model.js';
import alertsController from './alerts.controller.js';

const getFilters = async () => {
    try {
        return await Filter.findAll();
    } catch (error) {
        throw new Error(error.message);
    }
};

const createFilter = async (filterData) => {
    try {
        return await Filter.create(filterData);
    } catch (error) {
        throw new Error(error.message);
    }
};

const updateFilter = async (id, filterData) => {
    try {
        const filter = await Filter.findByPk(id);
        if (!filter) {
            throw new Error("Filter not found");
        }
        return await filter.update(filterData);
    } catch (error) {
        throw new Error(error.message);
    }
};

const deleteFilter = async (id) => {
    try {
        const filter = await Filter.findByPk(id);
        if (!filter) {
            throw new Error("Filter not found");
        }
        await filter.destroy();
    } catch (error) {
        throw new Error(error.message);
    }
};

const patchFilter = async (id, updateData) => {
    try {
        const filter = await Filter.findByPk(id);
        if (!filter) {
            throw new Error("Filter not found");
        }
        return await filter.update(updateData);
    } catch (error) {
        throw new Error(error.message);
    }
};

const getFiltersByModel = async (model_id) => {
    try {
        return await Filter.findAll({ where: { model_id } });
    } catch (error) {
        throw new Error(error.message);
    }
};

const getFiltersByDevice = async (device_id) => {
    try {
        return await Filter.findAll({ where: { device_id } });
    } catch (error) {
        throw new Error(error.message);
    }
};

const getFiltersByModelAndDevice = async (model_id, device_id) => {
    try {
        return await Filter.findAll({ where: { model_id, device_id } });
    } catch (error) {
        throw new Error(error.message);
    }
};

const checkFilter = async (model_id, device_id, data) => {
    try {
        const filters = await Filter.findAll({ where: { model_id, device_id } });
        if (filters.length === 0) {
            console.log('No filters found');
            return [];
        }

        const alerts = [];
        filters.forEach(filter => {
            const conditions = Array.isArray(filter.conditions) ? filter.conditions : [filter.conditions];
            let isValid = true;
            let description = `Alert for ${filter.name}: `;
            const triggers = [];

            conditions.forEach(condition => {
                const { condition: operator, threshold } = condition;
                const fieldValue = data[filter.field];
                
                let conditionMet = false;
                switch (operator) {
                    case '=':
                        conditionMet = fieldValue === threshold;
                        break;
                    case '>':
                        conditionMet = fieldValue > threshold;
                        break;
                    case '<':
                        conditionMet = fieldValue < threshold;
                        break;
                    case '>=':
                        conditionMet = fieldValue >= threshold;
                        break;
                    case '<=':
                        conditionMet = fieldValue <= threshold;
                        break;
                    default:
                        conditionMet = false;
                }

                if (conditionMet) {
                    triggers.push(`${filter.field} is ${operator} ${threshold} (current value: ${fieldValue})`);
                }
                isValid = isValid && conditionMet;
            });

            if (isValid && triggers.length > 0) {
                description += triggers.join(' and ');
                alertsController.createAlert({
                    description,
                    filter_id: filter.id,
                    model_id,
                    device_id,
                    data: data
                });
                alerts.push({ filter, description });
            }
        });
        return alerts;
    } catch (error) {
        throw new Error(error.message);
    }
};

export default { getFilters, createFilter, updateFilter, deleteFilter, patchFilter, getFiltersByModel, getFiltersByDevice, getFiltersByModelAndDevice, checkFilter };