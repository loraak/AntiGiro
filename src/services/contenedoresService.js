import { apiClient } from './apiClient';

export const contenedoresService = { 
    getAll: async () => { 
        return await apiClient('/contenedores', {
            method: 'GET'
        }); 
    }, 

    getById: async (idUsuario) => { 
        return await apiClient(`/contenedores/usuario/${idUsuario}`, { 
            method: 'GET'
        }); 
    }, 

    create: async (contenedorData) => { 
        return await apiClient('/contenedores', { 
            method: 'POST', 
            body: JSON.stringify(contenedorData) 
        }); 
    }, 

    update: async (id, contenedorData) => { 
        return await apiClient(`/contenedores/${id}`, { 
            method: 'PUT', 
            body: JSON.stringify(contenedorData)
        }); 
    }, 

    delete: async (id) => { 
        return await apiClient(`/contenedores/${id}`, { 
            method: 'DELETE' 
        }); 
    }
}; 