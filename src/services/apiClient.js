const API_URL = `${process.env.REACT_APP_API_URL}`;

export const apiClient = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    try {
        const response = await fetch(`${API_URL}${url}`, config);
        const data = await response.json();

        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            
            window.location.href = '/login';
            
            throw new Error('Sesión expirada');
        }

        if (!response.ok) {
            throw new Error(data.message || 'Error en la petición');
        }

        return data;
    } catch (error) {
        throw error;
    }
};