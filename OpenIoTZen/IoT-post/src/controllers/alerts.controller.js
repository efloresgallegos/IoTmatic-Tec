import Alert from "../models/alerts.model.js";
import userAlerts from "../models/userAlerts.model.js";
import UserDevice from "../models/userDevices.model.js";

const getAlerts = async (req, res) => {
    try {
        const alerts = await Alert.findAll();
        return res.status(200).json(alerts);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const createAlert = async (alertData) => {
    try {
        const userDevices = await UserDevice.findAll({ where: { device_id: alertData.device_id } });
        if (!userDevices) {
            throw new Error("No users with this device");
        }
        let alerts = [];
        let usersAlerts = [];
        for (const userDevice of userDevices) {
            const user_id = userDevice.user_id;
            const alert = await Alert.create(alertData);
            alerts.push(alert);
            const userAlert = await userAlerts.create({ user_id, alert_id: alert.alert_id });
            usersAlerts.push({ userAlert });
        }
        console.log(alerts, userAlerts);
        return alerts;
    } catch (error) {
        throw error;
    }
}

const updateAlert = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const alert = await Alert.findByPk(id);
        if (!alert) {
            return res.status(404).json({ error: "Alert not found" });
        }
        await alert.update(updateData);
        return res.status(200).json(alert);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const deleteAlert = async (req, res) => {
    const { id } = req.params;
    try {
        const alert = await Alert.findByPk(id);
        if (!alert) {
            return res.status(404).json({ error: "Alert not found" });
        }
        await alert.destroy();
        return res.status(204).json();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const patchAlert = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const alert = await Alert.findByPk(id);
        if (!alert) {
            return res.status(404).json({ error: "Alert not found" });
        }
        await alert.update(updateData);
        return res.status(200).json(alert);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export default { getAlerts, createAlert, updateAlert, deleteAlert, patchAlert };