import { apiClient } from './apiClient';

export const lecturasService = { 
    getUltimaLectura: async (idContenedor) => { 
        return await apiClient(`/lecturas/contenedor/${idContenedor}/ultima`);
    },

    getAlertas: async (idContenedor) => {
        return await apiClient(`/lecturas/alertas?id_contenedor=${idContenedor}`);
    }
};