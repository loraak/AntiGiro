import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Home/Header';
import Home from './components/Home/Home';
import Register from './components/Interfaces/Admin/Register';
import Configuration from './components/Interfaces/Configuration';
import Analysis from './components/Interfaces/Analysis';
import Reports from './components/Interfaces/Reports';
import Login from './components/Auth/Login';
import ProtectedRoute from './components/ProtectedRoutes'; 
import { authService } from './services/authService';

function AppContent() {
  const location = useLocation();
  const showHeader = location.pathname !== '/login';

  return (
    <div className="App">
      {showHeader && <Header />}
      <Routes> 
        {/* Ruta pública de login */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas - Cualquier usuario autenticado */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />

        {/* Rutas solo para ADMIN */}
        <Route 
          path="/register" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Register />
            </ProtectedRoute>
          } 
        />

        {/* Rutas para ADMIN y TECNICO */}
        <Route 
          path="/analysis" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'tecnico']}>
              <Analysis />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'tecnico']}>
              <Reports />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/configuration" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'tecnico']}>
              <Configuration />
            </ProtectedRoute>
          } 
        />

        {/* Redirigir según autenticación */}
        <Route 
          path="*" 
          element={
            authService.isAuthenticated() 
              ? <Navigate to="/" replace /> 
              : <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </div>
  );
}

function App() { 
  return ( 
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;