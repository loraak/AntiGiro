import { useState } from 'react';
import styles from './AddUser.module.css';
import { IoClose } from 'react-icons/io5';
import { usuariosService } from '../../../services/usuarioService';

const AddUser = ({ isOpen, onClose, onUserAdded }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        contrasena: '',
        rol: 'tecnico'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isClosing, setIsClosing] = useState(false);

    if (!isOpen && !isClosing) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'nombre' ? value.toUpperCase() : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!formData.nombre.trim()) {
            setError('El nombre es requerido');
            setIsLoading(false);
            return;
        }

        if (!formData.correo.trim()) {
            setError('El correo es requerido');
            setIsLoading(false);
            return;
        }

        if (!formData.contrasena || formData.contrasena.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            setIsLoading(false);
            return;
        }

        const specialCharRegex = /[!@#$%^&*()_+-=[\]{};':"|,.<>/?]/;
        if (!specialCharRegex.test(formData.contrasena)) {
            setError('La contraseña debe contener al menos un carácter especial (!@#$%^&*...)');
            setIsLoading(false);
            return;
        }

        try {
            await usuariosService.create(formData);
            
            setFormData({
                nombre: '',
                correo: '',
                contrasena: '',
                rol: 'tecnico'
            });
            
            if (onUserAdded) {
                onUserAdded();
            }
            
            handleClose();
        } catch (err) {
            setError(err.message || 'Error al crear usuario');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setFormData({
                nombre: '',
                correo: '',
                contrasena: '',
                rol: 'tecnico'
            });
            setError('');
            setIsClosing(false);
            onClose();
        }, 300); 
    };

    return (
        <div 
            className={`${styles.modalOverlay} ${isClosing ? styles.closing : ''}`} 
            onClick={handleClose}
        >
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button onClick={handleClose} className={styles.closeButton}>
                    <IoClose />
                </button>

                <h2 className={styles.modalTitle}>Nuevo Usuario</h2>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nombre Completo</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Ej. Anthony Tenna"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Correo Electrónico</label>
                        <input
                            type="email"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Ej. tenna@gmail.com"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Contraseña</label>
                        <input
                            type="password"
                            name="contrasena"
                            value={formData.contrasena}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Mínimo 8 caracteres con un carácter especial"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Rol </label> 
                        <select
                            name="rol"
                            value={formData.rol}
                            onChange={handleChange}
                            className={styles.select}
                            required
                        >
                            <option value="tecnico">Técnico</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    <div className={styles.buttonContainer}>
                        <button
                            type="submit"
                            className={styles.saveButton}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Guardando...' : 'Guardar Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUser;