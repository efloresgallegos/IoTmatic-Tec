import dataService from "../services/data.service.js";

const createData = async (req, res) => {
    try {
        const data = await dataService.createData(req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDatabyModelandDevice = async (req, res) => {
    try {
        const { model, device } = req.params;
        const data = await dataService.getDatabyModelandDevice(model, device);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDatabyModel = async (req, res) => {
    try {
        const { model } = req.params;
        const data = await dataService.getDatabyModel(model);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDatabyDevice = async (req, res) => {
    try {
        const { device } = req.params;
        const data = await dataService.getDatabyDevice(device);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDatabyDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await dataService.getDatabyDateRange(startDate, endDate);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getGraphableData = async (req, res) => {
    try {
        const { model, device } = req.params;
        const data = await dataService.getGraphableData(model, device);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getModelName = async (model_id) => {
    try {
        const modelName = await dataService.getModelName(model_id);
        return modelName;
    } catch (error) {
        throw new Error(error.message);
    }
};

export default { createData, getDatabyModelandDevice, getDatabyModel, getDatabyDevice, getDatabyDateRange, getGraphableData, getModelName };