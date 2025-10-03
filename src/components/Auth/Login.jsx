import { useState } from 'react';
import { FaEye, FaEyeSlash, FaLock, FaUser } from 'react-icons/fa';
import styles from './login.module.css';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>

                <div className={styles.card}>
                    <div className={styles.header}>
                        <h2 className={styles.title}>Inicia Sesión</h2>

                    </div>
                    <form className={styles.formContainer}>
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
                                />
                                <button
                                    type="button"
                                    onClick={togglePassword}
                                    className={styles.passwordToggle}
                                >
                                    {showPassword ? (
                                        <FaEyeSlash />
                                    ) : (
                                        <FaEye />
                                    )}
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