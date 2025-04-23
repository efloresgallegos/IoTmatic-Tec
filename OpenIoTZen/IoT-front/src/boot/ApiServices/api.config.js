import axios from 'axios';

const url = 'http://localhost:3000/';
// const url = 'https://2g4tp0th-5000.usw3.devtunnels.ms/';
const api = axios.create({
    baseURL: `${url}api/` 
});

api.interceptors.request.use(
    function (config) {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `${token}`;
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        if (error.response && error.response.status === 401) {
            alert('Sesión expirada o invalida. Por favor, inicie sesión nuevamente.');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export { api, url };

