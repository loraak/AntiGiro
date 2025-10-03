import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import { FaArrowRightFromBracket } from 'react-icons/fa6';

const Header = () => { 
    return (
        <header>
            <nav className={styles.header}>
                <div className={styles.logo}>
                    <h1>Anti-Giro</h1>
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
                    {/*Estas pantallas son de Edén.*/}
                    <Link to="/register"> 
                        Reportes
                    </Link>
                </div>
                <button className={styles.logoutButton}><FaArrowRightFromBracket/></button>
            </nav>
        </header>
    )
}

export default Header;