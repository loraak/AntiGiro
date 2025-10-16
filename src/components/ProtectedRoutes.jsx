import {Navigate} from 'react-router-dom';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children, allowedRules = [] }) => {
    const isAuthenticated = authService.isAuthenticated();
    const userRole = authService.getUserRole();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (allowedRules.length > 0 && !allowedRules.includes(userRole)) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;