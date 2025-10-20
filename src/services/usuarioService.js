import { apiClient } from './apiClient';

export const usuariosService = { 
    getAll: async () => { 
        return await apiClient('/usuarios', { 
            method: 'GET'
        }); 
    }, 

    getById: async (id) => {
        return await apiClient(`/usuarios/${id}`, {
            method: 'GET'
        });
    },

    create: async (userData) => {
        return await apiClient('/usuarios', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    update: async (id, userData) => {
        return await apiClient(`/usuarios/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    },

    delete: async (id) => {
        return await apiClient(`/usuarios/${id}`, {
            method: 'DELETE'
        });
    }
};