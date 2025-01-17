import Filter from '../models/filters.model.js';
import alertsController from './alerts.controller.js';

const getFilters = async (req, res) => {
    try {
        const filters = await Filter.findAll();
        return res.status(200).json(filters);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
const createFilter = async (req, res) => {
    const { name, description, conditions, model_id, device_id } = req.body;
    try {
        const newFilter = await Filter.create({ name, description, conditions, model_id, device_id });
        return res.status(201).json(newFilter);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const updateFilter = async (req, res) => {
    const { id } = req.params;
    const { name, description, conditions, model_id, device_id } = req.body;
    try {
        const filter = await Filter.findByPk(id);
        if (!filter) {
            return res.status(404).json({ error: "Filter not found" });
        }
        filter.name = name;
        filter.description = description;
        filter.conditions = conditions;
        filter.model_id = model_id;
        filter.device_id = device_id;
        await filter.save();
        return res.status(200).json(filter);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const deleteFilter = async (req, res) => {
    const { id } = req.params;
    try {
        const filter = await Filter.findByPk(id);
        if (!filter) {
            return res.status(404).json({ error: "Filter not found" });
        }
        await filter.destroy();
        return res.status(204).json();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const patchFilter = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const filter = await Filter.findByPk(id);
        if (!filter) {
            return res.status(404).json({ error: "Filter not found" });
        }
        await filter.update(updateData);
        return res.status(200).json(filter);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getFiltersByModel = async (req, res) => {
    const { model_id } = req.params;
    try {
        const filters = await Filter.findAll({ where: { model_id } });
        return res.status(200).json(filters);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getFiltersByDevice = async (req, res) => {
    const { device_id } = req.params;
    try {
        const filters = await Filter.findAll({ where: { device_id } });
        return res.status(200).json(filters);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getFiltersByModelAndDevice = async (req, res) => {
    const { model_id, device_id } = req.params;
    try {
        const filters = await Filter.findAll({ where: { model_id, device_id } });
        return res.status(200).json(filters);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

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
        throw error;
    }
}

export default { getFilters, createFilter, updateFilter, deleteFilter, patchFilter, getFiltersByModel, getFiltersByDevice, getFiltersByModelAndDevice, checkFilter };