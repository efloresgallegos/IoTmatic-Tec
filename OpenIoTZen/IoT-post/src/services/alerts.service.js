import Alert from "../models/alerts.model.js";
import userAlerts from "../models/userAlerts.model.js";
import UserDevice from "../models/userDevices.model.js";

const getAlerts = async () => {
    try {
        const alerts = await Alert.findAll();
        return alerts;
    } catch (error) {
        throw new Error(error.message);
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
        throw new Error(error.message);
    }
}

const updateAlert = async (id, updateData) => {
    try {
        const alert = await Alert.findByPk(id);
        if (!alert) {
            throw new Error("Alert not found");
        }
        await alert.update(updateData);
        return alert;
    } catch (error) {
        throw new Error(error.message);
    }
}

const deleteAlert = async (id) => {
    try {
        const alert = await Alert.findByPk(id);
        if (!alert) {
            throw new Error("Alert not found");
        }
        await alert.destroy();
        return;
    } catch (error) {
        throw new Error(error.message);
    }
}

const patchAlert = async (id, updateData) => {
    try {
        const alert = await Alert.findByPk(id);
        if (!alert) {
            throw new Error("Alert not found");
        }
        await alert.update(updateData);
        return alert;
    } catch (error) {
        throw new Error(error.message);
    }
}

export default { getAlerts, createAlert, updateAlert, deleteAlert, patchAlert };