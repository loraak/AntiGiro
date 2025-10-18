import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children, allowedRoles = [] }) => { 
    const isAuthenticated = authService.isAuthenticated();
    const userRole = authService.getUserRole();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;