import Filter from '../models/filters.model.js';
import alertsService from './alerts.service.js';

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

const checkFilter = async (data) => {
    try {
        const { model_id, device_id, user_id } = data;
        const filters = await Filter.findAll({ where: { model_id, device_id } });
        if (filters.length === 0) {
            console.log('No filters found');
            return [];
        }

        const alerts = [];
        for (const filter of filters) {
            const conditions = Array.isArray(filter.conditions) ? filter.conditions : 
                              (filter.conditions ? [filter.conditions] : []);
            let isValid = true;
            let description = `Alert for ${filter.field}: `;
            const triggers = [];

            for (const condition of conditions) {
                const { condition: operator, threshold } = condition;
                const fieldValue = data[filter.field];
                
                // Validar que el campo exista en los datos
                if (fieldValue === undefined) {
                    console.warn(`Field "${filter.field}" not found in data`);
                    continue;
                }

                let conditionMet = false;
                let displayValue = fieldValue;
                let displayThreshold = threshold;
                
                // Evaluar la condición según el tipo de filtro
                switch (filter.filter_type) {
                    case 'numeric':
                        // Asegurar que los valores sean numéricos
                        const numericValue = parseFloat(fieldValue);
                        const numericThreshold = parseFloat(threshold);
                        
                        if (isNaN(numericValue) || isNaN(numericThreshold)) {
                            console.warn(`Invalid numeric values: field=${fieldValue}, threshold=${threshold}`);
                            continue;
                        }
                        
                        switch (operator) {
                            case '=':
                                conditionMet = numericValue === numericThreshold;
                                break;
                            case '!=':
                                conditionMet = numericValue !== numericThreshold;
                                break;
                            case '>':
                                conditionMet = numericValue > numericThreshold;
                                break;
                            case '<':
                                conditionMet = numericValue < numericThreshold;
                                break;
                            case '>=':
                                conditionMet = numericValue >= numericThreshold;
                                break;
                            case '<=':
                                conditionMet = numericValue <= numericThreshold;
                                break;
                            default:
                                conditionMet = false;
                        }
                        displayValue = numericValue;
                        displayThreshold = numericThreshold;
                        break;
                        
                    case 'boolean':
                        // Convertir a booleano si es necesario
                        const boolValue = typeof fieldValue === 'boolean' ? fieldValue : 
                                         (fieldValue === 'true' || fieldValue === true || fieldValue === 1);
                        const boolThreshold = typeof threshold === 'boolean' ? threshold : 
                                            (threshold === 'true' || threshold === true || threshold === 1);
                        
                        switch (operator) {
                            case '=':
                                conditionMet = boolValue === boolThreshold;
                                break;
                            case '!=':
                                conditionMet = boolValue !== boolThreshold;
                                break;
                            default:
                                conditionMet = false;
                        }
                        displayValue = boolValue;
                        displayThreshold = boolThreshold;
                        break;
                        
                    case 'string':
                        // Asegurar que los valores sean strings
                        const strValue = String(fieldValue);
                        const strThreshold = String(threshold);
                        
                        switch (operator) {
                            case '=':
                                conditionMet = strValue === strThreshold;
                                break;
                            case '!=':
                                conditionMet = strValue !== strThreshold;
                                break;
                            case 'contains':
                                conditionMet = strValue.includes(strThreshold);
                                break;
                            case 'starts_with':
                                conditionMet = strValue.startsWith(strThreshold);
                                break;
                            case 'ends_with':
                                conditionMet = strValue.endsWith(strThreshold);
                                break;
                            default:
                                conditionMet = false;
                        }
                        displayValue = `"${strValue}"`;
                        displayThreshold = `"${strThreshold}"`;
                        break;
                        
                    default:
                        console.warn(`Unsupported filter type: ${filter.filter_type}`);
                        continue;
                }

                if (conditionMet) {
                    // Crear un mensaje descriptivo según el tipo de operador
                    let operatorText = operator;
                    switch (operator) {
                        case '=': operatorText = 'igual a'; break;
                        case '!=': operatorText = 'diferente de'; break;
                        case '>': operatorText = 'mayor que'; break;
                        case '<': operatorText = 'menor que'; break;
                        case '>=': operatorText = 'mayor o igual a'; break;
                        case '<=': operatorText = 'menor o igual a'; break;
                        case 'contains': operatorText = 'contiene'; break;
                        case 'starts_with': operatorText = 'comienza con'; break;
                        case 'ends_with': operatorText = 'termina con'; break;
                    }
                    
                    triggers.push(`${filter.field} es ${operatorText} ${displayThreshold} (valor actual: ${displayValue})`);
                }
                isValid = isValid && conditionMet;
            }

            if (isValid && triggers.length > 0) {
                description += triggers.join(' y ');
                await alertsService.createAlert({
                    description,
                    filter_id: filter.filter_id,
                    model_id,
                    device_id,
                });
                alerts.push({ filter, description });
            }
        }

        return alerts;
    } catch (error) {
        console.error('Error in checkFilter:', error.message);
        throw new Error(error.message);
    }
};

export default { getFilters, createFilter, updateFilter, deleteFilter, patchFilter, getFiltersByModel, getFiltersByDevice, getFiltersByModelAndDevice, checkFilter };