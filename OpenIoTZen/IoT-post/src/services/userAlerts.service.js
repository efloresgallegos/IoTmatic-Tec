import userAlerts from '../models/userAlerts.model.js';
import User from '../models/users.model.js';
import Alert from '../models/alerts.model.js';

const getUserAlerts = async () => {
    try {
        return await userAlerts.findAll();
    } catch (error) {
        throw new Error(error.message);
    }
}

const createUserAlert = async (alertData) => {
    try {
        const user = await User.findByPk(alertData.user_id);
        if (!user) {
            throw new Error("User not found");
        }
        const alert = await Alert.findByPk(alertData.alert_id);
        if (!alert) {
            throw new Error("Alert not found");
        }
        return await userAlerts.create(alertData);
    } catch (error) {
        throw new Error(error.message);
    }
}

const updateUserAlert = async (id, updateData) => {
    try {
        const alert = await userAlerts.findByPk(id);
        if (!alert) {
            throw new Error("Alert not found");
        }
        await alert.update(updateData);
        return alert;
    } catch (error) {
        throw new Error(error.message);
    }
}

const deleteUserAlert = async (id) => {
    try {
        const alert = await userAlerts.findByPk(id);
        if (!alert) {
            throw new Error("Alert not found");
        }
        await alert.destroy();
    } catch (error) {
        throw new Error(error.message);
    }
}

const patchUserAlert = async (id, updateData) => {
    try {
        const alert = await userAlerts.findByPk(id);
        if (!alert) {
            throw new Error("Alert not found");
        }
        await alert.update(updateData);
        return alert;
    } catch (error) {
        throw new Error(error.message);
    }
}

const getUserAlertsfromUser = async (user_id) => {
    try {
        return await userAlerts.findAll({
            where: {
                user_id: user_id
            }
        });
    } catch (error) {
        throw new Error(error.message);
    }
}

const getUserAlertsfromAlert = async (alert_id) => {
    try {
        return await userAlerts.findAll({
            where: {
                alert_id: alert_id
            }
        });
    } catch (error) {
        throw new Error(error.message);
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