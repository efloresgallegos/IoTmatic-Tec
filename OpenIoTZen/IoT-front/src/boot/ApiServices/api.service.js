import {api} from "./api.config";

const apiService = {
    get(url) {
        return api.get(url).then(response => ({ data: response.data, status: response.status }));
    },
    post(url, data) {
        return api.post(url, data).then(response => ({ data: response.data, status: response.status }));
    },
    put(url, data) {
        return api.put(url, data).then(response => ({ data: response.data, status: response.status }));
    },
    delete(url) {
        return api.delete(url).then(response => ({ data: response.data, status: response.status }));
    },
    postData(url, data) {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };
        return api.post(url, data, config).then(response => ({ data: response.data, status: response.status }));
    },
    patch(url, data) {
        return api.patch(url, data).then(response => ({ data: response.data, status: response.status }));
    }
}

export default apiService;
