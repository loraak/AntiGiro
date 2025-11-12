import {authService} from './authService'; 

const API_URL = `${process.env.REACT_APP_API_URL}/lecturas`;

export const lecturasService = { 
    getUltimaLectura: async(idContenedor) => { 
        const token = authService.getToken(); 

        const response = await fetch(`${API_URL}/contenedor/${idContenedor}/ultima`, {
            method: 'GET', 
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}`
            }
        }); 

        const data = await response.json(); 

        if (!response.ok) { 
            throw new Error (data.message || 'Error obteniendo última lectura'); 
        }
        return data; 
    },
    getAlertas: async (idContenedor) => {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/alertas?id_contenedor=${idContenedor}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error obteniendo alertas');
        }
        
        return data;
    }
}