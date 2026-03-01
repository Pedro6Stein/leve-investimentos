import { HttpClient } from '../../shared/api/httpClient.js';

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

/**
 * Response Interceptor: Tratamento Global de Erros de Autenticação (401)
 * Se o back-end rejeitar a chamada por token inválido/expirado, limpamos a sessão
 * e redirecionamos para o login*/

api.useResponseInterceptor((response) => {
    if (response.status === 401) {
        console.warn('[Auth] Sessão expirada ou token inválido. A redirecionar...');
        
        // Limpeza de sessão
        localStorage.removeItem('@Leve:token');
        localStorage.removeItem('@Leve:user');
        //caminho
        window.location.href = '../auth/index.html';
    }
    
    return response;
});