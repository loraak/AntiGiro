import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import { FaArrowRightFromBracket, FaUser } from 'react-icons/fa6';
import { authService } from '../../services/authService';
import logoImage from '../../assets/image.png';
import Swal from 'sweetalert2'; 

const Header = () => {
    const navigate = useNavigate();
    const usuario = authService.getUsuario();
    const userRole = authService.getUserRole();
    const isAdmin = userRole === 'admin';
    const isTecnico = userRole === 'tecnico';

    const handleLogout = () => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Tu sesión actual se cerrará.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#629460',
            cancelButtonColor: '#D52D3E',
            confirmButtonText: 'Sí, ¡cerrar sesión!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                authService.logout();
                navigate('/login');
            }
        });
    };

    return (
        <header>
            <nav className={styles.header}>
                <div className={styles.logo}>
                    <img src={logoImage} alt="Anti-Giro Logo" />
                </div>
                
                <div className={styles.links}> 
                    {/* Solo admin puede ver Usuarios */}
                    {isAdmin && (
                        <Link to="/register">
                            Usuarios
                        </Link>
                    )}
                    
                    {/* Admin y técnico pueden ver Análisis de Datos */}
                    {(isAdmin || isTecnico) && (
                        <Link to="/analysis">
                            Análisis de Datos
                        </Link>
                    )}
                    
                    {/* Solo admin puede ver Dispositivo */}
                    {isAdmin && (
                        <Link to="/configuration">
                            Dispositivo
                        </Link>
                    )}
                    
                    {/* Admin y técnico pueden ver Reportes */}
                    {(isAdmin || isTecnico) && (
                        <Link to="/reports">
                            Reportes
                        </Link>
                    )}
                </div>
                
                <div className={styles.userSection}>
                    <div className={styles.userInfo}>
                        <FaUser className={styles.userIcon} />
                        <span className={styles.userName}>{usuario?.nombre}</span>
                    </div>
                    <button 
                        className={styles.logoutButton}
                        onClick={handleLogout}
                        title="Cerrar sesión"
                    >
                        <FaArrowRightFromBracket/>
                    </button>
                </div>
            </nav>
        </header>
    );
}

export default Header;