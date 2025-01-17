import {api} from "./api.config";

const apiService = {
    get(url) {
        return api.get(url).then(response => response.data);
    },
    post(url, data) {
        return api.post(url, data).then(response => response.data);
    },
    put(url, data) {
        return api.put(url, data).then(response => response.data);
    },
    delete(url) {
        return api.delete(url).then(response => response.data);
    },
    postData(url, data) {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };
        return api.post(url, data, config).then(response => response.data);
    },
    patch(url, data) {
        return api.patch(url, data).then(response => response.data);
    }
}

export default apiService;
