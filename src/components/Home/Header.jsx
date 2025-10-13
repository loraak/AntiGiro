import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import { FaArrowRightFromBracket } from 'react-icons/fa6';
import logo from '../../assets/image.png'; 

const Header = () => { 
    return (
        <header>
            <nav className={styles.header}>
                <div className={styles.logo}>
                    <Link to="/">
                    <img src={logo} alt="Logo" />
                    </Link> 
                </div>
                <div className={styles.links}> 
                    <Link to="/register">
                        Usuarios
                    </Link>
                    <Link to="/analysis">
                        Análisis de Datos
                    </Link>
                    <Link to="/configuration">
                        Dispositivo
                    </Link>
                    <Link to="/reports"> 
                        Reportes
                    </Link>
                </div>
                <button className={styles.logoutButton}><FaArrowRightFromBracket/></button>
            </nav>
        </header>
    )
}

export default Header;