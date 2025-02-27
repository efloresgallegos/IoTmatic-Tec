import User from "../models/users.model.js";
import  jwtMethods  from "../utils/jwt.util.js";

const createUser = async (userData) => {
    const { name, username, password } = userData;

    try {
        const user = await User.create({ name, username, password });
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
};

const getUsers = async () => {
    try {
        const users = await User.findAll();
        return users;
    } catch (error) {
        throw new Error(error.message);
    }
};

const getUserById = async (id) => {
    try {
        const user = await User.findByPk(id);
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
};

const updateUser = async (id, userData) => {
    const { name, username, password } = userData;

    try {
        const user = await User.findByPk(id);
        user.name = name;
        user.username = username;
        user.password = password;
        await user.save();
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
};

const deleteUser = async (id) => {
    try {
        const user = await User.findByPk(id);
        await user.destroy();
        return { message: 'User deleted' };
    } catch (error) {
        throw new Error(error.message);
    }
};

const login = async (username, password) => {
    try {
        const user = await User.login(username, password);
        if (!user) {
            throw new Error('Invalid login');
        }
        const token = jwtMethods.createUserToken(user);

        return {user, token};
    }
    catch (error) {
        throw new Error(error.message);
    }
}

export default { createUser, getUsers, getUserById, updateUser, deleteUser, login };