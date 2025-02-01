import filtersService from '../services/filters.service.js';

const getFilters = async (req, res) => {
    try {
        const filters = await filtersService.getFilters();
        res.status(200).json(filters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const createFilter = async (req, res) => {
    try {
        const filter = await filtersService.createFilter(req.body);
        res.status(201).json(filter);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateFilter = async (req, res) => {
    try {
        const filter = await filtersService.updateFilter(req.params.id, req.body);
        res.status(200).json(filter);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteFilter = async (req, res) => {
    try {
        await filtersService.deleteFilter(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getFiltersByModel = async (req, res) => {
    try {
        const filters = await filtersService.getFiltersByModel(req.params.modelId);
        res.status(200).json(filters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getFiltersByDevice = async (req, res) => {
    try {
        const filters = await filtersService.getFiltersByDevice(req.params.deviceId);
        res.status(200).json(filters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getFiltersByModelAndDevice = async (req, res) => {
    try {
        const filters = await filtersService.getFiltersByModelAndDevice(req.params.modelId, req.params.deviceId);
        res.status(200).json(filters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const patchFilter = async (req, res) => {
    try {
        const filter = await filtersService.patchFilter(req.params.id, req.body);
        res.status(200).json(filter);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const checkFilter = async (data) => {
    try {
        const isValid = await filtersService.checkFilter(data.model_id, data.device_id, data);
        return isValid;
    } catch (error) {
        throw new Error(error.message);
    }
}

export default { getFilters, createFilter, updateFilter, deleteFilter, patchFilter, getFiltersByModel, getFiltersByDevice, getFiltersByModelAndDevice, checkFilter };