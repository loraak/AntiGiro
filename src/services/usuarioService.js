import {authService } from './authService'; 

const API_URL = 'http://localhost:3000/api/usuarios';

export const usuariosService = { 
    getAll: async () => { 
        const token = authService.getToken(); 

        const response = await fetch(API_URL, { 
            method: 'GET', 
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            }
        }); 

        const data = await response.json(); 

        if (!response.ok) { 
            throw new Error(data.message || 'Error obteniendo usuarios'); 
        }

        return data; 
    }, 

    //Usuario por ID. 
    getById: async (id) => {
        const token = authService.getToken();
        
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error obteniendo usuario');
        }

        return data;
    },

    create: async (userData) => {
        const token = authService.getToken();
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error creando usuario');
        }

        return data;
    },

    update: async (id, userData) => {
        const token = authService.getToken();
        
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error actualizando usuario');
        }

        return data;
    },

    // Eliminar usuario
    delete: async (id) => {
        const token = authService.getToken();
        
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error eliminando usuario');
        }

        return data;
    }
}