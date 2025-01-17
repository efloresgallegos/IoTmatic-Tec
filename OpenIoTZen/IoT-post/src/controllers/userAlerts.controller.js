import userAlerts from '../models/userAlerts.model.js';
import User from '../models/users.model.js';
import Alert from '../models/alerts.model.js';

const getUserAlerts = async (req, res) => {
    try {
        const userAlerts = await userAlerts.findAll();
        return res.status(200).json(userAlerts);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const createUserAlert = async (req, res) => {
    try {
        const user = await User.findByPk(alert.user_id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const alert = await Alert.findByPk(alert.alert_id);
        if (!alert) {
            return res.status(404).json({ error: "Alert not found" });
        }
        const userAlert = await userAlerts.create(req.body);
        return res.status(201).json(alert);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const updateUserAlert = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const alert = await userAlerts.findByPk(id);
        if (!alert) {
            return res.status(404).json({ error: "Alert not found" });
        }
        await alert.update(updateData);
        return res.status(200).json(alert);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const deleteUserAlert = async (req, res) => {
    const { id } = req.params;
    try {
        const alert = await userAlerts.findByPk(id);
        if (!alert) {
            return res.status(404).json({ error: "Alert not found" });
        }
        await alert.destroy();
        return res.status(204).json();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const patchUserAlert = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const alert = await userAlerts.findByPk(id);
        if (!alert) {
            return res.status(404).json({ error: "Alert not found" });
        }
        await alert.update(updateData);
        return res.status(200).json(alert);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getUserAlertsfromUser = async (req, res) => {
    const { user_id } = req.params;
    try {
        const alerts = await userAlerts.findAll({
            where: {
                user_id: user_id
            }
        });
        return res.status(200).json(alerts);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getUserAlertsfromAlert = async (req, res) => {
    const { alert_id } = req.params;
    try {
        const alerts = await userAlerts.findAll({
            where: {
                alert_id: alert_id
            }
        });
        return res.status(200).json(alerts);
    } catch (error) {
        return res.status(500).json({ error: error.message });
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
