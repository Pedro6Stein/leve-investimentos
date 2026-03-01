import { HttpClient } from './httpClient.js';

const API_BASE_URL = 'http://localhost:3333/api';

export const api = new HttpClient(API_BASE_URL);

api.useRequestInterceptor((config) => {
    const token = localStorage.getItem('@Leve:token');
    if (token) {
        config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${token}`
        };
    }
    return config;
});

api.useResponseInterceptor((response) => {
    if (response.status === 401 && !response.url.includes('/auth/login')) {
        localStorage.removeItem('@Leve:token');
        localStorage.removeItem('@Leve:user');
        window.location.href = '/pages/login/index.html';
    }
    return response;
});