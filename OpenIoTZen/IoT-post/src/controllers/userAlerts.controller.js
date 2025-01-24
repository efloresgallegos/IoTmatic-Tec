import userAlertsService from "../services/userAlerts.service.js"

const getUserAlerts = async (req, res) => {
    try {
        const alerts = await userAlertsService.getAllAlerts();
        res.status(200).json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const createUserAlert = async (req, res) => {
    try {
        const newAlert = await userAlertsService.createAlert(req.body);
        res.status(201).json(newAlert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateUserAlert = async (req, res) => {
    try {
        const updatedAlert = await userAlertsService.updateAlert(req.params.id, req.body);
        res.status(200).json(updatedAlert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteUserAlert = async (req, res) => {
    try {
        await userAlertsService.deleteAlert(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const patchUserAlert = async (req, res) => {
    try {
        const patchedAlert = await userAlertsService.patchAlert(req.params.id, req.body);
        res.status(200).json(patchedAlert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getUserAlertsfromUser = async (req, res) => {
    try {
        const alerts = await userAlertsService.getAlertsByUser(req.params.userId);
        res.status(200).json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getUserAlertsfromAlert = async (req, res) => {
    try {
        const alerts = await userAlertsService.getAlertsByAlert(req.params.alertId);
        res.status(200).json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export default {
    getUserAlerts,
    createUserAlert,
    updateUserAlert,
    deleteUserAlert,
    patchUserAlert,
    getUserAlertsfromUser,
    getUserAlertsfromAlert
}
