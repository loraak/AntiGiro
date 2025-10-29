import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaLock, FaUser, FaExclamationTriangle } from 'react-icons/fa';
import { authService } from '../../services/authService';
import styles from './login.module.css';
import logoImage from '../../assets/image.png';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [intentosRestantes, setIntentosRestantes] = useState(null);
    const [bloqueado, setBloqueado] = useState(false);
    const [minutosRestantes, setMinutosRestantes] = useState(null);

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIntentosRestantes(null);
        setBloqueado(false);
        setIsLoading(true);

        if (!email || !password) {
            setError('Por favor completa todos los campos');
            setIsLoading(false);
            return;
        }

        try {
            const data = await authService.login(email, password);
            const userRole = data.usuario.rol;

            if (userRole === 'admin') {
                navigate('/');
            } else if (userRole === 'tecnico') {
                navigate('/analysis');
            } else {
                navigate('/');
            }

        } catch (err) {
            console.error('Error en login:', err);
            
            if (err.response?.data) {
                const errorData = err.response.data;
                
                setError(errorData.message || 'Error al iniciar sesión');
                
                if (errorData.bloqueado) {
                    setBloqueado(true);
                    setMinutosRestantes(errorData.minutos_restantes);
                } else if (errorData.intentos_restantes !== undefined) {
                    setIntentosRestantes(errorData.intentos_restantes);
                }
            } else {
                setError(err.message || 'Error al conectar con el servidor');
            }
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
                            <div className={`${styles.errorMessage} ${bloqueado ? styles.errorBlocked : ''}`}>
                                {bloqueado && <FaExclamationTriangle className={styles.warningIcon} />}
                                <div>
                                    <p>{error}</p>
                                    {bloqueado && minutosRestantes && (
                                        <p className={styles.blockedInfo}>
                                            Tu cuenta se desbloqueará en {minutosRestantes} minuto{minutosRestantes !== 1 ? 's' : ''}.
                                        </p>
                                    )}
                                    {intentosRestantes !== null && intentosRestantes > 0 && (
                                        <p className={styles.attemptsWarning}>
                                            ⚠️ Te quedan {intentosRestantes} intento{intentosRestantes !== 1 ? 's' : ''} antes de que tu cuenta sea bloqueada.
                                        </p>
                                    )}
                                </div>
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
                                    disabled={isLoading || bloqueado}
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
                                    disabled={isLoading || bloqueado}
                                />
                                <button
                                    type="button"
                                    onClick={togglePassword}
                                    className={styles.passwordToggle}
                                    disabled={isLoading || bloqueado}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || bloqueado}
                            className={`${styles.loginButton} ${bloqueado ? styles.buttonDisabled : ''}`}
                        >
                            {isLoading ? (
                                <div className={styles.spinner}></div>
                            ) : bloqueado ? (
                                <span>Cuenta Bloqueada</span>
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