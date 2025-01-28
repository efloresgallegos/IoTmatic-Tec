import usersService from "../services/users.service.js";

const createUser = async (req, res) => {
    const { name, username, password } = req.body;
    try {
        const user = await usersService.createUser({ name, username, password });
        res.status(201).json(user);
    }
    catch (error) {
        res.status(400).send(error.message);
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await usersService.getUsers();
        res.status(200).json(users);
    }
    catch (error) {
        res.status(400).send(error.message);
    }
}

const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await usersService.getUserById(id);
        res.status(200).json(user);
    }
    catch (error) {
        res.status(400).send(error.message);
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, username, password } = req.body;
    try {
        const user = await usersService.updateUser(id, { name, username, password });
        res.status(200).json(user);
    }
    catch (error) {
        res.status(400).send(error.message);
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await usersService.deleteUser(id);
        res.status(204).send();
    }
    catch (error) {
        res.status(400).send(error.message);
    }
}

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await usersService.login(username, password);
        res.status(200).json(user);
    }
    catch (error) {
        res.status(400).send(error.message);
    }
}

export default { createUser, getUsers, getUserById, updateUser, deleteUser, login};