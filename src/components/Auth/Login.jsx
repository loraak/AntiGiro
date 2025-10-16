import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaLock, FaUser } from 'react-icons/fa';
import { authService } from '../../services/authService';
import styles from './login.module.css';
import logoImage from '../../assets/image.png'; // <-- 1. Importa la imagen

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await authService.login(email, password);
            console.log('Login exitoso:', data);
            const userRole = data.usuario.rol;

            if (userRole === 'admin') {
                navigate('/');
            } else if (userRole === 'tecnico') {
                navigate('/analysis');
            } else {
                navigate('/');
            }

        } catch (err) {
            setError(err.message || 'Error al conectar con el servidor');
            console.error('Error en login:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <img 
                    src={logoImage} 
                    alt="Logo AntiGiro" 
                    className={styles.logoImage} 
                />
                <div className={styles.card}>
                    <div className={styles.header}>
                        <h2 className={styles.title}>Inicia Sesión</h2>
                    </div>
                    <form className={styles.formContainer} onSubmit={handleSubmit}>
                        {error && (
                            <div className={styles.errorMessage}>
                                {error}
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.label}>
                                Correo electrónico:
                            </label>
                            <div className={styles.inputContainer}>
                                <div className={styles.inputIcon}>
                                    <FaUser/>
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles.input}
                                    placeholder="empleado@gmail.com"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password" className={styles.label}>
                                Contraseña:
                            </label>
                            <div className={styles.inputContainer}>
                                <div className={styles.inputIcon}>
                                    <FaLock/>
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`${styles.input} ${styles.passwordInput}`}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={togglePassword}
                                    className={styles.passwordToggle}
                                    disabled={isLoading}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={styles.loginButton}
                        >
                            {isLoading ? (
                                <div className={styles.spinner}></div>
                            ) : (
                                <span>Iniciar Sesión</span>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;