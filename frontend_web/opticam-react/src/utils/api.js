import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios con configuracion base
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 30000
});

// INTERCEPTOR DE SOLICITUD (Request)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('Interceptor - Token existe:', token ? 'SI' : 'NO');
        console.log('Interceptor - URL:', config.url);
        console.log('Interceptor - Método:', config.method);
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Interceptor - Authorization:', config.headers.Authorization);
        } else {
            console.warn('Interceptor - No hay token en localStorage');
        }
        
        console.log('Interceptor - Headers finales:', config.headers);
        return config;
    },
    (error) => {
        console.error('Error en interceptor de request:', error);
        return Promise.reject(error);
    }
);

// INTERCEPTOR DE RESPUESTA (Response)
api.interceptors.response.use(
    (response) => {
        console.log('Respuesta exitosa:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('Error en respuesta:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Config:', error.config);
        
        if (error.response) {
            const { status, data } = error.response;
            
            if (status === 401) {
                console.warn('Token expirado o invalido. Cerrando sesion...');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (!window.location.pathname.includes('/login') && 
                    !window.location.pathname.includes('/register')) {
                    window.location.href = '/login';
                }
            }
            
            if (status === 403) {
                console.warn('Acceso denegado. No tienes permisos para esta accion.');
            }
            
            if (status >= 500) {
                console.error('Error del servidor:', data?.message || 'Error interno del servidor');
            }
        } else if (error.request) {
            console.error('Error de red:', error.message);
        } else {
            console.error('Error al configurar la peticion:', error.message);
        }
        
        return Promise.reject(error);
    }
);

// FUNCIONES AUXILIARES PARA PETICIONES
export const get = async (url, params = {}) => {
    try {
        const response = await api.get(url, { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const post = async (url, data = {}) => {
    try {
        const response = await api.post(url, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const put = async (url, data = {}) => {
    try {
        const response = await api.put(url, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const patch = async (url, data = {}) => {
    try {
        const response = await api.patch(url, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const del = async (url) => {
    try {
        const response = await api.delete(url);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default api;