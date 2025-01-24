import alertsService from "../services/alerts.service.js";

const getAlerts = async (req, res) => {
    try {
        const alerts = await alertsService.getAlerts();
        res.status(200).json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const createAlert = async (req, res) => {
    try {
        const alertData = req.body;
        const newAlert = await alertsService.createAlert(alertData);
        res.status(201).json(newAlert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateAlert = async (req, res) => {
    try {
        const alertId = req.params.id;
        const alertData = req.body;
        const updatedAlert = await alertsService.updateAlert(alertId, alertData);
        res.status(200).json(updatedAlert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteAlert = async (req, res) => {
    try {
        const alertId = req.params.id;
        await alertsService.deleteAlert(alertId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const patchAlert = async (req, res) => {
    try {
        const alertId = req.params.id;
        const alertData = req.body;
        const patchedAlert = await alertsService.patchAlert(alertId, alertData);
        res.status(200).json(patchedAlert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export default { getAlerts, createAlert, updateAlert, deleteAlert, patchAlert };