import User from "../models/users.model.js";

const createUser = async (req, res) => {
    const { name, username, password } = req.body;

    try {
        const user = await User.create({ name, username, password });
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getUserbyId = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByPk(id);
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, username, password } = req.body;

    try {
        const user = await User.findByPk(id);
        user.name = name;
        user.username = username;
        user.password = password;
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByPk(id);
        await user.destroy();
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export default { createUser, getUsers, getUserbyId, updateUser, deleteUser };

