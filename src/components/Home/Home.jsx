import { FaUser } from 'react-icons/fa';
import { BsClipboardData } from "react-icons/bs";
import { IoIosSettings } from "react-icons/io";
import { GoGraph } from "react-icons/go";
import styles from './Home.module.css';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';

const Home = () => {
    const usuario = authService.getUsuario();
    const userRole = authService.getUserRole();
    const isAdmin = userRole === 'admin';
    const isTecnico = userRole === 'tecnico';

    return ( 
        <div className={styles.container}>
            {/* Banner de bienvenida */}
            <div className={styles.banner}>
                <div className={styles.bannerOverlay}></div>
                <div className={styles.bannerContent}>
                    <h1 className={styles.bannerTitle}>Anti-Giro</h1>
                    <p className={styles.bannerSubtitle}>
                        Bienvenido, {usuario?.nombre}
                    </p>
                </div>
            </div>

            {/* Sección de íconos navegables */}
            <div className={styles.cardsSection}>
                <div className={styles.cardsGrid}>
                    {/* Usuarios - Solo Admin */}
                    {isAdmin && (
                        <Link to="/register" className={styles.cardLink}>
                            <div className={styles.card}>
                                <div className={styles.cardContent}>
                                    <div className={`${styles.iconWrapper} ${styles.iconWrapperBlue}`}>
                                        <FaUser className={styles.icon}/>
                                    </div>
                                    <h3 className={styles.cardTitle}>Usuarios</h3>
                                    <p className={styles.cardDescription}>Gestión de usuarios del sistema</p>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Análisis de Datos - Admin y Técnico */}
                    {(isAdmin || isTecnico) && (
                        <Link to="/analysis" className={styles.cardLink}>
                            <div className={styles.card}>
                                <div className={styles.cardContent}>
                                    <div className={`${styles.iconWrapper} ${styles.iconWrapperGreen}`}>
                                        <GoGraph className={styles.icon} />
                                    </div>
                                    <h3 className={styles.cardTitle}>Análisis de Datos</h3>
                                    <p className={styles.cardDescription}>Visualización y estadísticas</p>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Dispositivo - Solo Admin */}
                    {(isAdmin || isTecnico) && (
                        <Link to="/configuration" className={styles.cardLink}>
                            <div className={styles.card}>
                                <div className={styles.cardContent}>
                                    <div className={`${styles.iconWrapper} ${styles.iconWrapperPurple}`}>
                                        <IoIosSettings className={styles.icon} />
                                    </div>
                                    <h3 className={styles.cardTitle}>Dispositivo</h3>
                                    <p className={styles.cardDescription}>Configuración del sistema</p>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Reportes - Admin y Técnico */}
                    {(isAdmin || isTecnico) && (
                        <Link to="/reports" className={styles.cardLink}>
                            <div className={styles.card}>
                                <div className={styles.cardContent}>
                                    <div className={`${styles.iconWrapper} ${styles.iconWrapperOrange}`}>
                                        <BsClipboardData className={styles.icon} />
                                    </div>
                                    <h3 className={styles.cardTitle}>Reportes</h3>
                                    <p className={styles.cardDescription}>Generación de informes</p>
                                </div>
                            </div>
                        </Link>
                    )}

                </div>
            </div>
        </div>
    );
}

export default Home;