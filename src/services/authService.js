const API_URL = 'http://localhost:3000/api/auth'; 

export const authService = { 
    login: async (correo, contrasena) => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ correo, contrasena }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al iniciar sesión');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));

        return data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
    }, 

    getToken: () => { 
        return localStorage.getItem('token');
    },

    getUsuario: () => { 
        const usuario = localStorage.getItem('usuario');
        return usuario ? JSON.parse(usuario) : null;
    }, 

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    getUserRole: () => { 
        const usuario = authService.getUsuario();
        return usuario ? usuario.rol : null;
    }, 
}; 