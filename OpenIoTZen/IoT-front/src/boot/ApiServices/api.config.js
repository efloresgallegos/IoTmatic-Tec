import axios from 'axios';

const url = 'http://localhost:3000';
// const url = 'https://2g4tp0th-5000.usw3.devtunnels.ms/';
const api = axios.create({
    baseURL: `${url}/api/`,
    timeout: 10000, // 10 segundos de timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: false // Cambiado a false para evitar problemas de CORS
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
        console.error('Error en la solicitud:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        if (error.code === 'ERR_NETWORK') {
            console.error('Error de red - El servidor no está respondiendo');
            // Aquí podrías mostrar un mensaje al usuario
        } else if (error.response && error.response.status === 401) {
            console.error('Error de autenticación');
            alert('Sesión expirada o inválida. Por favor, inicie sesión nuevamente.');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export { api, url };

