import axios from 'axios';

/**
 * Instância centralizada do Axios.
 * Configura o baseURL para evitar hardcoded em todas as páginas.
 */
const api = axios.create({
    baseURL: '/api', // Como o servidor serve o front, o prefixo relativo funciona
});

/**
 * Helper para definir o token de autorização globalmente
 * @param {string|null} token 
 */
export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export default api;
